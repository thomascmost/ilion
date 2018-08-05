import { characterReducer } from "./modules/character/character.reducer";
import { sceneReducer } from "./modules/scene/scene.reducer";

const iliumReducer = {
      characters: characterReducer,
      scenes: sceneReducer
};

export default iliumReducer;
