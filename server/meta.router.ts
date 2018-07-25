// //api/auth.js

// //This api handles the authentication of outside applications and the code-based authentication of various login management requests
import * as express from "express";
let router = express.Router();

const stripHtml = require("string-strip-html");

import * as Q from "q";

import {UserAbst} from "./abstraction/user.abst";
import {YollerAbst} from "./abstraction/yoller.abst";


router.get("/i/project/:projectID", function (req:express.Request, res: express.Response, next: express.NextFunction) 
{
   let projectID = parseInt(req.params.projectID);

   YollerAbst.getByID(projectID).then((yoller) => {
      if (yoller)
      {
         console.log("serving bot.handlebars");
         res.status(200).render("bot", {

             // Now we update layout variables with DB info.
             socialUrl: req.protocol + "://" + req.headers.host + req.url,
             socialTitle: yoller.title,
             socialDescription: stripHtml(yoller.description),
             socialImageUrl: yoller.coverImgURL || "https://www.ilium.com/img/card.png"
         })
      }
      else {
           next();
       }
   });
})

router.get("/:handle", function (req:express.Request, res: express.Response, next: express.NextFunction) 
{
   let handle = req.params.handle;

   let img = "img/email_header.png";

   UserAbst.getByHandle(handle).then((user) => {
      if (user)
      {
         console.log("serving bot.handlebars");
         res.status(200).render("bot", {

             // Now we update layout variables with DB info.
             socialUrl: req.protocol + "://" + req.headers.host + req.url,
             socialTitle: user.alias,
             socialDescription: user.bio,
             socialImageUrl: user.profilePhoto || "https://www.ilium.com/img/card.png"
         })
      }
      else {
           next();
       }
   });
})

export default router;