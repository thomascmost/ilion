import * as express from "express";
let router = express.Router();

import { isAuthenticated, sendUserTokenPackage } from "./auth-middleware";

import * as Q from "q";
import { UserAbst } from "../abstraction/user.abst";
import { UserCreate } from "../abstraction/user-create";
import { User } from "../classes/user";
import * as ServerUtil from "../util";
import * as utilities from "@ilium/shared/utilities";

import { IUserSettings } from "@ilium/models/user-settings";

//Universal Validation Module
import { Val, ValObject } from "@ilium/shared/validation";

import { ISignupCredentials } from "@ilium/models/credentials.model"
import { SuggestedFollows } from "../abstraction/suggested-follow.abst";
import { IYRequest } from "../classes/express-request-augmented";


export default function () {

   /////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Local Sign Up
   //--------------------------------------------------------------------------------------TCMoore//
   /////////////////////////////////////////////////////////////////////////////////////////////////

   // Assembles form data. If no handle, generates one. If no alias, assigns handle to alias. 
   router.post("/", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let signupCredentials: ISignupCredentials = req.body
      if (!signupCredentials.publicName) {
         signupCredentials.publicName = signupCredentials.handle;
      }
      if (signupCredentials.password !== signupCredentials.cPassword) {
         res.send(400);
         return;
      }
      var newUser: UserCreate = new UserCreate();
      newUser.alias = signupCredentials.publicName;
      newUser.email = utilities.normalizeEmail(signupCredentials.email);
      newUser.handle = signupCredentials.handle;
      newUser.password = signupCredentials.password;
      // newUser.fbToken = signupCredentials.fbToken;
      // newUser.gPlusToken = signupCredentials.gPlusToken;
      // newUser.twitterToken = signupCredentials.twitterToken;
      // newUser.fSuppressEmail = signupCredentials.fSuppressEmail;
      // newUser.latitude = signupCredentials.latitude;
      // newUser.longitude = signupCredentials.longitude;
      newUser.registered = true;

      ensureHandle(newUser)
         .then(function () {
            UserAbst.onSignUp(newUser)
               .then(function (user: User) {
                  if (!user) {                           // Theoretically, could have been a bad UserCreate object that failed
                     return res.sendStatus(500); // validation, but we should catch those on the client, so more-likely 500.
                  }
                  // if (signupCredentials.pictureURL) 
                  // {
                  //     user.setProfilePictureToURL(signupCredentials.pictureURL)
                  //     .then(function ()
                  //     {
                  //       req.login(user, function(err: any) //passport's login function, logs user in on signup
                  //       {
                  //         if (err) { return next(err) }
                  //         res.locals.data = user
                  //         next()
                  //       })
                  //     })
                  // }
                  else {
                     return sendUserTokenPackage(res, user);
                  }
               });
         });
   });

   /////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Social Sign Up
   //--------------------------------------------------------------------------------------TCMoore//
   /////////////////////////////////////////////////////////////////////////////////////////////////

   router.post("/social", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("Signing up with social media")
      if (!req.body.displayName) req.body.displayName = req.body.handle
      if (!req.body.fbID) req.body.fbID = null
      if (!req.body.gPlusID) req.body.gPlusID = null
      if (!req.body.twitterID) req.body.twitterID = null
      var newUser: UserCreate = new UserCreate();
      newUser.alias = req.body.displayName;
      newUser.email = utilities.normalizeEmail(req.body.email);
      newUser.handle = utilities.normalizeHandle(req.body.handle);
      newUser.fbToken = req.body.fbID;
      newUser.gPlusToken = req.body.gPlusID;
      newUser.twitterToken = req.body.twitterToken;

      ensureHandle(newUser)
         .then(function () {
            UserAbst.createSocial(newUser)
               .then(function (user: User) {
                  if (!user) {                           // Theoretically, could have been a bad UserCreate object that failed
                     return res.sendStatus(500); // validation, but we should catch those on the client, so more-likely 500.
                  }
                  if (req.body.pictureURL) {
                     user.setProfilePictureToURL(req.body.pictureURL)
                        .then(function (result) {
                           req.login(user, function (err) //passport's login function, logs user in on signup
                           {
                              if (err) { return next(err) }
                              res.locals.data = user
                              next()
                           })
                        })
                        .fail(function (err) { console.log(err) })
                  }
                  else {
                     req.login(user, function (err) //passport's login function, logs user in on signup
                     {
                        if (err) { return next(err) }
                        res.locals.data = user
                        next()
                     })
                  }
               })
         })
   })


   /*-----------------------------------------------------------------------------------------------------------
      ensureHandle
   
   Ensures a unique handle for the user we're going to be creating and sets it into the UserCreate object.
   
   ------------------------------------------------------------------------------------------------ CGMoore --*/
   function ensureHandle(uc: UserCreate): Q.Promise<void> {
      var deferred = Q.defer<void>();
      console.log("Ensuring a unique handle")
      var rootHandle: string;
      if (!uc.handle) {
         if (uc.alias && /^[a-zA-Z]/.test(uc.alias)) // If a display name was given and if it begins with a letter,
         {
            rootHandle = uc.alias.split(" ")[0]
            if (rootHandle.length > 12)
               rootHandle = rootHandle.slice(0, 12)
         }
         else
            rootHandle = "user"
      }
      else
         rootHandle = uc.handle
      ServerUtil.generateHandle(rootHandle)
         .then(function (autoHandle: string) {
            uc.handle = autoHandle
            if (!uc.alias)
               uc.alias = autoHandle
            deferred.resolve();
         })
      return deferred.promise;
   }


   /////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Settings
   //--------------------------------------------------------------------------------------TCMoore//
   /////////////////////////////////////////////////////////////////////////////////////////////////

   //Update a setting for the user by passing in a settings object
   router.post("/settings", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("Updating core settings")
      console.log(req.body)
      var settings: ValObject<IUserSettings> = Val.settings(req.body)
      if (settings.valid && req.user) {
         var user: User = req.user;
         UserAbst.changeSettings(user.id, settings.obj)
            .then(function (result) {
               req.user = { ...req.user, ...settings.obj }
               res.send(req.user)
            })
            .fail(function (err) {
               res.sendStatus(500)
            })
      }
      else { return res.sendStatus(400) }
   });

   router.put("/current-alias", isAuthenticated, function (req: IYRequest, res: express.Response, next: express.NextFunction) {
      if (req.body.keepOldAlias) {
         // console.log("Changing user's current alias, and leaving the old alias active");
         return res.sendStatus(400);
      }
      else {
         console.log("Changing user's current alias, and deactivating the old alias");
      }
      var user = req.user;
      if (user) {
         user.getAllAliases()
            .then((result) => {
               // console.log(result.length);
               // if (result.length >= 4)
               // {
               //    res.send({changesRemaining: false});
               // }
               // else
               // {
               UserAbst.changeAlias(user, req.body.alias, req.body.keepOldAlias)
                  .then((result) => {
                     req.user.alias = req.body.alias;
                     res.sendStatus(204);
                  })
                  .fail((err) => {
                     console.log("An error occurred while changing " + req.user.handle + "'s alias.");
                  });
               // }
            });
      }
      else {
         res.send(401);
      }
   });

   router.post("/disableAlias", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      var user: User = req.user;
      if (user && req.body.activeID) {
         console.log(req.body.activeID)
         user.deactivateAlias(req.body.activeID, false)
            .then(function (result) {
               res.json("Success");
            });
      }
   });

   // Suggested users to follow -- TCMoore
   router.get("/suggested-users", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let uid = req.user.id;
      SuggestedFollows.fromProjects(uid)
         .then((users) => {
            if (users.length < 10) {
               SuggestedFollows.fromInviterFollows(uid)
                  .then((nUsers) => {
                     users = users.concat(nUsers);
                     if (users.length < 10) {
                        SuggestedFollows.fromFollowsFollows(uid)
                           .then((nUsers) => {
                              users = users.concat(nUsers);
                              res.locals.data = users;
                              if (users.length > 10) {
                                 users.length = 10;
                              }
                              next();
                           });
                     }
                     else {
                        users.length = 10;
                        res.locals.data = users;
                        next();
                     }
                  });
            }
            else {
               users.length = 10;
               res.locals.data = users;
               next();
            }
         });
   });

   //not used
   router.get("/activeAliases", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      var user: User = req.user;
      if (user) user.getEnabledAliases()
         .then(function (result) {
            res.locals.data = result
            next()
         })
         .fail(function (err) { })
   })

   router.get("/aliases", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      var user: User = req.user;
      if (user) user.getAllAliases()
         .then(function (result) {
            res.locals.data = result
            next()
         })
         .fail(function (err) { })
   })


   /////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Retrieving Users
   //--------------------------------------------------------------------------------------TCMoore//
   /////////////////////////////////////////////////////////////////////////////////////////////////

   router.get("/getBy/:param", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("Getting a single user by id, handle, or email")
      var currentUserID = (req.user) ? req.user.id : null;
      UserAbst.getByIdOrHandle(req.params.param, currentUserID)
         .then(user => {
            if (!user) {
               res.send({ notFound: true });
            }
            else {
               res.locals.data = user;
               res.send(user);
            }
            //next();
         })
         .fail(function (err) {
            res.sendStatus(500);
         });
   });


   /////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // MetaData
   //--------------------------------------------------------------------------------------TCMoore//
   /////////////////////////////////////////////////////////////////////////////////////////////////

   router.get("/availEmail/:email", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("Check availability of " + req.params.email)
      UserAbst.isEmailAvailable(req.params.email)
         .then((packet) => {
            res.send(packet);
         })
         .fail((err) => { res.json(500); });
   });

   router.get("/availHandle/:handle", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("Check availability of " + req.params.handle)
      UserAbst.isHandleAvailable(req.params.handle)
         .then(function (bool: boolean) {
            res.send(bool);
         })
         .fail(function (err: any) {
            res.json(500);
         })
   })


   /////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // User Relationships
   //--------------------------------------------------------------------------------------TCMoore//
   /////////////////////////////////////////////////////////////////////////////////////////////////

   /* Despite this being a "get", this actually SETS the current user to be a follower of activeID. */
   router.post("/follow", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let activeID = req.body.activeID;
      console.log("following active id: " + activeID);
      UserAbst.followActive(req.user.id, activeID, false)
         .then(function (result: any) {
            res.json("Success!");
         }).fail(err => {
            console.log(err);
         });
   });

   /* Again, like the endpoint above, this actually CHANGES the current user. (It sets the current user to no
    * longer follow activeID.) */
   router.post("/unfollow", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let activeID = req.body.activeID;
         UserAbst.unfollowActive(req.user.id, activeID)
            .then(function (result: any) {
               res.json("Success!");
            }).fail(err => {
               console.log(err);
            });
   });

   router.get("/getFollows", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("getting followers")
      UserAbst.getFollowers(req.query.userID)
         .then(function (followers: User[]) {
            UserAbst.getFollowees(req.query.userID)
               .then(function (followees: User[]) {
                  res.locals.data = { followers: followers, followees: followees };
                  next(); //send through sanitizer
               })
         })
   });

   // router.get('/getfollowees', function (req: express.Request, res: express.Response, next: express.NextFunction)
   // {
   //   console.log('getting followees')
   //   UserAbst.getFollowees(req.query.userID)
   //   .then(function (users: User[])
   //      {     
   //      res.locals.data = users;
   //      next() //send through sanitizer
   //      })
   // })

   // // //Retrieves a list of recommended users for a new user to follow
   // // //Warning! Very dumb right now! Just last ten users that signed up!
   // // //--------------------------------------------------------------------------------------TCMoore
   // // // select user_id, alias, handle, profile_photo_url, COUNT(user_id) as magnitude from  
   // // // (select u.id as user_id, u.handle as handle, a.alias as alias, pp.url AS profile_photo_url, y.id as yoller_id from user u 
   // // // left join active a on a.user_id = u.id
   // // // left join section_active_role sar on sar.active_id = a.id
   // // // left join yoller_section ys on ys.id = sar.yoller_section_id
   // // // left join yoller y on y.id = ys.yoller_id
   // // // LEFT JOIN `photo` pp ON (u.profile_photo_id=pp.id)
   // // // GROUP BY concat(u.id, y.id)) user_yollers
   // // // Group by user_id
   // // // ORDER BY magnitude DESC
   // // // LIMIT 10
   // // 
   // // 
   // // 
   // // router.get('/recommended', isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction)
   // // {
   // //   console.log('getting user recommendations')
   // //   req.user.getRecommendedUsers()
   // //   .then(function (users)
   // //   {      
   // //     res.locals.data = users.userArray
   // //     next()
   // //   })
   // // })
   // // 
   // // 
   // // /////////////////////////////////////////////////////////////////////////////////////////////////
   // // //
   // // // Invitations/Invited Users
   // // //--------------------------------------------------------------------------------------TCMoore//
   // // /////////////////////////////////////////////////////////////////////////////////////////////////

   router.post("/invite", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("inviting user");
      var alias = req.body.alias;
      var email = req.body.email;
      ServerUtil.inviteOne(alias, email, req.user.id)
         .then(function (user: User) {
            res.locals.data = user;
            next();
         });
   });

   router.post("/send-mass-invites", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("inviting users");
      var emails = req.body.inviteFields;
      let user: User = req.user;
      ServerUtil.massInvite(emails, user.id, user.alias, user.handle, user.profilePhoto)
         .then(function (user: User) {
            res.send(204);
         });
   });
   // // 
   // // router.post('/inviteBulk', isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction)
   // // {
   // //   console.log('inviting users')
   // //   var collabSects = req.body.collabSects
   // //   utilities.inviteRecur(collabSects, req.user.id)
   // //   .then(function (collabSects)
   // //   {
   // //       res.locals.data = collabSects
   // //       next()
   // //   })
   // // })
   // // 
   router.post("/registerInvited", isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
      console.log("Registering an invited user");
      let signupCredentials: ISignupCredentials = req.body;
      if (!req.user.registered) {
         UserAbst.registerInvited(req.user.id, signupCredentials.publicName, signupCredentials.handle, signupCredentials.password)
            .then((result: User) => {
               console.log("resolved");
               req.user.registered = true;
               req.user.handle = signupCredentials.handle;
               req.user.alias = signupCredentials.publicName;
               res.locals.data = req.user;
               next();
            })
            .fail((err: Error) => {
               console.log("An error occurred");
            });
      }
      else {
         console.log("User already registered");
      }
   });
   // // 
   // // router.post('/followByEmail', function (req: express.Request, res: express.Response, next: express.NextFunction)
   // // {
   // //   console.log('creating an "invited" user who will follow this person')
   // //   let email = req.body.email
   // //   let activeID = req.body.activeID
   // //   UserAbst.get(req.body.email)
   // //   .then(function (ghostUser)
   // //   {
   // //       console.log(ghostUser)
   // //       if (!ghostUser)
   // //       {
   // //          UserAbst.createGhost(email.split('@')[0], email, 0)
   // //          .then(function (ghost)
   // //          {
   // //             Active.get(activeID)
   // //             .then(function (fActive)
   // //             {
   // //                ghost.createGhostFollowCode(activeID)
   // //                .then(function (result)
   // //                {
   // //                  ghost.sendGhostFollowConfirmation(fActive.obj)
   // //                  .then(function (result)
   // //                  {
   // //                     res.send("sent")
   // //                  })
   // //                })
   // //             })
   // //          })
   // //       }
   // //       else {
   // //         Active.get(activeID, ghostUser.id)
   // //          .then(function (fActive)
   // //          {
   // //             if (fActive.obj.isFollowee)
   // //             {
   // //                res.send("following");
   // //             }
   // //             else {
   // //                ghostUser.createGhostFollowCode(activeID)
   // //                .then(function (result)
   // //                {
   // //                  ghostUser.sendGhostFollowConfirmation(fActive.obj)
   // //                  .then(function (result)
   // //                  {
   // //                     res.send("sent")
   // //                  })
   // //                })
   // //             }
   // //          })
   // //       }
   // //    })
   // // })
   // // 
   // // /////////////////////////////////////////////////////////////////////////////////////////////////
   // // //
   // // // Credits
   // // //--------------------------------------------------------------------------------------TCMoore//
   // // /////////////////////////////////////////////////////////////////////////////////////////////////
   // // 

   router.get("/totalYollerCount/", function (req: express.Request, res: express.Response, next: express.NextFunction) {
      UserAbst.getTotalYollerCount(req.query.userID)
         .then(function (count: number) {
            console.log("count: " + count);
            res.send({ count: count });
         })
         .fail(function (err: any) {
            console.log(err);
         });
   });
   // // /////////////////////////////////////////////////////////////////////////////////////////////////
   // // //
   // // // Accounts
   // // //--------------------------------------------------------------------------------------TCMoore//
   // // /////////////////////////////////////////////////////////////////////////////////////////////////
   // // 
   // // //Attaches a social media account (either facebook or google, currently) to an existing user
   // // //--------------------------------------------------------------------------------------TCMoore
   // // router.post('/attachAccount', isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction)
   // // {
   // //   //This should only ever be called by a user who is already logged in and attaching a social media account.
   // //   switch (req.body.account)
   // //       {
   // //          case 'facebook':
   // //             req.user.attachFB(req.body.accountID)
   // //             .then(function(result)
   // //             {
   // //               res.send("Success")
   // //             })
   // //             break
   // //          case 'google':
   // //             req.user.attachGPlus(req.body.accountID)
   // //             .then(function(result)
   // //             {
   // //               res.send("Success")
   // //             })
   // //             break
   // //       }
   // //     
   // // })
   // // 
   // // 
   // // //STICKYNOTE
   // // 
   // // router.put('/dismissSticky', isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction)
   // // {
   // //   console.log('Dismissing!')
   // //   req.user.setSticky(false)
   // //   .then(function (result)
   // //   {
   // //     res.send(204)
   // //   })
   // // })
   // // 
   // // router.post('/recordFeedback', isAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction)
   // // {
   // //  console.log(req.body.good) 
   // //  req.user.recordFeedback(req.body.good, req.body.bad, req.body.featureRequest)
   // //   .then(function(result)
   // //   {
   // //     req.user.setSticky(false)
   // //       .then(function (result)
   // //       {
   // //         res.send(204)
   // //       })
   // //   })
   // // })

   return router;
}
