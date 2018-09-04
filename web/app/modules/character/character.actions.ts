
export const GetCharacterListRequest = "GET_CHARACTER_LIST_REQUEST";
export const GetCharacterListFailure = "GET_CHARACTER_LIST_FAILURE";
export const GetCharacterListSuccess = "GET_CHARACTER_LIST_SUCCESS";

export const getCharacterList = () => {
   return {
      type: GetCharacterListRequest
   };
};

export const getCharacterListSuccess = (characters: any[]) => {
   return {
      type: GetCharacterListSuccess,
      payload: characters
   };
};