import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { routerReducer, routerMiddleware } from "react-router-redux";
import { createForms } from "react-redux-form";

import createHistory from "history/createBrowserHistory";

import { App } from "./modules/app/app";

// Polyfills
var Promise = require( "promise-polyfill" );

// To add to window
if (!(window as any).Promise) {
 (window as any).Promise = Promise;
}

const history = createHistory()
const middleware = routerMiddleware(history)
const store = createStore(
   combineReducers({
      //...Themiscyra,
      router: routerReducer,
      ...createForms({
         character: {name: ""},
      }),
   }),
   applyMiddleware(middleware)
);

export abstract class WebApp {
   public static initialize ()
   {
      console.log("rendering app");
      ReactDOM.render(
         <Provider store={store}>
            <App history={history} />
         </Provider>,
         document.getElementById("app")
      );
   }
}
