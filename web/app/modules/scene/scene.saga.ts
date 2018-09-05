import { call, put, takeEvery, takeLatest } from "redux-saga/effects"
import { GET_SCENES_REQUEST, getScenesSuccess, addSceneSuccess, ADD_SCENE_REQUEST, UPDATE_SCENE_NAME, DELETE_SCENE_REQUEST } from "./scene.actions";
import { CHANGE_LAYOUT } from "../timeline/timeline.actions";
import Scene from "server/models/scene.model";

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
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* sceneSaga() {
  yield takeLatest(GET_SCENES_REQUEST, fetchList);
}


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
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}
export function* addSceneSaga() {
  yield takeLatest(ADD_SCENE_REQUEST, addScene);
}


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
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* updateLayoutSaga() {
   // why?
  yield takeLatest(CHANGE_LAYOUT as any, updateLayout);
}

function* updateName(payload: {scene:Scene}) {
   try {
      const scenes = yield call(function () {
         return fetch("/api/scenes/update-name", {
            body: JSON.stringify(payload),
            method: "PUT",
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
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* updateNameSaga() {
   // why?
  yield takeEvery(UPDATE_SCENE_NAME as any, updateName);
}

function* deleteScene(payload: {id: number}) {
   try {
      const scenes = yield call(function () {
         return fetch("/api/scenes/single", {
            body: JSON.stringify(payload),
            method: "DELETE",
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
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* deleteSceneSaga() {
   // why?
  yield takeEvery(DELETE_SCENE_REQUEST as any, deleteScene);
}