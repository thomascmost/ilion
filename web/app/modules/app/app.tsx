import * as React from "react";
import { Link } from "react-router-dom";
import ReactSVG from "react-svg";
import { Route } from "react-router";
import { ConnectedRouter } from "react-router-redux";

import { Home } from "./home";

export interface IAppProps { history: any; }

export const App = (props: IAppProps) => {
        return <ConnectedRouter history={props.history}>
                  <div className="application-wrapper">
                     <div className="header">
                        <ReactSVG path="ilium.svg" />
                        <h1>Ilium</h1>
                     </div>
                     <div className="app-body">
                        <Route exact path="/" component={Home} />
                     </div>
                  </div>
               </ConnectedRouter>;
    }