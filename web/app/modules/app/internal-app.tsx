import * as React from "react";
import { Route } from "react-router-dom";
import Sidebar from "react-sidebar";
import { Home } from "./home";
import { Timeline } from "../timeline/timeline";
import { SidebarMenu } from "./sidebar-menu";
import { CharacterPage } from "../character/character-page";


const mql = window.matchMedia(`(min-width: 800px)`);
const sidebarStyle = {
   root: {
     position: "absolute",
     top: "50px",
     left: "0",
     right: "0",
     bottom: "0",
     overflow: "hidden"
   },
   sidebar: {
     zIndex: "2",
     position: "absolute",
     top: "0",
     bottom: "0",
     transition: "transform .3s ease-out",
     WebkitTransition: "-webkit-transform .3s ease-out",
     willChange: "transform",
     overflowY: "auto",
     padding: "25px"
   },
   content: {
     position: "absolute",
     top: "0",
     left: "0",
     right: "0",
     bottom: "0",
     padding: "25px",
     overflowY: "auto",
     WebkitOverflowScrolling: "touch",
     transition: "left .3s ease-out, right .3s ease-out"
   },
   overlay: {
     zIndex: "1",
     position: "fixed",
     top: "0",
     left: "0",
     right: "0",
     bottom: "0",
     opacity: "0",
     visibility: "hidden",
     transition: "opacity .3s ease-out, visibility .3s ease-out",
     backgroundColor: "rgba(0,0,0,.3)"
   },
   dragHandle: {
     zIndex: "1",
     position: "fixed",
     top: "50px",
     left: "0",
     bottom: "0"
   }
};

export interface IInternalAppProps {  }
export interface IInternalAppState { 
   sidebarDocked: boolean;
   sidebarOpen: boolean;
}

export class InternalApp extends React.Component<IInternalAppProps, IInternalAppState> {
   constructor(props: IInternalAppProps) {
     super(props);
     this.state = {
       sidebarDocked: mql.matches,
       sidebarOpen: false
     };
 
     this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
     this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
   }
 
   componentWillMount() {
     mql.addListener(this.mediaQueryChanged);
   }
 
   componentWillUnmount() {
     mql.removeListener(this.mediaQueryChanged);
   }
 
   onSetSidebarOpen(open: boolean) {
     this.setState({ sidebarOpen: open });
   }
 
   mediaQueryChanged() {
     this.setState({ sidebarDocked: mql.matches, sidebarOpen: false });
   }

   render() {   
      return <div className="app-body">
            <Sidebar
               styles={sidebarStyle}
               sidebar={SidebarMenu()}
               open={this.state.sidebarOpen}
               docked={this.state.sidebarDocked}
               onSetOpen={this.onSetSidebarOpen}
            >
               <b>
                  <Route exact path="/i" component={Home} />
                  <Route exact path="/i/characters" component={CharacterPage} />
                  <Route exact path="/i/timeline" component={Timeline} />
               </b>
            </Sidebar>
      </div>;
   }
}
