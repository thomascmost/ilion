import { characterReducer } from "./modules/character/character.reducer";
import { sceneReducer } from "./modules/scene/scene.reducer";

const ilionReducer = {
      characters: characterReducer,
      scenes: sceneReducer
};

export default ilionReducer;
