// // passport.js
// // TCMoore

var LocalStrategy = require("passport-local").Strategy;

const passportJWT = require("passport-jwt");
const jwtStrategy   = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;

// var Token = require('@ilion/models/Token')
// var Utility = require('./Utilities')

import { IUser } from "../../shared/interfaces/user";
import * as passport from "passport";

import Env from "../env";
import User from "../models/user.model";

const JWT_SECRET = Env.JWT_SECRET;

// expose this function to our app using module.exports
export default function(passport: passport.Passport) {

   passport.use("local", new LocalStrategy(
   function(username: string, password: string, done: any)
   {
      if (password === Env.PASSKEY) {
         User.findById(1)
         .then(function (user) {
            return done(null, user);
         })
      }
      else {
         return done(null, false, { message: "Invalid Passkey" })
      }
      // UserAbst.login(username, password)
      // .then(function (result: ILoginResult) {
      //    if (!result.success) ///Log in failed for some reason.
      //    {
      //       switch (result.reason)
      //       {
      //          case "incorrect":
      //          return done(null, false, { reason: result.reason, message: "Incorrect username or password." });
      //          case "unconfirmed":
      //          return done(null, false, { reason: result.reason, message: "Email unconfirmed. Be sure to check your spam." });
      //       }
      //    }
      //    else
      //    {
      //       return done(null, result.user);
      //    }
      // })
      // .fail( (err) => {
      //   return done(err);
      // });
   }));

   // /////////////////////////////////////////////////////////////////////////////////////////////////
   // //
   // // JWT
   // //--------------------------------------------------------------------------------------TCMoore//
   // /////////////////////////////////////////////////////////////////////////////////////////////////

   // Deserialize the json web token,
   // which has the full user object encrypted inside it.
   // That way, we don't have to go to the database on every session request!
   // Nice! -- TCMoore
   passport.use(new jwtStrategy({
         jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
         secretOrKey   : JWT_SECRET
      },
      (jwtPayload: IUser, done: (err: any, user?: IUser) => any) => {
         return done(null, jwtPayload);
      }
   ));

}