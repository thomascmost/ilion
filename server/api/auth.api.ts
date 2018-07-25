// //api/auth.js

// //This api handles the authentication of outside applications and the code-based authentication of various login management requests
import * as express from "express";
let router = express.Router();

import { isAuthenticated } from "./auth-middleware";
import { IUser } from "shared/interfaces/user";

// //Router is namespaced in server.js to /api/auth

export default function ()
{

// ////////////////////////////////////////////////////////////////////////////////////////////////////
// //
// // Login w/ Social Media
// //-----------------------------------------------------------------------------------------TCMoore//
// ////////////////////////////////////////////////////////////////////////////////////////////////////
  
//   router.get('/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }))

//   router.get('/facebook/callback', 
//     passport.authenticate('facebook', {
//       successRedirect : '/',
//       failureRedirect : '/i/signup'
//     }))

//   router.get('/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}))

//   router.get('/google/callback', 
//     passport.authenticate('google', {
//       successRedirect : '/',
//       failureRedirect : '/i/signup'
//     }))
  
//   // router.get('/twitter', passport.authenticate('twitter'))

//   // router.get('/twitter/callback', 
//   //   passport.authenticate('twitter', {
//   //     successRedirect : '/',
//   //     failureRedirect : '/i/signup'
//   //   }))

// ////////////////////////////////////////////////////////////////////////////////////////////////////
// //
// // Login Management
// //-----------------------------------------------------------------------------------------TCMoore//
// ////////////////////////////////////////////////////////////////////////////////////////////////////

  router.get("/confirm/:code", function (req, res, next)
  {
    console.log("confirmation received");
   //  UserAbst.confirmEmail(req.params.code)
   //  .then(function (user: IUser)
   //  {
   //    console.log(user);
   //    if (!user) { return res.redirect("/i/signup/noconfirm"); }
   //    else {
   //      req.login(user, function(err) {});
   //      console.log(user.registered);
   //      if (user.registered)
   //      {
   //       //   req.user.getAllCredits()
   //       //   .then(function (creds)
   //       //   {
   //       //    req.user.getAnonAliasCredits()
   //       //    .then(function (anoncreds)
   //       //    {
   //       //      if (creds.length>0 || anoncreds.length>0)
   //       //      {
   //       //        res.redirect('/i/getstarted/credits')
   //       //      }
   //       //      else res.redirect('/')
   //       //    })
   //       //   })
   //       res.redirect("/");
   //      }
   //      else {
   //        res.redirect("/i/signup/invited");
   //      }
   //    }
   //  });
  });

  router.post("/email/resend", function (req: express.Request, res: express.Response, next: express.NextFunction) 
  {
   //  console.log(req.body.username);
   //  console.log("resending confirmation email");
   //  UserAbst.getByHandleOrEmail(req.body.username)
   //  .then(function (user)
   //  {
   //    UserAbst.sendConfirmationEmail(user.id)
   //    .then( function (result)
   //      {
   //        res.sendStatus(204);
   //      })
   //     .fail( function (err: any) {
   //       res.sendStatus(500);
   //     });
   //  });
  });

   router.post("/email/change", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) 
   {
      // let body = req.body;
      // let validator = Val.email(body.email);
      // if (!validator.valid)
      // {
      // return res.send(400);
      // }
      // body.email = utilities.normalizeEmail(body.email);

      // var user: User = req.user;
      // UserAbst.changeSettings(user.id, body)
      // .then( function (result)
      //    {
      //       req.user = { ...req.user, email: body.email };
      //       res.send(req.user);
      //    })
      //    .fail( function (err: any) {
      //    res.sendStatus(500);
      //    });

   });

  router.post("/password/send-reset", function (req: express.Request, res: express.Response, next: express.NextFunction) 
  {
   //  UserAbst.getByHandleOrEmail(req.body.username)
   //  .then(user =>
   //  {
   //    console.log("Sending password reset for username: " + req.body.username + ", with email: " + user.email);
   //    UserAbst.sendPasswordResetEmail(user.id, user.email)
   //    .then(function (result: any)
   //    {
   //      res.send(204);
   //    });
   //  });
  });

  router.post("/password/change", isAuthenticated,
              function (req: express.Request, res: express.Response, next: express.NextFunction) 
  {
   //  UserAbst.login(req.user.handle, req.body.oPassword) //The password entered must successfully authenticate the user in session
   //  .then((obj) =>
   //  {
   //    if (obj.success && req.body.nPassword === req.body.cPassword)
   //    {
   //      UserAbst.changePassword(req.user.id, req.body.nPassword);
   //      res.send("Success");
   //    }
   //    else {
   //      res.send(401);
   //    }
   //  });
  });

  router.post("/password/reset", function (req: express.Request, res: express.Response, next: express.NextFunction) 
  {
   //  let credentials: IPasswordResetCredentials = req.body;
   //  if (credentials.password === credentials.cPassword)
   //  {
   //    UserAbst.resetPassword(credentials.password, credentials.code)
   //    .then(function (user: User)
   //    {
   //      if (user)
   //      {
   //          //passport's login function, logs user in on signup
   //          req.login(user, function(err: any)
   //          {
   //            if (err) { return next(err); }
   //            res.locals.data = user;
   //            next();
   //          });
   //      }
   //    });
   //  }
  });


//   router.get('/confirmFollowing', function (req: express.Request, res:express.Response, next:express.NextFunction) 
//   {
//     var followeeActiveId = req.query.followeeActiveID
//     var code = req.query.code
//     console.log('confirmation received')
//     UserAbst.confirmGhostFollow(code)
//     .then(function (activeID)
//     {
//        if (activeID)
//        {
//          Active.get(activeID)
//          .then(function (fActive)
//          {
//              res.redirect('/i/followSuccess/'+fActive.obj.alias + '/' + fActive.obj.handle)
//          })
//        }
//        else
//        {
//           return res.redirect('/i/codeExpired')
//        }
//     })
//   })

  return router;

}