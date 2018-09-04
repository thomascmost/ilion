
export const GET_PROJECT_LIST_REQUEST = "GET_PROJECT_LIST_REQUEST";
export const GET_PROJECT_LIST_FAILURE = "GET_PROJECT_LIST_FAILURE";
export const GET_PROJECT_LIST_SUCCESS = "GET_PROJECT_LIST_SUCCESS";

export const getProjectList = () => {
   return {
      type: GET_PROJECT_LIST_REQUEST
   };
};

export const getProjectListSuccess = (list: any[]) => {
   return {
      type: GET_PROJECT_LIST_SUCCESS,
      payload: list
   };
};