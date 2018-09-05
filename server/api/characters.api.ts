import * as express from "express";
import Character from "../models/character.model";

let router = express.Router();
//Router is namespaced in server.js to /api/sessions
export default function () {

   router.get("/list", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      Character.findAll()
      .then( (characters) =>
      {
         res.send(characters);
      });
   });

   router.post("/add", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let character = req.body;
      if (!character.name) {
         res.sendStatus(403);
         return;
      }
      character.project_id = 1;
      Character.create(character)
      .then(function () {
         res.sendStatus(200);
      });
   });

   return router;

}