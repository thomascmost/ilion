import { call, put, takeEvery, takeLatest } from "redux-saga/effects"
// import Api from "..."
import { GET_SCENES_REQUEST, getScenesSuccess, addSceneSuccess, ADD_SCENE_REQUEST } from "./scene.actions";
import { CHANGE_LAYOUT } from "../timeline/timeline.actions";

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
export function* sceneSaga() {
  yield takeLatest(GET_SCENES_REQUEST, fetchList);
}


// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* addScene(scene: any) {
   try {
      const newScene = yield call(function () {
         return fetch("/api/scenes/add", {
            body: JSON.stringify(scene),
            method: "POST",
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            }
         }).then( (response) => {
            return response.json();
         });
      });
      yield put(addSceneSuccess(newScene));
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}
export function* addSceneSaga() {
  yield takeLatest(ADD_SCENE_REQUEST, addScene);
}


// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* updateLayout(scenes: any[]) {
   try {
      const newScene = yield call(function () {
         return fetch("/api/scenes/update-layout", {
            body: JSON.stringify(scenes),
            method: "PUT",
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            }
         }).then( (response) => {
            return response.json();
         });
      });
      // yield put(addSceneSuccess(newScene));
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* updateLayoutSaga() {
  yield takeLatest(CHANGE_LAYOUT, updateLayout);
}