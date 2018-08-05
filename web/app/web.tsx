import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";

import { connectRouter, routerMiddleware } from 'connected-react-router'

import { createForms } from "react-redux-form";

import { createBrowserHistory } from 'history'

import iliumReducer from "./reducer";

import createSagaMiddleware from "redux-saga";
import characterSaga from "./modules/character/character.saga";
import sceneSaga from "./modules/scene/scene.saga";
const sagaMiddleware = createSagaMiddleware()

import { App } from "./modules/app/app";
import { getCharacterList } from "./modules/character/character.actions";

// Polyfills
var Promise = require( "promise-polyfill" );

// To add to window
if (!(window as any).Promise) {
 (window as any).Promise = Promise;
}

const history = createBrowserHistory();
const middleware = routerMiddleware(history)
const store = createStore(
   connectRouter(history)(
      combineReducers({
      ...iliumReducer,
      ...createForms({
         character: {name: ""},
      }),
   })),
   applyMiddleware(middleware, sagaMiddleware)
);
// then run the saga
sagaMiddleware.run(characterSaga);
sagaMiddleware.run(sceneSaga);

export abstract class WebApp {
   public static initialize ()
   {
      store.dispatch(getCharacterList());
      console.log("rendering app");
      ReactDOM.render(
         <Provider store={store}>
            <App history={history} />
         </Provider>,
         document.getElementById("app")
      );
   }
}
