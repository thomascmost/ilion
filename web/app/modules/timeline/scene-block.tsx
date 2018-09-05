import * as React from "react";
import Scene from "server/models/scene.model";
import { deleteScene } from "../scene/scene.actions";
import { connect } from "react-redux";
const styles = require("./scene-block.scss")

interface IParentProps {
   scene: Scene;
}

interface ISceneBlockProps extends IParentProps {
   deleteScene: (scene: Scene) => void;
}
export const SceneBlock = (props: ISceneBlockProps) => {
      return <div className={styles.container}>
         {props.scene.name}
         <span onClick={() => props.deleteScene(props.scene)} className="delete">Delete</span>
      </div>;
   }

///////////////////////////////////
//      Container Component
///////////////////////////////////

const mapStateToProps = (state: any, parentProps: any) => {
   return {
      ...parentProps
   }
 }

const mapDispatchToProps = (dispatch: any) => {
   return {
      deleteScene: (scene: Scene) => {
         dispatch(deleteScene(scene))
      }
   };
};

export const SceneBlockContainer: React.ComponentClass<IParentProps> = connect(
  mapStateToProps,
  mapDispatchToProps
)(SceneBlock);