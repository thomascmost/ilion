import { call, put, takeEvery, takeLatest } from "redux-saga/effects"
// import Api from "..."
import { GetCharacterListRequest, getCharacterListSuccess } from "./character.actions";

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchList() {
   try {
      const characters = yield call(function () {
         return fetch("/api/characters/list", {
            method: "GET",
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            }
         }).then( (response) => {
            return response.json();
         });
      });
      yield put(getCharacterListSuccess(characters));
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

/*
  Alternatively you may use takeLatest.

  Does not allow concurrent fetches of user. If "USER_FETCH_REQUESTED" gets
  dispatched while a fetch is already pending, that pending fetch is cancelled
  and only the latest one will be run.
*/
function* characterSaga() {
  yield takeLatest(GetCharacterListRequest, fetchList);
}

export default characterSaga;