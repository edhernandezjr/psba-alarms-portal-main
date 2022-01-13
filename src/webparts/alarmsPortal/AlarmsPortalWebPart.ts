import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  PropertyFieldListPicker,
  PropertyFieldListPickerOrderBy
} from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'AlarmsPortalWebPartStrings';
import { AlarmsPortalApp as AlarmsPortal } from './components/AlarmsPortal.app';
import { IAlarmsPortalProps } from './components/AlarmsPortal.types';

export interface IAlarmsPortalWebPartProps {
  googleMapsApiKey: string;
  siteDataServerRelativePath: string;
  alarmDataServerRelativePath: string;
  nodeDataServerRelativePath: string;
  snmpListId: string;
  enableComments: boolean;
  nodeDownListId: string;
  commentListId: string;
  enableBOSSTickets: string;
  BOSSTicketListId: string;
}

export default class AlarmsPortalWebPart extends BaseClientSideWebPart<IAlarmsPortalWebPartProps> {
  public render(): void {
    console.log('init portal');
    
    const element: React.ReactElement<IAlarmsPortalProps> = React.createElement(
      AlarmsPortal,
      {
        context: this.context,
        displayMode: this.displayMode,
        googleMapsApiKey: this.properties.googleMapsApiKey,
        siteDataServerRelativePath: this.properties.siteDataServerRelativePath,
        alarmDataServerRelativePath:
          this.properties.alarmDataServerRelativePath,
        nodeDataServerRelativePath: this.properties.nodeDataServerRelativePath,
        snmpListId: this.properties.snmpListId,
        nodeDownListId: this.properties.nodeDownListId,
        enableComments: this.properties.enableComments,
        commentListId: this.properties.commentListId,
        enableBOSSTickets: this.properties.enableBOSSTickets,
        BOSSTicketListId: this.properties.BOSSTicketListId
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
  
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('googleMapsApiKey', {
                  label: strings.GoogleMapApiKeyFieldLabel
                }),
                PropertyPaneTextField('siteDataServerRelativePath', {
                  label: strings.SiteDataServerRelativePathFieldLabel
                }),
                PropertyPaneTextField('alarmDataServerRelativePath', {
                  label: strings.AlarmDataServerRelativePathFieldLabel
                }),
                PropertyPaneTextField('nodeDataServerRelativePath', {
                  label: strings.NodeDataServerRelativePathFieldLabel
                }),
                PropertyFieldListPicker('snmpListId', {
                  label: strings.SNMPListIdFieldLabel,
                  selectedList: this.properties.snmpListId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'snmpListIdPickerFieldId'
                }),
                PropertyFieldListPicker('nodeDownListId', {
                  label: strings.NodesDownListIdFieldLabel,
                  selectedList: this.properties.nodeDownListId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'nodeDownListIdPickerFieldId'
                }),
                PropertyPaneToggle('enableComments', {
                  label: strings.EnableCommentsFieldLabel
                }),
                PropertyFieldListPicker('commentListId', {
                  label: strings.CommentListIdFieldLabel,
                  selectedList: this.properties.commentListId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: !this.properties.enableComments,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'commentListIdPickerFieldId',
                }),
                PropertyPaneToggle('enableBOSSTickets', {
                  label: strings.EnableBOSSTicketsFieldLabel
                }),
                PropertyFieldListPicker('BOSSTicketListId', {
                  label: strings.BOSSTicketListIdFieldLabel,
                  selectedList: this.properties.BOSSTicketListId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: !this.properties.enableBOSSTickets,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'BOSSTicketListIdPickerFieldId',
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
