import { call, put, takeEvery, takeLatest } from "redux-saga/effects"
// import Api from "..."
import { GET_SCENES_REQUEST, getScenesSuccess } from "./scene.actions";

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchList() {
   try {
      const scenes = yield call(function () {
         return fetch("/api/scenes/list", {
            method: "GET",
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            }
         }).then( (response) => {
            return response.json();
         });
      });
      yield put(getScenesSuccess(scenes));
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
function* sceneSaga() {
  yield takeLatest(GET_SCENES_REQUEST, fetchList);
}

export default sceneSaga;