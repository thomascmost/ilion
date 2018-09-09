import { Table, Column, Model, PrimaryKey, AutoIncrement } from "sequelize-typescript";

@Table({
   tableName: "project"
})
export default class Project extends Model<Project> {

   @PrimaryKey
   @AutoIncrement
   @Column
   id: number;

   @Column
   name: string;

}