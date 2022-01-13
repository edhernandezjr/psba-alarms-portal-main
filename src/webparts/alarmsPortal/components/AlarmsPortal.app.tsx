import * as React from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import ConfigureStore from '../store/ConfigureStore';
import { IAlarmsPortalProps } from './AlarmsPortal.types';
import AlarmsPortal from './AlarmsPortal';

export class AlarmsPortalApp extends React.Component<IAlarmsPortalProps, {}> {
  public render(): React.ReactElement<IAlarmsPortalProps> {
    const store = ConfigureStore();

    return (
      <Provider store={store}>
        <HashRouter>
          <Switch>
            <Route
              exact={true}
              path='/'
              render={(props) => <Redirect to='/portal' />}
            />
            <Route
              exact={true}
              path='/%2F'
              render={(props) => <Redirect to='/portal' />}
            />
            <Route
              exact={true}
              path='/portal'
              render={(props) => <AlarmsPortal {...this.props} {...props} />}
            />
            <Route
              exact={true}
              path='/node/:nodeName/alerts/:id'
              render={(props) => {
                return <AlarmsPortal {...this.props} {...props} />;
              }}
            />
          </Switch>
        </HashRouter>
      </Provider>
    );
  }
}
