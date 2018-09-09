import * as React from "react";
import { connect } from "react-redux";
import Scene from "server/models/scene.model";
import { Layout } from "react-grid-layout";
import { addScene } from "../scene/scene.actions";

interface IAddSceneAffordanceProps {
   scenes: Scene[];
   addScene: (x: number, y: number) => void;
}

const findFirstEmptySpace = (scenes: Scene[]) => {
   let layout = createLayoutFromScenes(scenes);
   let matrixHeight = 2;
   let matrixWidth = 1;
   for (const item of layout) {
      let xBandwidth = item.x + item.w;
      let yBandwidth = item.y + item.h;
      matrixHeight = Math.max(matrixHeight, yBandwidth);
      matrixWidth = Math.max(matrixWidth, xBandwidth);
   }
   const matrix = new Array(matrixHeight);
   for (let i = 0; i < matrix.length; i ++) {
      matrix[i] = new Array(matrixWidth);
   }
   for (const item of layout) {
      let countDown = 0;
      while (countDown < item.h) {
         const y = item.y + countDown
         const row = matrix[y];
         let countAcross = 0
         while (countAcross < item.w) {
            row[item.x + countAcross] = true;
            countAcross ++;
         }
         countDown ++;
      }
   }
   for (let y = 0; y < matrix.length; y++)
   {
      const row = matrix[y];
      for (let x = 0; x < row.length; x++) {
         if (!row[x] && !matrix[y+1][x]) {
            return { x, y }
         }
      }
   }
   return {x: 0, y: matrixHeight }
}

const createLayoutFromScenes = (scenes: Scene[]) =>
   scenes.map((scene) => ({
      i: scene.id.toString(),
      x: scene.gridX,
      y: scene.gridY,
      w: scene.colSpan,
      h: scene.lengthGrid,
      maxW: 1,
      maxH: 12,
   }))

class AddSceneAffordance extends React.Component<IAddSceneAffordanceProps> {

   addScene() {
      const {x, y} = findFirstEmptySpace(this.props.scenes)
      this.props.addScene(x, y);
   }
   render() {
      return (
         <button onClick={(e) => {
            this.addScene();
            e.preventDefault();
         }}>
            Add New Scene
         </button>
    )
  }
}

///////////////////////////////////
//      Container Component
///////////////////////////////////

const mapStateToProps = (state: any) => {
   return {
      scenes: state.scenes.list
   }
 }

const mapDispatchToProps = (dispatch: any) => {
   return {
      addScene: (x: number, y: number) => {
         dispatch(addScene(x, y))
      }
   };
};

export const AddSceneAffordanceContainer: React.ComponentClass<{}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddSceneAffordance);