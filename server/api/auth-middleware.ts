// auth-middleware.ts
// TCMoore

import * as express from "express";
import * as passport from "passport";
import * as jwt from "jsonwebtoken";

import Env from "../env";
import { IUser } from "shared/interfaces/user";

const JWT_SECRET = Env.JWT_SECRET;

export const isAuthenticated = passport.authenticate("jwt", {session: false});

export const tryDecryptUser = function (req: express.Request, res: express.Response, next: express.NextFunction) {
   passport.authenticate("jwt", {session: false}, function(err: any, user: IUser, info: any) {
     if (err) { return next(err); }
     if (user) {
        req.user = user;
     }
     next();
   })(req, res, next);
};

export const sendUserTokenPackage = function (res: express.Response, user: IUser) {
   const token = jwt.sign({...user}, JWT_SECRET);
   return res.json({user, token});
}