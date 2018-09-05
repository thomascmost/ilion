import * as express from "express";
import Scene from "../models/scene.model";

let router = express.Router();
//Router is namespaced in server.js to /api/sessions
export default function () {

   router.get("/list", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      Scene.findAll()
      .then( (scenes) =>
      {
         res.send(scenes);
      });
   });

   router.post("/add", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let {x,y} = req.body.payload;
      let scene = {
         name: 'New Scene',
         x_col: x,
         start_point: y * 1000 * 60 * 5,
         end_point: y * 1000 * 60 * 5 + (1000 * 60 * 10)
      } as Scene;
      scene.project_id = 1;
      Scene.create(scene)
      .then(function (scene) {
         res.send(scene);
      });
   });

   return router;

}