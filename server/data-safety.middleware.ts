import * as express from "express";
var sanitize = require("sanitize-html");
import * as ServerUtil from "./util";
import { User } from "./classes/user";

export const dataSafety = function (req: express.Request, res: express.Response, next: express.NextFunction)
{
   if (!res.locals.data) {
      next();
   }
   else
   {
      let iterate = (obj: any) =>
      {
         if (typeof obj === "string") {
            sanitize(obj);
         }
         if (obj instanceof User) {
            obj = ServerUtil.removePersonalData(obj);
         }
         for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
               if (typeof obj[property] === "object")
               {
                     iterate(obj[property]);
               }
               if (typeof obj[property] === "function") //deletes any functions associated with the object
               {
                     delete obj[property]
               }
               else if (typeof obj[property] === "string")
               {
                     // obj[property] = sanitize(obj[property], {
                     //   allowedTags: false,
                     //   allowedAttributes: false
                     // });
               }
            }
         }
      };
      iterate(res.locals.data);
      res.send(res.locals.data);
   }
};