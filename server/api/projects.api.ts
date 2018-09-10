import * as express from "express";
import Project from "../models/project.model";

let router = express.Router();
//Router is namespaced in server.js to /api/sessions
export default function () {

   router.get("/list", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      Project.findAll()
      .then( (projects) =>
      {
         res.send(projects);
      });
   });

   router.post("/add", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let {name} = req.body;
      let project = {
         name: name
      } as Project;
      Project.create(project)
      .then((project) => {
         res.send(project);
      });
   });

   router.put("/update-name", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let project = req.body.payload as Project;

      return Project.update({
         name: project.name
      }, {
         where: {
            id: project.id
         }
      })
      .then(function () {
         return Project.findAll();
      })
      .then( (projects) =>
      {
         res.send(projects);
      });
   });

   router.delete("/single", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let id = req.body.payload;

      return Project.destroy({
         where: {
            id
         }
      })
      .then(function () {
         return Project.findAll();
      })
      .then((projects) =>
      {
         res.send(projects);
      });
   });

   return router;

}