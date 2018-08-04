import * as express from "express";
import Character from "../models/character.model";

//Router is namespaced in server.js to /api/sessions
export default function (router: express.Router) {

   router.get("/list", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      Character.findAll()
      .then(function (characters)
      {
         res.send(characters);
      });
   });

   router.post("/add", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let character = req.body;
      character.project_id = 1;
      Character.create(character)
      .then(function () {
         res.sendStatus(200);
      });
   });

   return router;

}