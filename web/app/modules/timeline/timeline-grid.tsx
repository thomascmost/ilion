import * as React from "react";
import * as GridLayout from "react-grid-layout";
import { Layout } from "react-grid-layout";
import { connect } from "react-redux";
import { changeLayout } from "./timeline.actions";
import { getScenes } from "../scene/scene.actions";

interface ITimelineGridProps {
   onLayoutUpdate: (layout: Layout[]) => void;
   onLoadScenes: () => void;
   list: any[];
}

class TimelineGrid extends React.Component<ITimelineGridProps> {
   componentDidMount() {
      this.props.onLoadScenes();
   }
   componentDidUpdate() {
      console.log(this.props);
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
      var layout = [
         {i: "a1", x: 0, y: 0, w: 1, h: 2, static: false},
         {i: "a2", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
         {i: "b1", x: 4, y: 0, w: 1, h: 2}
      ];
      return (
         <GridLayout
            compactType={null}
            onDragStop={this.onDragStop.bind(this)}
            onResizeStop={this.onResizeStop.bind(this)}
            className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
         <div key="a1">Scene A1</div>
         <div key="a2">Scene A2</div>
         <div key="b1">Scene B1</div>
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