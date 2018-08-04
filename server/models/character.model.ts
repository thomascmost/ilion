import { Table, Column, Model } from "sequelize-typescript";

@Table
export default class Character extends Model<Character> {

   @Column
   name: string;

   @Column
   gender: string;

   @Column
   project_id: number;

}