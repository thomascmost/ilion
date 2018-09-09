import { Table, Column, Model, PrimaryKey, DataType, AutoIncrement } from "sequelize-typescript";
import { DataTypeAbstract } from "sequelize";

@Table({
   tableName: "character"
})
export default class Character extends Model<Character> {

   @PrimaryKey
   @AutoIncrement
   @Column
   id: number;

   @Column
   name: string;

   @Column
   gender: string;

   @Column
   project_id: number;

}