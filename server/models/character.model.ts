import { Table, Column, Model, PrimaryKey } from "sequelize-typescript";

@Table
export default class Character extends Model<Character> {

   @PrimaryKey
   @Column
   id: number;
   
   @Column
   name: string;

   @Column
   gender: string;

   @Column
   project_id: number;

}