declare interface IAlarmsPortalWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  GoogleMapApiKeyFieldLabel: string;
  SiteDataServerRelativePathFieldLabel: string;
  AlarmDataServerRelativePathFieldLabel: string;
  NodeDataServerRelativePathFieldLabel: string;
  SNMPListIdFieldLabel:string;
  NodesDownListIdFieldLabel: string;
  EnableCommentsFieldLabel: string;
  CommentListIdFieldLabel: string;
  EnableBOSSTicketsFieldLabel: string;
  BOSSTicketListIdFieldLabel: string;
}

declare module 'AlarmsPortalWebPartStrings' {
  const strings: IAlarmsPortalWebPartStrings;
  export = strings;
}
