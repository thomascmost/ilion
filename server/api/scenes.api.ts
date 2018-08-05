import * as express from "express";
import Scene from "../models/scene.model";

//Router is namespaced in server.js to /api/sessions
export default function (router: express.Router) {

   router.get("/list", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      Scene.findAll()
      .then( (scenes) =>
      {
         res.send(scenes);
      });
   });

   router.post("/add", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let scene = req.body;
      scene.project_id = 1;
      Scene.create(scene)
      .then(function () {
         res.sendStatus(200);
      });
   });

   return router;

}