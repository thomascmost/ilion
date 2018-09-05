export const GET_SCENES_REQUEST = "GET_SCENES_REQUEST";
export const GET_SCENES_SUCCESS = "GET_SCENES_SUCCESS";
export const ADD_SCENE_REQUEST = "ADD_SCENE_REQUEST";
export const ADD_SCENE_SUCCESS = "ADD_SCENE_SUCCESS";


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

