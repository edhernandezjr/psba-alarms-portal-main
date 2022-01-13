  import { createStore, applyMiddleware, combineReducers } from 'redux';
  import thunk from 'redux-thunk';
  import { AlarmsPortalReducer } from './../controllers/AlarmsPortalController';

  const rootReducer = combineReducers({
    alarmsPortalController: AlarmsPortalReducer
  });

  export type IAlarmsPortalAppState = ReturnType<typeof rootReducer>;

  // Configures the redux store.
  export default function ConfigureStore(): any {
    const AlarmsPortalStore = createStore(rootReducer, {}, applyMiddleware(thunk));

    return AlarmsPortalStore;
  }
