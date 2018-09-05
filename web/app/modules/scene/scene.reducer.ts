
import { SceneState } from "./scene.state";
import { GET_SCENES_SUCCESS, ADD_SCENE_REQUEST } from "./scene.actions";

export function sceneReducer(state: SceneState = new SceneState(), action: any): SceneState {
   switch (action.type)
   {
      case GET_SCENES_SUCCESS:
      {
         return {...state, list: action.payload};
      }
      case ADD_SCENE_REQUEST:
      {
         let {x,y} = action.payload;
         let list = state.list.slice();
         list.push({
            name: "New Scene",
            id: Math.random().toString(),
            gridX: x,
            gridY: y,
            lengthGrid: 2,
            colSpan: 1
         })
         return {...state, list: list};
      }
      default:
      {
         return state;
      }
   }
}
