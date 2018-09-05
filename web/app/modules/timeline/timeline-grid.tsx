import * as React from "react";
import * as GridLayout from "react-grid-layout";
import { Layout } from "react-grid-layout";
import { connect } from "react-redux";
import { changeLayout } from "./timeline.actions";
import { getScenes } from "../scene/scene.actions";
import Scene from "server/models/scene.model";
import { SceneBlockContainer } from "./scene-block";

interface ITimelineGridProps {
   onLayoutUpdate: (layout: Layout[]) => void;
   onLoadScenes: () => void;
   list: any[];
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
      // test for equality of objects
      this.props.onLayoutUpdate(layout);
   }
   onResizeStop(layout: Layout[], oldItem: any, newItem: any,
      placeholder: any, e: MouseEvent, element: HTMLElement) {
      console.log(layout);
      // test for equality of objects
      this.props.onLayoutUpdate(layout);
   }
   render() {
      // layout is an array of objects, see the demo for more complete usage
      const layout = createLayoutFromScenes(this.props.list);
      const scenes = this.props.list.map((scene) => 
         <div key={scene.id}>
            <SceneBlockContainer
               scene={scene}>
            </SceneBlockContainer>
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