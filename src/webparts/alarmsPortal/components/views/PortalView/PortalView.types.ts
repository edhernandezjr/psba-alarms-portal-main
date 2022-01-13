import { IColumn } from 'office-ui-fabric-react';
import { RouteComponentProps } from 'react-router-dom';
import {
  IAlarmsPortalState,
  IAlarmsPortalDispatchProps,
  IAlertInfo
} from '../../../controllers/AlarmsPortalController';
import { IAlarmsPortalProps } from '../../AlarmsPortal.types';

export type IPortalViewProps = IAlarmsPortalProps &
  IAlarmsPortalState &
  IAlarmsPortalDispatchProps &
  RouteComponentProps<{ nodeName: string, id: string }>;

export interface IPortalViewState {
  alertColumns: IColumn[];
  alertTypeData: any;
  agencyAlertData: any[];
  mapBounds: any;
  map: any;
  snmpAlerts: IAlertInfo[];
  nodesDownAlerts: IAlertInfo[];
  currentMode: PortalViewMode;
}


export enum PortalViewMode {
  SNMP = 0,
  NODES = 1,
  All = 2
}