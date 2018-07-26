import * as awilix from "awilix";
import { Table, Column, Model } from "sequelize-typescript";


import { container } from "../container";


@Table
export class Project extends Model<Project> {

   @Column
   name: string;

}