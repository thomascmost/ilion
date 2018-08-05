import * as React from "react";
import { Link, Router } from "react-router-dom";
import ReactSVG from "react-svg";
import { Route } from "react-router";
import { ConnectedRouter } from "connected-react-router";

import { Home } from "./home";
import { Timeline } from "../timeline/timeline";

export interface IAppProps { history: any; }

export const App = (props: IAppProps) => {
        return <ConnectedRouter history={props.history}>
                  <Router history={props.history}>
                  <div className="application-wrapper">
                     <div className="header">
                        <Link to="/" >
                           <ReactSVG path="ilium.svg" />
                           <h1>Ilium</h1>
                        </Link>
                        <Link to="/timeline" >Timeline</Link>
                     </div>
                     <div className="app-body">
                        <Route exact path="/" component={Home} />
                        <Route exact path="/timeline" component={Timeline} />
                     </div>
                  </div>
                  </Router>
               </ConnectedRouter>;
    }