import * as React from 'react';
import { bindActionCreators, Action } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Link } from 'react-router-dom';
import {
  IColumn,
  DetailsList,
  SelectionMode,
  DetailsRow,
  ScrollablePane,
  Sticky,
  StickyPositionType,
  ActionButton,
  TextField,
  PrimaryButton,
  IconButton
} from 'office-ui-fabric-react';
import { sp } from '@pnp/sp/presets/all';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import { IAlertViewProps, IAlertViewState } from './AlertView.types';
import { IAlarmsPortalAppState } from '../../../store/ConfigureStore';
import { AlarmsPortalActionCreators } from './../../../controllers/AlarmsPortalController';

import { find, isEqual, isEmpty } from 'lodash';
import * as moment from 'moment-timezone';

export class AlertViewComponent extends React.Component<
  IAlertViewProps,
  IAlertViewState
> {
  constructor(props: IAlertViewProps) {
    super(props);

    this.state = {
      alert: null,
      history: [],
      alertColumns: [],
      commentText: '',
      bossTicketValue: '',
      showCommentForm: false,
      isEditMode: false
    };
  }

  public render(): React.ReactElement<IAlertViewProps> {
    const {
      alert,
      alertColumns,
      showCommentForm,
      isEditMode,
      bossTicketValue
    } = this.state;
    const { comments, context, commentListId } = this.props;

    return (
      <div key={this.props.match.params.nodeName}>
        <Link to={'/portal'}>
          <ActionButton iconProps={{ iconName: 'ChevronLeft' }}>
            Back to dashboard
          </ActionButton>
        </Link>
        <h2>Alert description</h2>
        <DetailsList
          key={this.props.match.params.nodeName}
          columns={alertColumns}
          items={[alert]}
          selectionMode={SelectionMode.none}
          onRenderRow={this.onRenderRow}
          styles={{
            root: {
              marginBottom: 48
            }
          }}
          onRenderDetailsHeader={(props, defaultRender) => {
            if (!props) {
              return null;
            }
            return (
              <>
                {defaultRender!({
                  ...props,
                  styles: {
                    root: { paddingTop: 0 }
                  }
                })}
              </>
            );
          }}
        />

        <div>
          {!isEmpty(alert) && (
            <div>
              <h2>Fault overview</h2>
              <table>
                <tbody>
                  <tr>
                    <th>Node</th>
                    <td>{alert.nodeName}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{alert.description}</td>
                  </tr>
                  {this.props.enableBOSSTickets && (
                    <tr>
                      <th>BOSS ticket</th>
                      <td>
                        <div style={{ display: 'flex' }}>
                          <TextField
                            placeholder={'BOSS ticket'}
                            value={bossTicketValue}
                            onChange={(ev, newValue) => {
                              this.setState({
                                bossTicketValue: newValue
                              });
                            }}
                            readOnly={!isEditMode ? true : false}
                            maxLength={10}
                            styles={{
                              root: {
                                flex: 1
                              },
                              fieldGroup: {
                                borderColor: !isEditMode ? '#edebe9' : 'inherit'
                              }
                            }}
                          />
                          <IconButton
                            iconProps={{
                              iconName: !isEditMode ? 'Edit' : 'Save'
                            }}
                            onClick={async () => {
                              if (isEditMode) {
                                await this.props.alarmsPortalActionCreators.updateAlert(
                                  context,
                                  this.props.BOSSTicketListId,
                                  alert,
                                  this.state.bossTicketValue
                                );
                              }

                              this.setState({
                                isEditMode: !isEditMode
                              });
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th>Client</th>
                    <td>{alert.client}</td>
                  </tr>
                  <tr>
                    <th>Vendor</th>
                    <td>{alert.vendor}</td>
                  </tr>
                  <tr>
                    <th>Site address</th>
                    <td>{alert.address}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{alert.status}</td>
                  </tr>
                </tbody>
              </table>
              {this.props.enableComments && this.props.commentListId && (
                <div style={{ width: '50%' }}>
                  <div style={{ marginBottom: 48 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12
                      }}
                    >
                      <h2 style={{ marginBottom: 0 }}>Comments</h2>
                      <PrimaryButton
                        iconProps={{ iconName: 'Add' }}
                        onClick={() => {
                          this.setState({
                            showCommentForm: !showCommentForm
                          });
                        }}
                      >
                        {!showCommentForm ? 'Add comment' : 'Hide form'}
                      </PrimaryButton>
                    </div>
                    {showCommentForm && (
                      <div style={{ marginBottom: 24 }}>
                        <TextField
                          label='Comment'
                          multiline={true}
                          rows={3}
                          maxLength={255}
                          styles={{
                            root: {
                              marginBottom: 8
                            },
                            fieldGroup: {
                              borderColor: '#edebe9',
                              boxShadow:
                                '0 1px 10px 0 rgba(0, 0, 0, .15), 0 1px 1px 0 rgba(0, 0, 0, .15)'
                            }
                          }}
                          value={this.state.commentText}
                          onChange={(ev, newValue) => {
                            this.setState({
                              commentText: newValue
                            });
                          }}
                        />
                        <PrimaryButton
                          onClick={async () => {
                            await this.props.alarmsPortalActionCreators.addComments(
                              context,
                              commentListId,
                              alert,
                              this.state.commentText
                            );

                            this.setState({
                              showCommentForm: false,
                              commentText: ''
                            });
                          }}
                        >
                          Submit
                        </PrimaryButton>
                      </div>
                    )}

                    {!isEmpty(comments) && (
                      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {comments.map((item) => {
                          return (
                            <li style={{ marginBottom: 16 }} key={item.Created}>
                              <div>
                                <div
                                  style={{
                                    color: 'rgb(96, 94, 92)',
                                    fontSize: 14,
                                    fontWeight: 600
                                  }}
                                >
                                  {moment(item.Created).format(
                                    'h:mm:ss a DD/MM/YY'
                                  )}
                                </div>
                                {item.Comment}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <h2>Device history</h2>
        <div style={{ height: '40vh', position: 'relative' }}>
          <ScrollablePane>
            <DetailsList
              key={this.props.match.params.nodeName}
              columns={alertColumns}
              items={this.props.currentHistory}
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
      </div>
    );
  }

  public async componentDidMount() {
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

    const alert = find(this.props.alerts, ['id', this.props.match.params.id]);
    let bossTicketValue = '';

    if (alert) {
      this.props.alarmsPortalActionCreators.getAlertHistory(
        this.props.context,
        alert,
        alert.spListId === this.props.nodeDownListId ? true : false
      );

      if (this.props.enableBOSSTickets && this.props.BOSSTicketListId) {
        sp.setup({
          spfxContext: this.props.context
        });

        const bossItem = await sp.web.lists
          .getById(this.props.BOSSTicketListId)
          .items.filter(`Title eq '${alert.nodeName} ${alert.timeTriggered}'`)
          .top(0)
          .get();

        if (!isEmpty(bossItem)) {
          bossTicketValue = bossItem[0].BOSSticket;
        }
      }

      if (this.props.enableComments && this.props.commentListId) {
        await this.props.alarmsPortalActionCreators.getComments(
          this.props.context,
          this.props.commentListId,
          alert
        );
      }
    }

    this.setState({
      alert,
      alertColumns,
      bossTicketValue
    });
  }

  public async componentDidUpdate(
    prevProps: IAlertViewProps,
    prevState: IAlertViewState
  ) {
    if (
      !isEqual(prevProps.match.params, this.props.match.params) &&
      this.props.match.params.nodeName
    ) {
      const alert = find(this.props.currentHistory, [
        'id',
        this.props.match.params.id
      ]);
      let bossTicketValue = '';
      
      if (alert) {
        if (this.props.enableBOSSTickets && this.props.BOSSTicketListId) {
          sp.setup({
            spfxContext: this.props.context
          });

          const bossItem = await sp.web.lists
            .getById(this.props.BOSSTicketListId)
            .items.filter(`Title eq '${alert.nodeName} ${alert.timeTriggered}'`)
            .top(0)
            .get();

          if (!isEmpty(bossItem)) {
            bossTicketValue = bossItem[0].BOSSticket;
          }
        }

        if (this.props.enableComments && this.props.commentListId) {
          await this.props.alarmsPortalActionCreators.getComments(
            this.props.context,
            this.props.commentListId,
            alert
          );
        }
      }

      this.setState({
        alert,
        bossTicketValue
      });
    }

    if (prevProps.isInit !== this.props.isInit && this.props.isInit) {
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

      const alert = find(this.props.alerts, [
        'timeTriggered',
        parseInt(this.props.match.params.id)
      ]);

      this.setState({
        alert,
        alertColumns
      });
    }
  }

  private onRenderRow = (props) => {
    if (props && this.state.alert) {
      return (
        <Link
          to={`/node/${props.item.nodeName}/alerts/${props.item.id}`}
          style={{ textDecoration: 'none' }}
        >
          <DetailsRow
            {...props}
            styles={{
              root: {
                cursor: 'pointer',
                backgroundColor:
                  props.item.timeTriggered === this.state.alert.timeTriggered
                    ? '#efefef'
                    : ''
              }
            }}
          />
        </Link>
      );
    }

    return null;
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
  comments: state.alarmsPortalController.comments,
  currentHistory: state.alarmsPortalController.currentHistory
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, Action<string>>
) => ({
  alarmsPortalActionCreators: bindActionCreators(
    AlarmsPortalActionCreators,
    dispatch
  )
});

export const AlertView = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertViewComponent);

export default AlertView;
