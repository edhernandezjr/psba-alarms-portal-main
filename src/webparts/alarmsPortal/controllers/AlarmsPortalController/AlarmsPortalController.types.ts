import { WebPartContext } from '@microsoft/sp-webpart-base';
import { AlarmsPortalActionCreators } from './AlarmsPortalController.actions';
import { IDropdownOption } from 'office-ui-fabric-react';

export interface IAlarmsPortalState {
  isInit: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  siteData: IAlertSite[];
  alerts: IAlertInfo[];
  filteredAlerts: IAlertInfo[];
  agencyOptions: IDropdownOption[];
  regionOptions: IDropdownOption[];
  siteOptions: IDropdownOption[];
  equipmentTypeOptions: IDropdownOption[];
  priorityOptions: IDropdownOption[];
  currentFilters: IAlertFilterProps[];
  currentSiteId: string;
  alertPoll: any;
  refreshAlertPoll: boolean;
  comments: any[];
  currentHistory: IAlertInfo[];
  lastSyncedDateTime: string;
}

export interface IAlertInfo {
  id: string;
  region: string; // region?
  siteId: number; //site_id
  site: string; //site_name
  nodeName: string; //hst_namea
  agency: string; //cst_code or cst_dsc
  equipmentType: string; // alarm_type_name
  priority: string;
  device: string; //typ_dsc
  faultType: string; //tac_name
  timeTriggered: string; // last_tac_hst_map_tst
  impactTime: string; //time affected? which field?
  status: string; //status_dsc,
  latLng?: ILatLng; //loc?
  description: string;
  address: string;
  client: string;
  vendor: string;
  model: string;
  spListId: string;
  spCreated: string;
  spId: number;
  spBOSSticket: string;
  alertType: AlertType;
}

export enum AlertType {
  Alarm = 0,
  NodeDown = 1
}

export interface IAlertSite {
  site_id: number;
  site_name: string;
  site_cst_id: number;
  site_str_type: string;
  site_com_dt: string;
  site_tst: number;
  site_ph: string;
  site_ph_secondary: string;
  site_comment: string;
  site_power_info: string;
  site_owner_cst_id: number;
  site_street_address: string;
  site_street_address_aux: string;
  site_code: string;
  site_net_clients_count: number;
  site_site_class_id: number;
  site_site_sla_id: number;
  site_contract_id: number;
  site_status: string;
  site_svc_code: string;
  site_gps: string;
  site_priority_id: number;
  site_region_id: number;
  cst_id: number;
  cst_dsc: number;
  cst_code: number;
  site_class_dsc: number;
  region_name: number;
  contract_maindesc: number;
}

export interface INodeDown {
  site_name: string;
  lo_down_tst: string;
  hst_site_id: number;
  cst_dsc: string;
  cst_code: string;
  hst_namea: string;
  vendor_dsc: string;
  model_dsc: string;
  hst_dsc: string;
  hst_id: number;
  hst_ip: string;
  hst_priority_id: string;
  typ_dsc: string;
  Id: number;
  Created: string;
  BOSSticket: string;
}

export interface ISNMPTRAP {
  site_name: string;
  site_id: number;
  cst_dsc: string;
  cst_code: string;
  hst_namea: string;
  vendor_dsc: string;
  model_dsc: string;
  hst_dsc: string;
  hst_id: number;
  hst_ip: string;
  alarm_type_name: string;
  alarm_priority_code: string;
  alarm_priority_name: string;
  typ_dsc: string;
  tac_name: string;
  tac_dsc: string;
  last_tac_hst_map_tst: string;
  tac_hold_timer: number;
  status_dsc: string;
  Id: number;
  Created: string;
  BOSSticket: string;
}

export interface ILatLng {
  lat: number;
  lng: number;
}

export type IAlertFilterProps = {
  key: string;
  value: string | AlertType | number;
};

export const defaultFilters: IAlertFilterProps[] = [
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
];

export interface IAlarmsPortalDispatchProps {
  alarmsPortalActionCreators: typeof AlarmsPortalActionCreators;
}

export const SITE_STORAGE_KEY = 'SITE_STORAGE';

export const INIT_PORTAL_START = 'INIT_PORTAL_START';
export const INIT_PORTAL_DONE = 'INIT_PORTAL_DONE';
export const REFRESH_PORTAL_REQUEST = 'REFRESH_PORTAL_REQUEST';
export const REFRESH_PORTAL_RESPONSE = 'REFRESH_PORTAL_RESPONSE';

export const FILTER_ALERTS = 'FILTER_ALERTS';

export const GET_SITES_REQUEST = 'GET_SITES_REQUEST';
export const GET_SITES_RESPONSE = 'GET_SITES_RESPONSE';

export const GET_ALERTS_REQUEST = 'GET_ALERTS_REQUEST';
export const GET_ALERTS_RESPONSE = 'GET_ALERTS_RESPONSE';

export const GET_ALERTS_HISTORY_REQUEST = 'GET_ALERTS_HISTORY_REQUEST';
export const GET_ALERTS_HISTORY_RESPONSE = 'GET_ALERTS_HISTORY_RESPONSE';

export const GET_COMMENTS_REQUEST = 'GET_COMMENTS_REQUEST';
export const GET_COMMENTS_RESPONSE = 'GET_COMMENTS_RESPONSE';

export const POST_COMMENT_REQUEST = 'POST_COMMENT_REQUEST';
export const POST_COMMENT_RESPONSE = 'POST_COMMENT_RESPONSE';

export const UPDATE_ALERT_REQUEST = 'UPDATE_ALERT_REQUEST';
export const UPDATE_ALERT_RESPONSE = 'UPDATE_ALERT_RESPONSE';

export const ENABLE_FULLSCREEN = 'ENABLE_FULLSCREEN';
export const DISABLE_FULLSCREEN = 'DISABLE_FULLSCREEN';

export const ALERT_POLL_START = 'ALERT_POLL_START';
export const ALERT_POLL_REFRESH = 'ALERT_POLL_REFRESH';

export interface InitPortalStart {
  type: typeof INIT_PORTAL_START;
  isInit: boolean;
  isLoading: boolean;
}

export interface InitPortalDone {
  type: typeof INIT_PORTAL_DONE;
  isInit: boolean;
  isLoading: boolean;
  context: WebPartContext;
  agencyOptions: IDropdownOption[];
  regionOptions: IDropdownOption[];
  siteOptions: IDropdownOption[];
  equipmentTypeOptions: IDropdownOption[];
  priorityOptions: IDropdownOption[];
  siteData: IAlertSite[];
  alerts: IAlertInfo[];
  filteredAlerts: IAlertInfo[];
  currentFilters: IAlertFilterProps[];
  lastSyncedDateTime: string;
}

export interface FilterAlerts {
  type: typeof FILTER_ALERTS;
  filteredAlerts: IAlertInfo[];
  currentFilters: IAlertFilterProps[];
}

export interface EnableFullscreen {
  type: typeof ENABLE_FULLSCREEN;
  isFullscreen: boolean;
}

export interface DisableFullscreen {
  type: typeof DISABLE_FULLSCREEN;
  isFullscreen: boolean;
}

export interface GetAlertsRequest {
  type: typeof GET_ALERTS_REQUEST;
  isLoading: boolean;
}

export interface GetAlertsResponse {
  type: typeof GET_ALERTS_RESPONSE;
  isLoading: boolean;
  alerts: IAlertInfo[];
  filteredAlerts: IAlertInfo[];
  agencyOptions: IDropdownOption[];
  regionOptions: IDropdownOption[];
  siteOptions: IDropdownOption[];
  equipmentTypeOptions: IDropdownOption[];
  priorityOptions: IDropdownOption[];
  lastSyncedDateTime: string;
}

export interface GetAlertHistoryRequest {
  type: typeof GET_ALERTS_HISTORY_REQUEST;
  isLoading: boolean;
}

export interface GetAlertHistoryResponse {
  type: typeof GET_ALERTS_HISTORY_RESPONSE;
  isLoading: boolean;
  currentHistory: IAlertInfo[];
}

export interface GetCommentsRequest {
  type: typeof GET_COMMENTS_REQUEST;
  isLoading: boolean;
}

export interface GetCommentsResponse {
  type: typeof GET_COMMENTS_RESPONSE;
  isLoading: boolean;
  comments: any[];
}

export interface PostCommentRequest {
  type: typeof POST_COMMENT_REQUEST;
  isLoading: boolean;
}

export interface PostCommentResponse {
  type: typeof POST_COMMENT_RESPONSE;
  isLoading: boolean;
  comments: any[];
}

export interface UpdateAlertRequest {
  type: typeof UPDATE_ALERT_REQUEST;
  isLoading: boolean;
}

export interface UpdateAlertResponse {
  type: typeof UPDATE_ALERT_RESPONSE;
  isLoading: boolean;
  alerts: IAlertInfo[];
  filteredAlerts: IAlertInfo[];
}

export interface AlertPollStart {
  type: typeof ALERT_POLL_START;
  alertPoll?: any;
  refreshAlertPoll: boolean;
}

export interface AlertPollRefresh {
  type: typeof ALERT_POLL_REFRESH;
  refreshAlertPoll: boolean;
}

export type AlarmsPortalActionTypes =
  | InitPortalStart
  | InitPortalDone
  | FilterAlerts
  | EnableFullscreen
  | DisableFullscreen
  | GetAlertsRequest
  | GetAlertsResponse
  | AlertPollStart
  | AlertPollRefresh
  | GetCommentsRequest
  | GetCommentsResponse
  | PostCommentRequest
  | PostCommentResponse
  | UpdateAlertRequest
  | UpdateAlertResponse
  | GetAlertHistoryRequest
  | GetAlertHistoryResponse;
