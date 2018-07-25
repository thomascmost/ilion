import * as awilix from "awilix";
import { Table, Column, Model } from "sequelize-typescript";


import { container } from "../container";


@Table
export class User extends Model<User> {

   @Column
   name: string;

}


container.register({
   userModel: awilix.asClass(User)
 });