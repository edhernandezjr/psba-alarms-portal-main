import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ThunkDispatch } from 'redux-thunk';
import { IAlarmsPortalAppState } from '../../store/ConfigureStore';
import {
  AlarmsPortalActionTypes,
  INIT_PORTAL_START,
  INIT_PORTAL_DONE,
  IAlertFilterProps,
  IAlertInfo,
  FILTER_ALERTS,
  ENABLE_FULLSCREEN,
  DISABLE_FULLSCREEN,
  GET_ALERTS_REQUEST,
  GET_ALERTS_RESPONSE,
  ALERT_POLL_REFRESH,
  ALERT_POLL_START,
  IAlertSite,
  INodeDown,
  ISNMPTRAP,
  defaultFilters,
  GET_COMMENTS_REQUEST,
  GET_COMMENTS_RESPONSE,
  POST_COMMENT_REQUEST,
  POST_COMMENT_RESPONSE,
  SITE_STORAGE_KEY,
  GET_ALERTS_HISTORY_REQUEST,
  GET_ALERTS_HISTORY_RESPONSE,
  AlertType
} from './AlarmsPortalController.types';
import { sp } from '@pnp/sp/presets/all';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import { IItemAddResult } from '@pnp/sp/items';
import {
  compact,
  filter,
  find,
  isEmpty,
  isEqual,
  uniq,
  sortBy,
  reverse
} from 'lodash';
import { v4 } from 'uuid';
import * as moment from 'moment-timezone';

export const AlarmsPortalActionCreators = {
  initPortal:
    (
      context: WebPartContext,
      siteDataServerRelativePath: string,
      alarmDataServerRelativePath: string,
      nodeDataServerRelativePath: string,
      snmpListId: string,
      nodeDownListId: string
    ) =>
    async (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: INIT_PORTAL_START,
        isInit: false,
        isLoading: true,
        agencies: [],
        regions: [],
        sites: [],
        equipmentTypes: [],
        priorities: [],
        alerts: [],
        filteredAlerts: [],
        currentFilters: []
      });

      sp.setup({
        spfxContext: context
      });

      const storedSiteData = sessionStorage.getItem(SITE_STORAGE_KEY);
      let siteData: IAlertSite[] = [];

      if (!storedSiteData) {
        siteData = await getSiteData(siteDataServerRelativePath);
        sessionStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(siteData));
      } else {
        siteData = JSON.parse(storedSiteData);
      }

      const alarmsFile = await getLatestFileFromPath(
        alarmDataServerRelativePath
      );
      const alarmData: ISNMPTRAP[] = await getCurrentAlarmData(alarmsFile);

      const nodesDownFile = await getLatestFileFromPath(
        nodeDataServerRelativePath
      );
      const nodeData: INodeDown[] = await getCurrentNodeData(nodesDownFile);

      const lastSyncedDateTime =
        moment(alarmsFile.TimeCreated).valueOf() >
        moment(nodesDownFile.TimeCreated).valueOf()
          ? moment(alarmsFile.TimeCreated).format('h:mm:ss a DD/MM/YY')
          : moment(nodesDownFile.TimeCreated).format('h:mm:ss a DD/MM/YY');

      let alerts: IAlertInfo[] = [];
      const agencies = [];
      const regions = [];
      const sites = [];
      const equipmentTypes = [];
      const priorities = [];

      for (let count = 0; count < alarmData.length; count++) {
        const alarm = alarmData[count];
        const agency = alarm.cst_code ? alarm.cst_code.split('_')[0] : '';
        const alarmSite = find(siteData, ['site_id', alarm.site_id]);
        const siteLocation =
          alarmSite && !isEmpty(alarmSite.site_gps) ? alarmSite.site_gps : '';
        const coord = siteLocation.split(', ');
        const d: any = moment(alarm.last_tac_hst_map_tst, 'DD/MM/YYYY h:mm:ss');

        alerts.push({
          id: v4(),
          region: alarm.cst_dsc,
          siteId: alarm.site_id,
          site: alarm.site_name,
          nodeName: alarm.hst_namea,
          agency,
          equipmentType: alarm.typ_dsc,
          priority: alarm.alarm_priority_name,
          device: alarm.alarm_type_name,
          faultType: alarm.tac_name,
          timeTriggered: d.format('h:mm:ss a DD/MM/YY'),
          impactTime: '',
          status: alarm.status_dsc,
          latLng: {
            lat: parseInt(coord[0]),
            lng: parseInt(coord[1])
          },
          description: alarm.hst_dsc,
          address: `${alarmSite.site_street_address}\n${alarmSite.site_street_address_aux}`,
          client: alarm.cst_code,
          vendor: alarm.vendor_dsc,
          model: alarm.model_dsc,
          spListId: snmpListId,
          spId: alarm.Id,
          spCreated: alarm.Created,
          spBOSSticket: alarm.BOSSticket,
          alertType: AlertType.Alarm
        });
      }

      for (let count = 0; count < nodeData.length; count++) {
        const node = nodeData[count];
        const agency = node.cst_code ? node.cst_code.split('_')[0] : '';
        const nodeSite = find(siteData, ['site_id', node.hst_site_id]);
        const siteLocation =
          nodeSite && !isEmpty(nodeSite.site_gps) ? nodeSite.site_gps : '';
        const coord = siteLocation.split(', ');
        const d: any = moment(node.lo_down_tst, 'DD/MM/YYYY h:mm:ss');

        alerts.push({
          id: v4(),
          region: node.cst_dsc,
          siteId: node.hst_site_id,
          site: node.site_name,
          nodeName: node.hst_namea,
          agency,
          equipmentType: node.typ_dsc,
          priority: node.hst_priority_id,
          device: node.model_dsc,
          faultType: 'Node down',
          timeTriggered: d.format('h:mm:ss a DD/MM/YY'),
          impactTime: '',
          status: 'Node down',
          latLng: {
            lat: parseInt(coord[0]),
            lng: parseInt(coord[1])
          },
          address: `${nodeSite.site_street_address}\n${nodeSite.site_street_address_aux}`,
          description: node.hst_dsc,
          client: node.cst_code,
          vendor: node.vendor_dsc,
          model: node.model_dsc,
          spListId: nodeDownListId,
          spId: node.Id,
          spCreated: node.Created,
          spBOSSticket: node.BOSSticket,
          alertType: AlertType.NodeDown
        });
      }

      for (let count = 0; count < alerts.length; count++) {
        const alert = alerts[count];

        agencies.push(alert.agency);
        regions.push(alert.region);
        sites.push(alert.site);
        equipmentTypes.push(alert.equipmentType);
        priorities.push(alert.priority);
      }

      alerts = reverse(
        sortBy(alerts, (a) => {
          const ad = moment(a.timeTriggered, 'h:mm:ss a DD/MM/YY');

          return ad.valueOf();
        })
      );

      let agencyOptions = sortBy(compact(uniq(agencies))).map((agency) => {
        return {
          key: agency,
          text: agency
        };
      });
      agencyOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let regionOptions = sortBy(compact(uniq(regions))).map((region) => {
        return {
          key: region,
          text: region
        };
      });
      regionOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let siteOptions = sortBy(compact(uniq(sites))).map((site) => {
        return {
          key: site,
          text: site
        };
      });
      siteOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let equipmentTypeOptions = sortBy(compact(uniq(equipmentTypes))).map(
        (equipmentType) => {
          return {
            key: equipmentType,
            text: equipmentType
          };
        }
      );
      equipmentTypeOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let priorityOptions = sortBy(compact(uniq(priorities))).map(
        (priority) => {
          return {
            key: priority,
            text: priority
          };
        }
      );
      priorityOptions.unshift({
        key: 'All',
        text: 'All'
      });

      dispatch({
        type: INIT_PORTAL_DONE,
        isInit: true,
        isLoading: false,
        context,
        agencyOptions,
        regionOptions,
        siteOptions,
        equipmentTypeOptions,
        priorityOptions,
        siteData,
        alerts,
        filteredAlerts: [...alerts],
        currentFilters: defaultFilters,
        lastSyncedDateTime
      });
    },

  initPoll:
    () =>
    (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      const alertPoll = window.setTimeout(() => {
        dispatch({
          type: ALERT_POLL_REFRESH,
          refreshAlertPoll: true
        });
      }, 60000);

      dispatch({
        type: ALERT_POLL_START,
        alertPoll,
        refreshAlertPoll: false
      });
    },

  filterAlerts:
    (filters: IAlertFilterProps[]) =>
    (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      const alerts = getState().alarmsPortalController.alerts;
      const filteredAlerts = applyAlertFilters(alerts, filters);

      dispatch({
        type: FILTER_ALERTS,
        filteredAlerts: [...filteredAlerts],
        currentFilters: [...filters]
      });
    },

  getAlerts:
    (
      context: WebPartContext,
      alarmDataServerRelativePath: string,
      nodeDataServerRelativePath: string,
      snmpListId: string,
      nodeDownListId: string
    ) =>
    async (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: GET_ALERTS_REQUEST,
        isLoading: true
      });

      sp.setup({
        spfxContext: context
      });

      const siteData = getState().alarmsPortalController.siteData;
      const alarmsFile = await getLatestFileFromPath(
        alarmDataServerRelativePath
      );
      const alarmData: ISNMPTRAP[] = await getCurrentAlarmData(alarmsFile);

      const nodesDownFile = await getLatestFileFromPath(
        nodeDataServerRelativePath
      );
      const nodeData: INodeDown[] = await getCurrentNodeData(nodesDownFile);

      const lastSyncedDateTime =
      moment(alarmsFile.TimeCreated).valueOf() >
      moment(nodesDownFile.TimeCreated).valueOf()
        ? moment(alarmsFile.TimeCreated).format('h:mm:ss a DD/MM/YY')
        : moment(nodesDownFile.TimeCreated).format('h:mm:ss a DD/MM/YY');

      let alerts: IAlertInfo[] = [];
      const agencies = [];
      const regions = [];
      const sites = [];
      const equipmentTypes = [];
      const priorities = [];

      for (let count = 0; count < alarmData.length; count++) {
        const alarm = alarmData[count];
        const agency = alarm.cst_code ? alarm.cst_code.split('_')[0] : '';
        const alarmSite = find(siteData, ['site_id', alarm.site_id]);
        const siteLocation =
          alarmSite && !isEmpty(alarmSite.site_gps) ? alarmSite.site_gps : '';
        const coord = siteLocation.split(', ');
        const dateObj: any = moment(
          alarm.last_tac_hst_map_tst,
          'DD/MM/YYYY h:mm:ss'
        );

        alerts.push({
          id: v4(),
          region: alarm.cst_dsc,
          siteId: alarm.site_id,
          site: alarm.site_name,
          nodeName: alarm.hst_namea,
          agency,
          equipmentType: alarm.typ_dsc,
          priority: alarm.alarm_priority_name,
          device: alarm.alarm_type_name,
          faultType: alarm.tac_name,
          timeTriggered: dateObj.format('h:mm:ss a DD/MM/YY'),
          impactTime: '',
          status: alarm.status_dsc,
          latLng: {
            lat: parseInt(coord[0]),
            lng: parseInt(coord[1])
          },
          description: alarm.hst_dsc,
          address: `${alarmSite.site_street_address}\n${alarmSite.site_street_address_aux}`,
          client: alarm.cst_code,
          vendor: alarm.vendor_dsc,
          model: alarm.model_dsc,
          spListId: snmpListId,
          spId: alarm.Id,
          spCreated: alarm.Created,
          spBOSSticket: alarm.BOSSticket,
          alertType: AlertType.Alarm
        });
      }

      for (let count = 0; count < nodeData.length; count++) {
        const node = nodeData[count];
        const agency = node.cst_code ? node.cst_code.split('_')[0] : '';
        const nodeSite = find(siteData, ['site_id', node.hst_site_id]);
        const siteLocation =
          nodeSite && !isEmpty(nodeSite.site_gps) ? nodeSite.site_gps : '';
        const coord = siteLocation.split(', ');
        const dateObj: any = moment(node.lo_down_tst, 'DD/MM/YYYY h:mm:ss');

        alerts.push({
          id: v4(),
          region: node.cst_dsc,
          siteId: node.hst_site_id,
          site: node.site_name,
          nodeName: node.hst_namea,
          agency,
          equipmentType: node.typ_dsc,
          priority: node.hst_priority_id,
          device: node.model_dsc,
          faultType: 'Node down',
          timeTriggered: dateObj.format('h:mm:ss a DD/MM/YY'),
          impactTime: '',
          status: 'Node down',
          latLng: {
            lat: parseInt(coord[0]),
            lng: parseInt(coord[1])
          },
          address: `${nodeSite.site_street_address}\n${nodeSite.site_street_address_aux}`,
          description: node.hst_dsc,
          client: node.cst_code,
          vendor: node.vendor_dsc,
          model: node.model_dsc,
          spListId: nodeDownListId,
          spId: node.Id,
          spCreated: node.Created,
          spBOSSticket: node.BOSSticket,
          alertType: AlertType.NodeDown
        });
      }

      for (let count = 0; count < alerts.length; count++) {
        const alert = alerts[count];

        agencies.push(alert.agency);
        regions.push(alert.region);
        sites.push(alert.site);
        equipmentTypes.push(alert.equipmentType);
        priorities.push(alert.priority);
      }

      alerts = reverse(
        sortBy(alerts, (a) => {
          const ad = moment(a.timeTriggered, 'h:mm:ss a DD/MM/YY');

          return ad.valueOf();
        })
      );

      let agencyOptions = sortBy(compact(uniq(agencies))).map((agency) => {
        return {
          key: agency,
          text: agency
        };
      });
      agencyOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let regionOptions = sortBy(compact(uniq(regions))).map((region) => {
        return {
          key: region,
          text: region
        };
      });
      regionOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let siteOptions = sortBy(compact(uniq(sites))).map((site) => {
        return {
          key: site,
          text: site
        };
      });
      siteOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let equipmentTypeOptions = sortBy(compact(uniq(equipmentTypes))).map(
        (equipmentType) => {
          return {
            key: equipmentType,
            text: equipmentType
          };
        }
      );
      equipmentTypeOptions.unshift({
        key: 'All',
        text: 'All'
      });

      let priorityOptions = sortBy(compact(uniq(priorities))).map(
        (priority) => {
          return {
            key: priority,
            text: priority
          };
        }
      );
      priorityOptions.unshift({
        key: 'All',
        text: 'All'
      });

      const filteredAlerts = applyAlertFilters(
        alerts,
        getState().alarmsPortalController.currentFilters
      );
      dispatch({
        type: GET_ALERTS_RESPONSE,
        isLoading: false,
        agencyOptions,
        regionOptions,
        siteOptions,
        equipmentTypeOptions,
        priorityOptions,
        alerts,
        filteredAlerts,
        lastSyncedDateTime
      });
    },

  getAlertHistory:
    (context: WebPartContext, alert: IAlertInfo, isNodesDown: boolean) =>
    async (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: GET_ALERTS_HISTORY_REQUEST,
        isLoading: true
      });

      sp.setup({
        spfxContext: context
      });

      const siteData = getState().alarmsPortalController.siteData;
      const alarmData: any[] = await getAlarmHistoryData(alert);
      let currentHistory: IAlertInfo[] = [];

      if (!isNodesDown) {
        for (let count = 0; count < alarmData.length; count++) {
          const alarm = alarmData[count];
          const agency = alarm.cst_code ? alarm.cst_code.split('_')[0] : '';
          const alarmSite = find(siteData, ['site_id', alarm.site_id]);
          const siteLocation =
            alarmSite && !isEmpty(alarmSite.site_gps) ? alarmSite.site_gps : '';
          const coord = siteLocation.split(', ');
          const dateObj: any = moment(
            alarm.last_tac_hst_map_tst,
            'DD/MM/YYYY h:mm:ss'
          );

          currentHistory.push({
            id: v4(),
            region: alarm.cst_dsc,
            siteId: alarm.site_id,
            site: alarm.site_name,
            nodeName: alarm.hst_namea,
            agency,
            equipmentType: alarm.typ_dsc,
            priority: alarm.alarm_priority_name,
            device: alarm.alarm_type_name,
            faultType: alarm.tac_name,
            timeTriggered: dateObj.format('h:mm:ss a DD/MM/YY'),
            impactTime: '',
            status: alarm.status_dsc,
            latLng: {
              lat: parseInt(coord[0]),
              lng: parseInt(coord[1])
            },
            description: alarm.hst_dsc,
            address: `${alarmSite.site_street_address}\n${alarmSite.site_street_address_aux}`,
            client: alarm.cst_code,
            vendor: alarm.vendor_dsc,
            model: alarm.model_dsc,
            spListId: alert.spListId,
            spId: alarm.Id,
            spCreated: alarm.Created,
            spBOSSticket: alarm.BOSSticket,
            alertType: AlertType.Alarm
          });
        }
      } else {
        for (let count = 0; count < alarmData.length; count++) {
          const node = alarmData[count];
          const agency = node.cst_code ? node.cst_code.split('_')[0] : '';
          const nodeSite = find(siteData, ['site_id', node.hst_site_id]);
          const siteLocation =
            nodeSite && !isEmpty(nodeSite.site_gps) ? nodeSite.site_gps : '';
          const coord = siteLocation.split(', ');
          const dateObj: any = moment(node.lo_down_tst, 'DD/MM/YYYY h:mm:ss');

          currentHistory.push({
            id: v4(),
            region: node.cst_dsc,
            siteId: node.hst_site_id,
            site: node.site_name,
            nodeName: node.hst_namea,
            agency,
            equipmentType: node.typ_dsc,
            priority: node.hst_priority_id,
            device: node.model_dsc,
            faultType: 'Node down',
            timeTriggered: dateObj.format('h:mm:ss a DD/MM/YY'),
            impactTime: '',
            status: 'Node down',
            latLng: {
              lat: parseInt(coord[0]),
              lng: parseInt(coord[1])
            },
            address: `${nodeSite.site_street_address}\n${nodeSite.site_street_address_aux}`,
            description: node.hst_dsc,
            client: node.cst_code,
            vendor: node.vendor_dsc,
            model: node.model_dsc,
            spListId: alert.spListId,
            spId: node.Id,
            spCreated: node.Created,
            spBOSSticket: node.BOSSticket,
            alertType: AlertType.NodeDown
          });
        }
      }
      currentHistory = reverse(
        sortBy(currentHistory, (a) => {
          const ad = moment(a.timeTriggered, 'h:mm:ss a DD/MM/YY');
          return ad.valueOf();
        })
      );

      dispatch({
        type: GET_ALERTS_HISTORY_RESPONSE,
        isLoading: false,
        currentHistory
      });
    },

  enableFullscreen:
    () =>
    (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: ENABLE_FULLSCREEN,
        isFullscreen: true
      });
    },

  disableFullscreen:
    () =>
    (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: DISABLE_FULLSCREEN,
        isFullscreen: false
      });
    },

  getComments:
    (context: WebPartContext, commentListId: string, alert: IAlertInfo) =>
    async (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: GET_COMMENTS_REQUEST,
        isLoading: true
      });
      sp.setup({
        spfxContext: context
      });

      let items = await sp.web.lists
        .getById(commentListId)
        .items.filter(`Title eq '${alert.nodeName} ${alert.timeTriggered}'`)
        .orderBy('Created', false)
        .top(1000)
        .getPaged();
      let comments: any = items.results;
      let hasNext = items.hasNext;

      while (hasNext) {
        if (items) {
          items = await items.getNext();
          comments = comments.concat(items.results);
          hasNext = items.hasNext;
        }
      }

      dispatch({
        type: GET_COMMENTS_RESPONSE,
        isLoading: false,
        comments
      });
    },

  addComments:
    (
      context: WebPartContext,
      commentListId: string,
      alert: IAlertInfo,
      commentText: string
    ) =>
    async (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      dispatch({
        type: POST_COMMENT_REQUEST,
        isLoading: true
      });

      const commentId = `${alert.nodeName} ${alert.timeTriggered}`;

      sp.setup({
        spfxContext: context
      });

      const iar: IItemAddResult = await sp.web.lists
        .getById(commentListId)
        .items.add({
          Title: commentId,
          Node: alert.nodeName,
          Timetriggered: alert.timeTriggered,
          Comment: commentText
        });

      /**
       * Refresh comments
       */
      let items = await sp.web.lists
        .getById(commentListId)
        .items.filter(`Title eq '${alert.nodeName} ${alert.timeTriggered}'`)
        .orderBy('Created', false)
        .top(1000)
        .getPaged();
      let comments: any = items.results;
      let hasNext = items.hasNext;

      while (hasNext) {
        if (items) {
          items = await items.getNext();
          comments = comments.concat(items.results);
          hasNext = items.hasNext;
        }
      }

      dispatch({
        type: POST_COMMENT_RESPONSE,
        isLoading: false,
        comments
      });
    },

  updateAlert:
    (
      context: WebPartContext,
      listId: string,
      alert: IAlertInfo,
      newValue: string
    ) =>
    async (
      dispatch: ThunkDispatch<any, any, AlarmsPortalActionTypes>,
      getState: () => IAlarmsPortalAppState
    ) => {
      const itemTitle = `${alert.nodeName} ${alert.timeTriggered}`;

      sp.setup({
        spfxContext: context
      });

      const item = await sp.web.lists
        .getById(listId)
        .items.filter(`Title eq '${itemTitle}'`)
        .top(0)
        .get();

      if (isEmpty(item)) {
        const iar: IItemAddResult = await sp.web.lists
          .getById(listId)
          .items.add({
            Title: itemTitle,
            Node: alert.nodeName,
            Timetriggered: alert.timeTriggered,
            BOSSticket: newValue
          });
      } else {
        const itemId = item[0].Id;

        await sp.web.lists.getById(listId).items.getById(itemId).update({
          Node: alert.nodeName,
          Timetriggered: alert.timeTriggered,
          BOSSticket: newValue
        });
      }
    }
};

async function getLatestFileFromPath(serverRelativePath: string) {
  const file: any = await sp.web
    .getFolderByServerRelativePath(serverRelativePath)
    .files
    .orderBy('TimeCreated', false)
    .top(1)
    .get();

  if (!isEmpty(file)) {
    return file[0];
  }

  return null;
}

/**
 * Retrieves array of alarm alert objects
 *
 * @param file JSON file
 * @returns Array of alarm alerts
 */
async function getCurrentAlarmData(file: any) {
  const alarmData: ISNMPTRAP[] = await sp.web
    .getFileByServerRelativeUrl(file.ServerRelativeUrl)
    .getJSON();

  return alarmData;
}

/**
 * Retrieves array of node down alert objects
 *
 * @param file JSON file
 * @returns Array of nodes down alerts
 */
async function getCurrentNodeData(file: any) {
  const nodeData: INodeDown[] = await sp.web
    .getFileByServerRelativeUrl(file.ServerRelativeUrl)
    .getJSON();

  return nodeData;
}

/**
 * Retrieves array of site objects
 *
 * @param serverRelativePath Path of JSON sync
 * @returns Array of site objects
 */
async function getSiteData(serverRelativePath: string) {
  const siteFile: any = await sp.web
    .getFolderByServerRelativePath(serverRelativePath)
    .files.orderBy('TimeCreated', false)
    .top(1)
    .get();

  const siteText: any = await sp.web
    .getFileByServerRelativeUrl(siteFile[0].ServerRelativeUrl)
    .getText();

  /**
   * Remove new line in data that breaks JSON parsing
   */
  const siteData: IAlertSite[] = JSON.parse(
    siteText.replace(/(\r\n|\n|\r)/gm, '')
  );

  return siteData;
}

async function getAlarmHistoryData(alert: IAlertInfo) {
  let items = await sp.web.lists
    .getById(alert.spListId)
    .items.filter(`hst_namea eq '${alert.nodeName}'`)
    .top(2000)
    .getPaged();
  let data: any[] = items.results;
  let hasNext = items.hasNext;

  while (hasNext) {
    if (items) {
      items = await items.getNext();
      data = data.concat(items.results);
      hasNext = items.hasNext;
    }
  }

  return data;
}

function applyAlertFilters(alerts: IAlertInfo[], filters: IAlertFilterProps[]) {
  const filteredAlerts = filter(alerts, (found: IAlertInfo) => {
    /**
     * Filter keys to match
     */
    const toMatch = [];

    /**
     * Filter keys for matching items. Used so that no deep comparison of objects is required.
     */
    const results = [];

    /**
     * Perform a check for matches across filters
     *
     * AND relationship between filters
     * OR between their respective values
     */
    filters.forEach((option) => {
      if (option.value !== 'All') {
        toMatch.push(option.key);

        if (option.value === found[option.key]) {
          results.push(option.key);
          return;
        }
      }
    });

    /**
     * Returns true if all filters and their values match
     * and the person's name and position matches
     */
    return isEqual(toMatch, results);
  });

  return filteredAlerts;
}

export default AlarmsPortalActionCreators;
