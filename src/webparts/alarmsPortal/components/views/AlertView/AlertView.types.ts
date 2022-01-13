import { IColumn } from 'office-ui-fabric-react';
import { RouteComponentProps } from 'react-router-dom';
import {
  IAlarmsPortalState,
  IAlarmsPortalDispatchProps,
  IAlertInfo
} from '../../../controllers/AlarmsPortalController';
import { IAlarmsPortalProps } from '../../AlarmsPortal.types';

export type IAlertViewProps = IAlarmsPortalProps &
IAlarmsPortalState &
IAlarmsPortalDispatchProps &
RouteComponentProps<{ nodeName: string, id: string }>;

export interface IAlertViewState {
  alert: IAlertInfo;
  history: IAlertInfo[];
  alertColumns: IColumn[];
  commentText: string;
  showCommentForm: boolean;
  isEditMode: boolean;
  bossTicketValue: string;
}
