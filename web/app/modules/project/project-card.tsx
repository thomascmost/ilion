import * as React from "react";
import Project from "server/models/project.model";
const styles = require("./project-card.scss");

interface IProjectCardProps {
   project: Project;
}

export const ProjectCard = (props: IProjectCardProps) =>
   <div className={styles.container}>
      <label>{props.project.name}</label>
   </div>;
