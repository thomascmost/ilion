import { Table, Column, Model, PrimaryKey, IBuildOptions, DataType, AutoIncrement } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";

@Table({
   tableName: "scene"
})
export default class Scene extends Model<Scene> {


   constructor(values?: FilteredModelAttributes<any>, options?: IBuildOptions) {
      super(values, options);
      this.lengthSeconds = (this.end_point - this.start_point) / 1000;
      this.lengthMinutes = this.lengthSeconds / 60;
      this.lengthGrid = this.lengthMinutes / 5;
      this.gridX = this.x_col;
      this.gridY = this.start_point / 1000 / 60 / 5;
      this.colSpan = 1;
   }

   @Column(DataType.VIRTUAL)
   lengthSeconds: number;
   @Column(DataType.VIRTUAL)
   lengthMinutes: number;
   @Column(DataType.VIRTUAL)
   lengthGrid: number;
   @Column(DataType.VIRTUAL)
   gridX: number;
   @Column(DataType.VIRTUAL)
   gridY: number;
   @Column(DataType.VIRTUAL)
   colSpan: number;

   @PrimaryKey
   @AutoIncrement
   @Column
   id: number;

   @Column
   project_id: number;

   @Column
   name: string;

   @Column
   x_col: number;

   // in milliseconds from project start of 0
   @Column
   start_point: number;

   // in milliseconds from project start of 0
   @Column
   end_point: number;

}