import * as React from "react";
import { Link } from "react-router-dom";

export const SidebarMenu = () => {
      return <div className="sidebar-menu">
         <Link to="/i" >
            Dashboard
         </Link>
         <Link to="/i/characters" >
            Characters
         </Link>
         <Link to="/i/timeline" >
            Timeline
         </Link>
         <Link to="/login" >
            Log Out
         </Link>
      </div>;
   }
