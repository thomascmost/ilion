import { Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt, AutoIncrement } from "sequelize-typescript";

@Table({
   tableName: "user"
})
export default class User extends Model<User> {

   @PrimaryKey
   @AutoIncrement
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