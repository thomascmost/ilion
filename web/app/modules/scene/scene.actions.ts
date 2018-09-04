export const GET_SCENES_REQUEST = "GET_SCENES_REQUEST";
export const GET_SCENES_SUCCESS = "GET_SCENES_SUCCESS";

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