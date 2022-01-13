import {
  IAlarmsPortalState,
  AlarmsPortalActionTypes,
  INIT_PORTAL_START,
  INIT_PORTAL_DONE,
  FILTER_ALERTS,
  ENABLE_FULLSCREEN,
  DISABLE_FULLSCREEN,
  GET_ALERTS_REQUEST,
  GET_ALERTS_RESPONSE,
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_RESPONSE,
  ALERT_POLL_START,
  ALERT_POLL_REFRESH,
  POST_COMMENT_REQUEST,
  POST_COMMENT_RESPONSE,
  GET_ALERTS_HISTORY_REQUEST,
  GET_ALERTS_HISTORY_RESPONSE
} from './AlarmsPortalController.types';

export const initialState: IAlarmsPortalState = {
  isInit: false,
  isLoading: false,
  isFullscreen: false,
  agencyOptions: [],
  regionOptions: [],
  siteOptions: [],
  equipmentTypeOptions: [],
  priorityOptions: [],
  siteData: [],
  alerts: [],
  filteredAlerts: [],
  currentFilters: [],
  currentSiteId: '',
  alertPoll: null,
  refreshAlertPoll: false,
  comments: [],
  currentHistory: [],
  lastSyncedDateTime: ''
};

export const AlarmsPortalReducer = (
  state: IAlarmsPortalState = initialState,
  action: AlarmsPortalActionTypes
) => {
  switch (action.type) {
    case INIT_PORTAL_START:
      return {
        ...state,
        isInit: action.isInit,
        isLoading: action.isLoading
      };
    case INIT_PORTAL_DONE:
      return {
        ...state,
        isInit: action.isInit,
        isLoading: action.isLoading,
        context: action.context,
        siteData: action.siteData,
        agencyOptions: action.agencyOptions,
        regionOptions: action.regionOptions,
        siteOptions: action.siteOptions,
        equipmentTypeOptions: action.equipmentTypeOptions,
        priorityOptions: action.priorityOptions,
        alerts: action.alerts,
        filteredAlerts: action.filteredAlerts,
        currentFilters: action.currentFilters,
        lastSyncedDateTime: action.lastSyncedDateTime
      };
    case FILTER_ALERTS:
      return {
        ...state,
        filteredAlerts: action.filteredAlerts,
        currentFilters: action.currentFilters
      };
    case GET_ALERTS_REQUEST:
      return {
        ...state,
        isLoading: action.isLoading
      };
    case GET_ALERTS_RESPONSE:
      return {
        ...state,
        isLoading: action.isLoading,
        alerts: action.alerts,
        filteredAlerts: action.filteredAlerts,
        agencyOptions: action.agencyOptions,
        regionOptions: action.regionOptions,
        siteOptions: action.siteOptions,
        equipmentTypeOptions: action.equipmentTypeOptions,
        priorityOptions: action.priorityOptions,
        lastSyncedDateTime: action.lastSyncedDateTime
      };
    case GET_ALERTS_HISTORY_REQUEST:
      return {
        ...state,
        isLoading: action.isLoading
      };
    case GET_ALERTS_HISTORY_RESPONSE:
      return {
        ...state,
        isLoading: action.isLoading,
        currentHistory: action.currentHistory
      };
    case GET_COMMENTS_REQUEST:
    case POST_COMMENT_REQUEST:
      return {
        ...state,
        isLoading: action.isLoading
      };
    case GET_COMMENTS_RESPONSE:
    case POST_COMMENT_RESPONSE:
      return {
        ...state,
        isLoading: action.isLoading,
        comments: action.comments
      };
    case ENABLE_FULLSCREEN:
    case DISABLE_FULLSCREEN:
      return {
        ...state,
        isFullscreen: action.isFullscreen
      };
    case ALERT_POLL_START:
      return {
        ...state,
        alertPoll: action.alertPoll,
        refreshAlertPoll: action.refreshAlertPoll
      };
    case ALERT_POLL_REFRESH:
      return { ...state, refreshAlertPoll: action.refreshAlertPoll };
    default:
      return {
        ...state
      };
  }
};
