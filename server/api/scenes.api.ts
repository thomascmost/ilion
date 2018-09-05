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

   router.put("/update-layout", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let scenes = req.body.payload as Scene[];

      Promise.all(scenes.map((scene) => {

         scene.start_point = scene.gridY * 1000 * 60 * 5,
         scene.end_point = scene.gridY * 1000 * 60 * 5 + scene.lengthGrid * 1000 * 60 * 5
         return Scene.update({
            x_col: scene.x_col,
            start_point: scene.start_point,
            end_point: scene.end_point
         }, {
            where: {
               id: scene.id
            }
         })
      }))
      .then(function () {
         return Scene.findAll()
      })
      .then( (scenes) =>
      {
         res.send(scenes);
      });
   });

   router.put("/update-name", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let scene = req.body.payload as Scene;

      return Scene.update({
         name: scene.name
      }, {
         where: {
            id: scene.id
         }
      })
      .then(function () {
         return Scene.findAll()
      })
      .then( (scenes) =>
      {
         res.send(scenes);
      });
   });

   router.delete("/single", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let id = req.body.payload;

      return Scene.destroy({
         where: {
            id
         }
      })
      .then(function () {
         return Scene.findAll()
      })
      .then((scenes) =>
      {
         res.send(scenes);
      });
   });

   return router;

}