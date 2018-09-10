
import { ProjectState } from "./project.state";
import { GET_PROJECT_LIST_SUCCESS } from "./project.actions";

export function projectReducer(state: ProjectState = new ProjectState(), action: any): ProjectState {
   switch (action.type)
   {
      case GET_PROJECT_LIST_SUCCESS:
      {
         return {...state, list: action.payload};
      }
      default:
      {
         return state;
      }
   }
}
