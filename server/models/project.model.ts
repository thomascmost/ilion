import { Table, Column, Model } from "sequelize-typescript";

@Table
export default class Project extends Model<Project> {

   @Column
   name: string;

}