import * as awilix from "awilix";
import { Table, Column, Model } from "sequelize-typescript";


import { container } from "../container";


@Table
export class Character extends Model<Character> {

   @Column
   name: string;

   @Column
   gender: string;

}