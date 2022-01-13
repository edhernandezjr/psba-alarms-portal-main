import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators, Action } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  ActionButton,
  Panel,
  PanelType,
  Overlay,
  Spinner
} from 'office-ui-fabric-react';

import styles from './AlarmsPortal.module.scss';
import { IAlarmsPortalProps } from './AlarmsPortal.types';
import {
  IAlarmsPortalDispatchProps,
  IAlarmsPortalState,
  AlarmsPortalActionCreators
} from '../controllers/AlarmsPortalController';
import { IAlarmsPortalAppState } from '../store/ConfigureStore';
import PortalView from './views/PortalView/PortalView';
import AlertView from './views/AlertView/AlertView';

import { isEmpty, isEqual } from 'lodash';

type IAlarmsPortalComponentProps = IAlarmsPortalProps &
  IAlarmsPortalState &
  IAlarmsPortalDispatchProps &
  RouteComponentProps<{ nodeName: string; id: string }>;

class AlarmsPortalComponent extends React.Component<
  IAlarmsPortalComponentProps,
  {}
> {
  public render(): React.ReactElement<IAlarmsPortalProps> {
    return (
      <div className={styles.alarmsPortal}>
        <ActionButton
          iconProps={{
            iconName: !this.props.isFullscreen ? 'FullScreen' : 'BackToWindow'
          }}
          onClick={() => {
            if (!this.props.isFullscreen) {
              this.props.alarmsPortalActionCreators.enableFullscreen();
            } else {
              this.props.alarmsPortalActionCreators.disableFullscreen();
            }
          }}
          text={!this.props.isFullscreen ? 'Fullscreen' : 'Close'}
        />

        {!this.props.isFullscreen && (
          <>
            {this.props.isLoading && (
              <Overlay>
                <Spinner label={'Loading'} />
              </Overlay>
            )}
            {isEmpty(this.props.match.params) ? (
              <PortalView {...this.props} />
            ) : (
              <AlertView {...this.props} />
            )}
          </>
        )}

        <Panel
          type={PanelType.smallFluid}
          isOpen={this.props.isFullscreen}
          onDismissed={() =>
            this.props.alarmsPortalActionCreators.disableFullscreen()
          }
          onRenderBody={() => {
            return (
              <div
                style={{ padding: '0 48px' }}
                className={styles.alarmsPortal}
              >
                <>
                  {isEmpty(this.props.match.params) ? (
                    <PortalView {...this.props} />
                  ) : (
                    <AlertView {...this.props} />
                  )}
                </>
              </div>
            );
          }}
        />
      </div>
    );
  }

  public componentDidMount() {
    this.props.alarmsPortalActionCreators.initPortal(
      this.props.context,
      this.props.siteDataServerRelativePath,
      this.props.alarmDataServerRelativePath,
      this.props.nodeDataServerRelativePath,
      this.props.snmpListId,
      this.props.nodeDownListId
    );
    this.props.alarmsPortalActionCreators.initPoll();
  }

  public componentDidUpdate(prevProps, prevState) {
    if (
      !isEqual(prevProps.match.params, this.props.match.params) &&
      !this.props.match.params.nodeName
    ) {
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
    }

    if (this.props.refreshAlertPoll && !prevProps.refreshAlertPoll) {
      this.props.alarmsPortalActionCreators.initPoll();
    }

    if (
      this.props.refreshAlertPoll !== prevProps.refreshAlertPoll &&
      this.props.isInit &&
      this.props.refreshAlertPoll 
    ) {
      if(!this.props.match.params.nodeName) {
        this.props.alarmsPortalActionCreators.getAlerts(
          this.props.context,
          this.props.alarmDataServerRelativePath,
          this.props.nodeDataServerRelativePath,
          this.props.snmpListId,
          this.props.nodeDownListId
        );
      }
    }
  }
}

const mapStateToProps = (state: IAlarmsPortalAppState) => ({
  isInit: state.alarmsPortalController.isInit,
  isLoading: state.alarmsPortalController.isLoading,
  isFullscreen: state.alarmsPortalController.isFullscreen,
  agencyOptions: state.alarmsPortalController.agencyOptions,
  regionOptions: state.alarmsPortalController.regionOptions,
  siteOptions: state.alarmsPortalController.siteOptions,
  equipmentTypeOptions: state.alarmsPortalController.equipmentTypeOptions,
  priorityOptions: state.alarmsPortalController.priorityOptions,
  siteData: state.alarmsPortalController.siteData,
  alerts: state.alarmsPortalController.alerts,
  filteredAlerts: state.alarmsPortalController.filteredAlerts,
  currentFilters: state.alarmsPortalController.currentFilters,
  currentSiteId: state.alarmsPortalController.currentSiteId,
  alertPoll: state.alarmsPortalController.alertPoll,
  refreshAlertPoll: state.alarmsPortalController.refreshAlertPoll,
  comments: state.alarmsPortalController.comments,
  currentHistory: state.alarmsPortalController.currentHistory,
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

export const AlarmsPortal = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlarmsPortalComponent);

export default AlarmsPortal;
