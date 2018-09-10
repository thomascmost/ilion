import { call, put, takeEvery, takeLatest } from "redux-saga/effects"
import { getProjectsSuccess, addProjectSuccess, ADD_PROJECT_REQUEST, UPDATE_PROJECT_NAME, DELETE_PROJECT_REQUEST, GET_PROJECT_LIST_REQUEST } from "./project.actions";
import { CHANGE_LAYOUT } from "../timeline/timeline.actions";
import Project from "server/models/scene.model";

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchList() {
   try {
      const projects = yield call(function () {
         return fetch("/api/projects/list", {
            method: "GET",
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            }
         }).then( (response) => {
            return response.json();
         });
      });
      yield put(getProjectsSuccess(projects));
   } catch (e) {
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* getProjectsSaga() {
   yield takeLatest(GET_PROJECT_LIST_REQUEST, fetchList);
}

function* addProject(scene: any) {
   try {
      const newProject = yield call(function () {
         return fetch("/api/projects/add", {
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
      yield put(addProjectSuccess(newProject));
   } catch (e) {
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}
export function* addProjectSaga() {
  yield takeLatest(ADD_PROJECT_REQUEST, addProject);
}


function* updateLayout(projects: any[]) {
   try {
      const newProject = yield call(function () {
         return fetch("/api/projects/update-layout", {
            body: JSON.stringify(projects),
            method: "PUT",
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            }
         }).then( (response) => {
            return response.json();
         });
      });
      // yield put(addProjectSuccess(newProject));
   } catch (e) {
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* updateLayoutSaga() {
   // why?
  yield takeLatest(CHANGE_LAYOUT as any, updateLayout);
}

function* updateName(payload: {scene:Project}) {
   try {
      const projects = yield call(function () {
         return fetch("/api/projects/update-name", {
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
      yield put(getProjectsSuccess(projects));
   } catch (e) {
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* updateNameSaga() {
   // why?
  yield takeEvery(UPDATE_PROJECT_NAME as any, updateName);
}

function* deleteProject(payload: {id: number}) {
   try {
      const projects = yield call(function () {
         return fetch("/api/projects/single", {
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
      yield put(getProjectsSuccess(projects));
   } catch (e) {
      // yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

export function* deleteProjectSaga() {
   // why?
  yield takeEvery(DELETE_PROJECT_REQUEST as any, deleteProject);
}