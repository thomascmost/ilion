import { Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table
export default class User extends Model<User> {

   @PrimaryKey
   @Column
   id: number;
   
   @Column
   name: string;

   @Column
   email: string;

   @Column
   created: string;

   @Column
   updated: string;

}