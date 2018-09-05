import Scene from "server/models/scene.model";

export const GET_SCENES_REQUEST = "GET_SCENES_REQUEST";
export const GET_SCENES_SUCCESS = "GET_SCENES_SUCCESS";
export const ADD_SCENE_REQUEST = "ADD_SCENE_REQUEST";
export const ADD_SCENE_SUCCESS = "ADD_SCENE_SUCCESS";
export const UPDATE_SCENE_NAME = "UPDATE_SCENE_NAME";
export const DELETE_SCENE_REQUEST = "DELETE_SCENE_REQUEST";
// export const DELETE_SCENE_SUCCESS = "DELETE_SCENE_SUCCESS";


export const getScenes = () => {
   return {
      type: GET_SCENES_REQUEST
   };
};

export const getScenesSuccess = (scenes: any[]) => {
   return {
      type: GET_SCENES_SUCCESS,
      payload: scenes
   };
};


export const addScene = (x: number, y: number) => {
   return {
      type: ADD_SCENE_REQUEST,
      payload: {x, y}
   };
};

export const addSceneSuccess = (scenes: any[]) => {
   return {
      type: ADD_SCENE_SUCCESS
   };
};

// refactor to 'update scene' in future
export const updateSceneName = (scene: Scene) => {
   return {
      type: UPDATE_SCENE_NAME,
      payload: scene
   };
};

export const deleteScene = (scene: Scene) => {
   return {
      type: DELETE_SCENE_REQUEST,
      payload: scene.id
   };
};
