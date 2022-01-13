import * as React from 'react';
import { bindActionCreators, Action } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Link } from 'react-router-dom';
import {
  IconButton,
  Dropdown,
  IColumn,
  DetailsList,
  SelectionMode,
  DetailsRow,
  ScrollablePane,
  Sticky,
  StickyPositionType,
  Pivot,
  PivotItem,
  IDropdownStyles
} from 'office-ui-fabric-react';
import {
  ChartControl,
  ChartType
} from '@pnp/spfx-controls-react/lib/ChartControl';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

import { IAlarmsPortalAppState } from '../../../store/ConfigureStore';
import {
  IAlertInfo,
  AlarmsPortalActionCreators
} from './../../../controllers/AlarmsPortalController';
import {
  IPortalViewProps,
  IPortalViewState,
  PortalViewMode
} from './PortalView.types';

import {
  filter,
  find,
  isEqual,
  groupBy,
  isEmpty,
  remove,
  cloneDeep
} from 'lodash';
import { v1 } from 'uuid';
import { AlertType } from '../../../controllers/AlarmsPortalController/AlarmsPortalController.types';

const dropdownStyles = {
  root: { flex: 1, paddingLeft: 8, paddingRight: 8 },
  dropdown: {
    borderColor: '#edebe9',
    boxShadow:
      '0px 3px 12px 0px rgba(0, 0, 0, .07), 4px 4px 5px 0px rgba(0, 0, 0, .07)'
  },
  title: {
    borderColor: '#edebe9'
  },
  label: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8
  }
};

export class PortalViewComponent extends React.Component<
  IPortalViewProps,
  IPortalViewState
> {
  constructor(props: IPortalViewProps) {
    super(props);

    this.state = {
      alertColumns: [],
      alertTypeData: null,
      agencyAlertData: [],
      snmpAlerts: [],
      nodesDownAlerts: [],
      mapBounds: null,
      map: null,
      currentMode: PortalViewMode.All
    };
  }

  public render(): React.ReactElement<IPortalViewProps> {
    const { alertColumns, alertTypeData, agencyAlertData } = this.state;
    const {
      filteredAlerts,
      googleMapsApiKey,
      currentFilters,
      siteOptions,
      agencyOptions,
      regionOptions,
      equipmentTypeOptions,
      priorityOptions
    } = this.props;

    return (
      <div>
        <div
          key={v1()}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            marginLeft: -8,
            marginRight: -8,
            marginBottom: 24
          }}
        >
          <Dropdown
            label='Region'
            options={regionOptions}
            selectedKey={
              find(currentFilters, ['key', 'region'])
                ? find(currentFilters, ['key', 'region']).value
                : ''
            }
            onChange={(event, option) => {
              this.onFilterAlerts('region', option.text);
            }}
            styles={dropdownStyles as IDropdownStyles}
          />
          <Dropdown
            label='Site'
            options={siteOptions}
            selectedKey={
              find(currentFilters, ['key', 'site'])
                ? find(currentFilters, ['key', 'site']).value
                : ''
            }
            onChange={(event, option) => {
              this.onFilterAlerts('site', option.text);
            }}
            styles={dropdownStyles as IDropdownStyles}
          />
          <Dropdown
            label='Agency'
            options={agencyOptions}
            selectedKey={
              find(currentFilters, ['key', 'agency'])
                ? find(currentFilters, ['key', 'agency']).value
                : ''
            }
            onChange={(event, option) => {
              this.onFilterAlerts('agency', option.text);
            }}
            styles={dropdownStyles as IDropdownStyles}
          />
          <Dropdown
            label='Equipment type'
            options={equipmentTypeOptions}
            selectedKey={
              find(currentFilters, ['key', 'equipmentType'])
                ? find(currentFilters, ['key', 'equipmentType']).value
                : ''
            }
            onChange={(event, option) => {
              this.onFilterAlerts('equipmentType', option.text);
            }}
            styles={dropdownStyles as IDropdownStyles}
          />
          <Dropdown
            label='Priority'
            options={priorityOptions}
            selectedKey={
              find(currentFilters, ['key', 'priority'])
                ? find(currentFilters, ['key', 'priority']).value
                : ''
            }
            onChange={(event, option) => {
              this.onFilterAlerts('priority', option.text);
            }}
            styles={dropdownStyles as IDropdownStyles}
          />
          <div style={{ paddingLeft: 8, paddingRight: 8 }}>
            <IconButton
              iconProps={{ iconName: 'ClearFilter' }}
              onClick={() => {
                this.props.alarmsPortalActionCreators.filterAlerts([
                  {
                    key: 'region',
                    value: 'All'
                  },
                  {
                    key: 'site',
                    value: 'All'
                  },
                  {
                    key: 'agency',
                    value: 'All'
                  },
                  {
                    key: 'equipmentType',
                    value: 'All'
                  },
                  {
                    key: 'priority',
                    value: 'All'
                  }
                ]);
              }}
            />
          </div>
        </div>
        <div>Last synced: {this.props.lastSyncedDateTime}</div>
        <div
          style={{ display: 'flex', marginTop: 48, alignItems: 'flex-start' }}
        >
          <div
            style={{
              flex: 4,
              position: 'relative',
              paddingRight: 24
            }}
          >
            <h2>Alerts</h2>
            <Pivot
              selectedKey={String(this.state.currentMode)}
              onLinkClick={this.onLinkClick}
            >
              <PivotItem
                headerText={'All'}
                itemKey={String(PortalViewMode.All)}
              ></PivotItem>
              <PivotItem
                headerText={'Alarms'}
                itemKey={String(PortalViewMode.SNMP)}
              ></PivotItem>
              <PivotItem
                headerText={'Nodes Down'}
                itemKey={String(PortalViewMode.NODES)}
              ></PivotItem>
            </Pivot>
            <div
              style={{
                width: '100%',
                height: '30vh',
                position: 'relative',
                marginBottom: 48
              }}
            >
              <ScrollablePane>
                <DetailsList
                  columns={alertColumns}
                  // items={this.setViewItems(this.state.currentMode)}
                  items={this.props.filteredAlerts}
                  selectionMode={SelectionMode.none}
                  onRenderRow={this.onRenderRow}
                  onRenderDetailsHeader={(props, defaultRender) => {
                    if (!props) {
                      return null;
                    }
                    return (
                      <Sticky
                        stickyPosition={StickyPositionType.Header}
                        isScrollSynced
                      >
                        {defaultRender!({
                          ...props,
                          styles: {
                            root: { paddingTop: 0 }
                          }
                        })}
                      </Sticky>
                    );
                  }}
                />
              </ScrollablePane>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '50%' }}>
                <h2 style={{ marginBottom: 24 }}>Total alerts per agency</h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    paddingRight: 18
                  }}
                >
                  {!isEmpty(agencyAlertData) &&
                    agencyAlertData.map((data, index) => {
                      return (
                        <div key={v1()} style={{ width: '50%' }}>
                          <div style={{ maxWidth: 250, margin: '0 auto' }}>
                            <ChartControl
                              key={v1()}
                              type={ChartType.Doughnut}
                              data={data}
                              options={{
                                legend: {
                                  display: true,
                                  position: 'bottom',
                                  fullWidth: true,
                                  labels: {
                                    boxWidth: 15
                                  }
                                },
                                title: {
                                  display: true,
                                  text: data.datasets[0].label
                                },
                                cutoutPercentage: 70,
                                responsive: true,
                                aspectRatio: 1,
                                animation: {
                                  duration: 0
                                },
                                hover: {
                                  animationDuration: 0
                                },
                                responsiveAnimationDuration: 0
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              {!isEmpty(alertTypeData) && (
                <div style={{ width: '50%', paddingLeft: 18 }}>
                  <h2 style={{ marginBottom: 24 }}>Alerts by type</h2>
                  <div style={{ maxWidth: 450, margin: '0 auto' }}>
                    <ChartControl
                      key={v1()}
                      type={ChartType.Doughnut}
                      data={alertTypeData}
                      options={{
                        legend: {
                          display: true,
                          position: 'bottom',
                          fullWidth: true,
                          labels: {
                            boxWidth: 15
                          }
                        },
                        title: {
                          display: false,
                          text: 'Alerts by type'
                        },
                        cutoutPercentage: 70,
                        responsive: true,
                        aspectRatio: 1,
                        animation: {
                          duration: 0
                        },
                        hover: {
                          animationDuration: 0
                        },
                        responsiveAnimationDuration: 0
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 2 }}>
            <h2 style={{ marginBottom: 24 }}>Alerts by location</h2>
            <div
              style={{
                width: '100%',
                height: 0,
                paddingBottom: ' 150%',
                position: 'relative'
              }}
            >
              <LoadScript
                googleMapsApiKey={
                  googleMapsApiKey
                    ? googleMapsApiKey
                    : 'AIzaSyA7rHPGJf10wKD6TTzmtzBZmiKPR4Nv81k'
                }
              >
                {!isEmpty(filteredAlerts) && (
                  <GoogleMap
                    options={{
                      streetViewControl: false
                    }}
                    mapContainerStyle={{
                      width: '100%',
                      position: 'absolute',
                      top: 0,
                      bottom: 0
                    }}
                    onLoad={(map) => {
                      const mapBounds = new google.maps.LatLngBounds();
                      filteredAlerts.forEach((alert) => {
                        mapBounds.extend({
                          lat: alert.latLng.lat,
                          lng: alert.latLng.lng
                        });
                      });
                      map.fitBounds(mapBounds);
                      this.setState({
                        map,
                        mapBounds
                      });
                    }}
                  >
                    {filteredAlerts.map((alert) => {
                      return (
                        <Marker
                          position={{
                            lat: alert.latLng.lat,
                            lng: alert.latLng.lng
                          }}
                        />
                      );
                    })}
                  </GoogleMap>
                )}
              </LoadScript>
            </div>
          </div>
        </div>
      </div>
    );
  }

  public componentDidMount() {
    this.initPortalView();
  }

  public componentDidUpdate(
    prevProps: IPortalViewProps,
    prevState: IPortalViewState
  ) {
    if (prevProps.isInit !== this.props.isInit && this.props.isInit) {
      this.initPortalView();
    }

    if (!isEqual(prevProps.filteredAlerts, this.props.filteredAlerts)) {
      const alertTypeData = this.getAlertTypeData(
        cloneDeep(this.props.filteredAlerts)
      );
      const agencyAlertData = this.getAgencyAlertData(
        cloneDeep(this.props.filteredAlerts)
      );
      const snmpAlerts = filter(this.props.filteredAlerts, [
        'spListId',
        this.props.snmpListId
      ]);
      const nodesDownAlerts = filter(this.props.filteredAlerts, [
        'spListId',
        this.props.nodeDownListId
      ]);

      if (this.state.map) {
        const mapBounds = new google.maps.LatLngBounds();
        this.props.filteredAlerts.forEach((alert) => {
          if (alert.latLng.lat && alert.latLng.lng) {
            mapBounds.extend({
              lat: alert.latLng.lat,
              lng: alert.latLng.lng
            });
          }
        });
        this.state.map.fitBounds(mapBounds);
        this.setState({
          mapBounds,
          alertTypeData,
          agencyAlertData,
          snmpAlerts: [...snmpAlerts],
          nodesDownAlerts: [...nodesDownAlerts]
        });
      } else {
        this.setState({
          alertTypeData,
          agencyAlertData,
          snmpAlerts: [...snmpAlerts],
          nodesDownAlerts: [...nodesDownAlerts]
        });
      }
    }
  }

  private onFilterAlerts(filterKey, filterValue) {
    const { currentFilters } = this.props;
    const existingFilter = find(currentFilters, ['key', filterKey]);
    let newFilters = currentFilters;

    if (existingFilter) {
      newFilters = remove(currentFilters, (f) => {
        return f.key !== filterKey;
      });
    }

    newFilters.push({
      key: filterKey,
      value: filterValue
    });

    this.props.alarmsPortalActionCreators.filterAlerts(newFilters);
  }

  private initPortalView() {
    const alertColumns: IColumn[] = [
      {
        key: 'device',
        name: 'Device',
        fieldName: 'device',
        minWidth: 150,
        maxWidth: 200
      },
      {
        key: 'priority',
        name: 'Priority',
        fieldName: 'priority',
        minWidth: 50,
        maxWidth: 50
      },
      {
        key: 'faultType',
        name: 'Fault type',
        fieldName: 'faultType',
        minWidth: 200,
        maxWidth: 250
      },
      {
        key: 'site',
        name: 'Location',
        fieldName: 'site',
        minWidth: 200,
        maxWidth: 250
      },
      {
        key: 'timeTriggered',
        name: 'Time triggered',
        fieldName: 'timeTriggered',
        minWidth: 100,
        maxWidth: 150
      }
    ];

    const alertTypeData = this.getAlertTypeData(this.props.filteredAlerts);
    const agencyAlertData = this.getAgencyAlertData(this.props.filteredAlerts);

    const snmpAlerts = filter(this.props.filteredAlerts, [
      'spListId',
      this.props.snmpListId
    ]);
    const nodesDownAlerts = filter(this.props.filteredAlerts, [
      'spListId',
      this.props.nodeDownListId
    ]);

    this.setState({
      alertColumns,
      alertTypeData,
      agencyAlertData,
      snmpAlerts,
      nodesDownAlerts
    });
  }

  private getAlertTypeData(alerts: IAlertInfo[]) {
    const equipmentTypes = groupBy(alerts, 'equipmentType');
    const labels = [];
    const data = [];

    Object.keys(equipmentTypes).forEach((type) => {
      labels.push(type);
      data.push(equipmentTypes[type].length);
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Alerts by type',
          backgroundColor: [
            '#364b9a',
            '#4a7bb7',
            '#6ea6ce',
            '#98cae1',
            '#c2e4f0',
            '#e2edcd',
            '#ede3cd',
            '#feda8b',
            '#feb467',
            '#f67e4b',
            '#dd3d2d',
            '#a50026'
          ],
          data
        }
      ]
    };

    return chartData;
  }

  private getAgencyAlertData(alerts: IAlertInfo[]) {
    const agencies = groupBy(alerts, 'agency');
    const agencyAlertData = [];
    const keys = Object.keys(agencies);

    keys.forEach((agency) => {
      agencyAlertData.push({
        labels: [agency, 'Others'],
        datasets: [
          {
            label: agency,
            backgroundColor: ['#4a7bb7', '#60c499'],
            data: [
              agencies[agency].length,
              alerts.length - agencies[agency].length
            ]
          }
        ]
      });
    });

    return agencyAlertData;
  }

  private onRenderRow = (props) => {
    if (props) {
      return (
        <Link
          to={`/node/${props.item.nodeName}/alerts/${props.item.id}`}
          style={{ textDecoration: 'none' }}
        >
          <DetailsRow {...props} styles={{ root: { cursor: 'pointer' } }} />
        </Link>
      );
    }

    return null;
  }

  private onLinkClick = (item:PivotItem) => {
    let currentMode;

    switch (item.props.itemKey) {
      case String(PortalViewMode.SNMP):
        currentMode = PortalViewMode.SNMP;
        this.onFilterAlerts('alertType', AlertType.Alarm);
        break;
      case String(PortalViewMode.NODES):
        currentMode = PortalViewMode.NODES;
        this.onFilterAlerts('alertType', AlertType.NodeDown);
        break;
      case String(PortalViewMode.All):
      default:
        currentMode = PortalViewMode.All;
        const { currentFilters } = this.props;
        const existingFilter = filter(currentFilters, ['key', 'alertType']);
        let newFilters = currentFilters;
        if (existingFilter) {
          newFilters = remove(currentFilters, (f) => {
            return f.key !== 'alertType';
          });
        }
        this.props.alarmsPortalActionCreators.filterAlerts(newFilters);
        break;
    }

    this.setState({
      currentMode
    });
  }

  private setViewItems(viewMode: PortalViewMode) {
    switch (viewMode) {
      case PortalViewMode.SNMP:
        return this.state.snmpAlerts;
      case PortalViewMode.NODES:
        return this.state.nodesDownAlerts;
      case PortalViewMode.All:
      default:
        return this.props.filteredAlerts;
    }
  }
}

const mapStateToProps = (state: IAlarmsPortalAppState) => ({
  isInit: state.alarmsPortalController.isInit,
  isFullscreen: state.alarmsPortalController.isFullscreen,
  isLoading: state.alarmsPortalController.isLoading,
  agencyOptions: state.alarmsPortalController.agencyOptions,
  regionOptions: state.alarmsPortalController.regionOptions,
  siteOptions: state.alarmsPortalController.siteOptions,
  equipmentTypeOptions: state.alarmsPortalController.equipmentTypeOptions,
  priorityOptions: state.alarmsPortalController.priorityOptions,
  alerts: state.alarmsPortalController.alerts,
  filteredAlerts: state.alarmsPortalController.filteredAlerts,
  currentFilters: state.alarmsPortalController.currentFilters,
  lastSyncedDateTime: state.alarmsPortalController.lastSyncedDateTime
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, Action<string>>
) => ({
  alarmsPortalActionCreators: bindActionCreators(
    AlarmsPortalActionCreators,
    dispatch
  )
});

export const PortalView = connect(
  mapStateToProps,
  mapDispatchToProps
)(PortalViewComponent);

export default PortalView;
