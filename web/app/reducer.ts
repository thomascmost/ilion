import { characterReducer } from "./modules/character/character.reducer";
import { projectReducer } from "./modules/project/project.reducer";
import { sceneReducer } from "./modules/scene/scene.reducer";

const ilionReducer = {
      characters: characterReducer,
      projects: projectReducer,
      scenes: sceneReducer
};

export default ilionReducer;
