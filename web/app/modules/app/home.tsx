import * as React from "react";
import { AddProjectFormContainer } from "../project/add-project-form";
import { ProjectListContainer } from "../project/project-list";
export const Home = () => {
      return <div>
         <AddProjectFormContainer />
         <ProjectListContainer />
      </div>;
   }
