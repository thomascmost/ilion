import { Table, Column, Model } from "sequelize-typescript";

@Table
export default class Scene extends Model<Scene> {

   @Column
   name: string;

   // in milliseconds from project start of 0
   @Column
   startPoint: number;

   // in milliseconds from project start of 0
   @Column
   endPoint: number;

   // 0 being the top
   @Column
   gridDepth: number;

}