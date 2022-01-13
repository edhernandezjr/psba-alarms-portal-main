import { WebPartContext } from '@microsoft/sp-webpart-base';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface IAlarmsPortalProps {
  context: WebPartContext;
  displayMode: DisplayMode;
  googleMapsApiKey: string;
  siteDataServerRelativePath: string;
  alarmDataServerRelativePath: string;
  nodeDataServerRelativePath: string;
  snmpListId: string;
  nodeDownListId: string;
  enableComments: boolean;
  commentListId: string;
  enableBOSSTickets: string;
  BOSSTicketListId: string;
}
