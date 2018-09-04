
import { CharacterState } from "./character.state";
import { GetCharacterListSuccess } from "./character.actions";

export function characterReducer(state: CharacterState = new CharacterState(), action: any): CharacterState {
   switch (action.type)
   {
      case GetCharacterListSuccess:
      {
         return {...state, list: action.payload};
      }
      default:
      {
         return state;
      }
   }
}
