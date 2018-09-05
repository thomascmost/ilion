//api/sessions.js

//Universal Validation Module

import * as express from "express";
let router = express.Router();

import { isAuthenticated, sendUserTokenPackage } from "./auth-middleware";
import { IUser } from "shared/interfaces/user";

//Router is namespaced in server.js to /api/sessions
export default function (passport: any) {

   //receives cookie, returns user object in session or null
   router.get("/user", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      passport.authenticate("jwt", {session: false}, function(err: any, user: IUser, info: any) {
        if (err) { return next(err); }
        if (!user) { return res.send({}); }
        return res.send(user);
      })(req, res, next);
   });

   router.get("/reset", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      // UserAbst.getByID(req.user.id)
      // .then(user => {
      //    return sendUserTokenPackage(res, user);
      // });
   });

   //Invokes authentication within the route hain
   //This is a fairly complex route because we have to nest the passport strategy within a standard middleware function
   //in order to give it access to the request object in its custom 'done' callback (which we've overwritten in the
   //second parameter).
   //'done()' invokes the function(err, user, info) defined on lines 20-42, and the whole authentication call
   //has to be given the (req, res, next) parameters (as we are redefining its basic middleware).
   //The point of all this is that we are able to return a failure message specific to the circumstances of failure,
   //Rather than just a 401
   router.post("/login", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      passport.authenticate("local", {session: false}, (err: any, user: IUser, info: {reason: string, message: string}) =>
      {
         if (err) { return next(err); }
         if (!user)
         {
            //login failed for an expected reason
            return res.send({ reason: info.reason, failure: info.message });
         }
         else
         {
            return sendUserTokenPackage(res, user);
         }
      }) (req, res, next);
   });

     //Calls the Passport logout method to end the user session
   router.get("/logout", function (req: express.Request, res:express.Response, next: express.NextFunction) {
      res.clearCookie("JWT_TOKEN");
      res.send({});
   });

   return router;

}