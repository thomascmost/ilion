import * as React from "react";
import { connect } from "react-redux";
import { getProjects } from "./project.actions";
import { ProjectCard } from "./project-card";

interface IProjectListProps {
   list: any[];
}

const ProjectList = (props: IProjectListProps) =>
{
   var projects = props.list.map( (project: any) => {
         return (
            <ProjectCard
               key={project.id}
               project={project}>
            </ProjectCard>
      );
   });
   return (
      <div>
         {projects}
      </div>
   );
};

///////////////////////////////////
//      Container Component
///////////////////////////////////

const mapDispatchToProps = () => {
   return {};
};

const mapStateToProps = (state: any) => {
  return {...state.projects };
};

export const ProjectListContainer: React.ComponentClass<{}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectList);