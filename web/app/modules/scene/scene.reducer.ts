
import { SceneState } from "./scene.state";
import { GET_SCENES_SUCCESS } from "./scene.actions";

export function sceneReducer(state: SceneState = new SceneState(), action: any): SceneState {
   switch (action.type)
   {
      case GET_SCENES_SUCCESS:
      {
         return {...state, list: action.payload};
      }
      default:
      {
         return state;
      }
   }
}
