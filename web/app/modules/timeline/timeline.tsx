import * as React from "react";
import { TimelineGridContainer } from "./timeline-grid";
import { AddSceneAffordanceContainer } from "./add-scene";

export const Timeline = () => {
      return <div>
         <h3>Timeline</h3>
         <AddSceneAffordanceContainer />
         <TimelineGridContainer />
      </div>;
   }
