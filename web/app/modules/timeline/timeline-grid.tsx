import * as React from "react";
import * as GridLayout from "react-grid-layout";
import { Layout } from "react-grid-layout";
import { connect } from "react-redux";
import { changeLayout } from "./timeline.actions";
import { getScenes } from "../scene/scene.actions";
import Scene from "server/models/scene.model";

interface ITimelineGridProps {
   onLayoutUpdate: (layout: Layout[]) => void;
   onLoadScenes: () => void;
   list: any[];
}

const findFirstEmptySpace = (scenes: Scene[]) => {
   let layout = createLayoutFromScenes(scenes);
   let matrixHeight = 1;
   let matrixWidth = 1;
   for (const item of layout) {
      let xBandwidth = item.x + item.w - 1;
      let yBandwidth = item.y + item.h - 1;
      matrixHeight = Math.max(matrixHeight, yBandwidth);
      matrixWidth = Math.max(matrixWidth, xBandwidth);
   }
   const matrix = new Array(matrixHeight);
   for (let row of matrix) {
      row = new Array(matrixWidth);
   }
   for (const item of layout) {
      let countDown = 0;
      while (countDown <= item.h) {
         const y = item.y + countDown
         if (!matrix[y]) {
            matrix[y] = [];
         }
         const row = matrix[item.y + countDown];
         row[item.x] = true;
         let countAcross = 1
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

class TimelineGrid extends React.Component<ITimelineGridProps> {
   componentDidMount() {
      this.props.onLoadScenes();
   }

   onDragStop(layout: Layout[], oldItem: any, newItem: any,
      placeholder: any, e: MouseEvent, element: HTMLElement) {
      console.log(layout);
      this.props.onLayoutUpdate(layout);
   }
   onResizeStop(layout: Layout[], oldItem: any, newItem: any,
      placeholder: any, e: MouseEvent, element: HTMLElement) {
      console.log(layout);
      this.props.onLayoutUpdate(layout);
   }
   render() {
      // layout is an array of objects, see the demo for more complete usage
      const layout = createLayoutFromScenes(this.props.list);
      const scenes = this.props.list.map((scene) => 
         <div key={scene.id}>
            {scene.name}
         </div>)
      return (
         <GridLayout
            compactType={null}
            onDragStop={this.onDragStop.bind(this)}
            onResizeStop={this.onResizeStop.bind(this)}
            className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
         {scenes}
         </GridLayout>
    )
  }
}

///////////////////////////////////
//      Container Component
///////////////////////////////////

const mapStateToProps = (state: any) => {
   return {...state.scenes };
 }

const mapDispatchToProps = (dispatch: any) => {
   return {
      onLayoutUpdate: (layout: Layout[]) => {
         dispatch(changeLayout(layout));
      },
      onLoadScenes: () => {
         dispatch(getScenes());
      },
   };
};

export const TimelineGridContainer: React.ComponentClass<{}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineGrid);