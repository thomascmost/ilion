import * as db from "../abstraction/db.access";
import * as Q from "q";
// import * as sendgrid from 'sendgrid';
// import YStrings from '../strings';
// import {UserCreate} from './user-create';
import {IUserSettings} from "@ilion/models/user-types";
import {OkPacket, UpImgRes} from "@ilion/models/other.model";

/*-----------------------------------------------------------------------------------------------------------
   UserRow

This interface must be kept identical to a subset (though not necessarily a strict subset) of the columns
that make up a row in the 'user' table. Furthermore, the names of the fields here must exactly match the
names of the columns in the table. 

------------------------------------------------------------------------------------------------ CGMoore --*/
export interface UserRow
   {
   id            : number;
   active_id     : number;
   profile_photo_id: number;
   handle        : string;
   email         : string;
   email_notifications: number;
   phone         : string;
   phone_notifications: number;
   registered    : number;
   bio           : string;
   fb_token      : string;
   gplus_token   : string;
   twitter_token : string;
   given_name    : string;
   family_name   : string;
   sticky        : number;
   admin         : number;
   aesir         : number;
   timezone      : string;
   tagline       : string;
   }

export interface UserRowExt extends UserRow
   {
   alias: string;
   profile_photo_url: string;
   }

export class UserMin
   {
   id        : number;
   activeID  : number;
   handle    : string;
   registered: boolean;
   familyName: string;
   givenName : string;
   email     : string;
   emailNtfs : boolean;
   phone     : string;
   phoneNtfs : boolean;
   bio       : string;
   tagline   : string;
   fbToken   : string;
   gPlusToken: string;
   sticky    : boolean;
   admin     : boolean;
   aesir     : boolean;
   timezone  : string;
   profilePhotoID: number;
   twitterToken  : string;

   isFriend      : boolean;
   isFollower    : boolean;
   isFollowee    : boolean;
   isNtfFollowee : boolean;
      
	constructor(info: UserRow)
      {
      this.id             = info.id;
      this.activeID       = info.active_id;
      this.profilePhotoID = info.profile_photo_id;
      this.handle         = info.handle;
      this.registered     = Boolean(info.registered);
      this.givenName      = info.given_name;
      this.familyName     = info.family_name;
      this.email          = info.email;
      this.emailNtfs      = Boolean(info.email_notifications);
      this.phone          = info.phone;
      this.phoneNtfs      = Boolean(info.phone_notifications);
      this.bio            = info.bio;
      this.fbToken        = info.fb_token;
      this.gPlusToken     = info.gplus_token;
      this.twitterToken   = info.twitter_token;
      this.sticky         = Boolean(info.sticky);
      this.admin          = Boolean(info.admin);
      this.aesir          = Boolean(info.aesir);
      this.tagline        = info.tagline;
      this.timezone       = info.timezone;
      }

   setSticky(b: boolean)
   {
      var deferred = Q.defer();
      var obj = this;
      db.makeQuery("UPDATE `user` SET `sticky`=? WHERE `id`=?", [b, obj.id]).then(function()
      {
         deferred.resolve(true);
      });
      return deferred.promise;
   }
   
   recordFeedback(good: string, bad: string, featureRequest: string)
   {
      var deferred = Q.defer();
      var obj = this;
      db.makeQuery(
         "INSERT INTO `user_feedback` (user_id, good, bad, featureRequest) VALUES (?, ?, ?, ?)", [obj.id, good, bad, featureRequest]
      ).then(function() {  deferred.resolve(true); });
      return deferred.promise;
   }
   
   /*
    * Detaches a user from a token, if they are
    *    currently attached.
    *
    *    Returns true if the user was detached or false
    *    if they weren't attached to begin with.
    *
    */
   detachFB()
   {
      var deferred = Q.defer();
      this.detachToken("fb_token", "fbToken").then(function(res){deferred.resolve(res);});
      return deferred.promise;
   }
   detachGPlus()
   {
      var deferred = Q.defer();
      this.detachToken("gplus_token", "gPlusToken").then(function(res){deferred.resolve(res);});
      return deferred.promise;
   }
   detachTwitter()
   {
      var deferred = Q.defer();
      this.detachToken("twitter_token", "twitterToken").then(function(res){deferred.resolve(res);});
      return deferred.promise;
   }
   detachToken(dbToken: string, usrToken: string)
   {
      var deferred = Q.defer();
      var obj = this;
      db.makeQuery("UPDATE `user` SET `" + dbToken + "`=NULL WHERE `id`=?", [obj.id]).then(function(res: OkPacket)
      {
         obj[usrToken] = false;
         deferred.resolve(res.changedRows > 0);
      });
      return deferred.promise;
   }
   
   
   /**
    * Uploads a photo and connects it to the user's account.
    * Returns whether the upload was successful.
   **/
   uploadPhoto(imageFile: Express.Multer.File) : Q.Promise<boolean>
   {
      var deferred = Q.defer<boolean>();
      var blobStorage = require("./BlobStorage");
      var obj = this;
      blobStorage.uploadImage(imageFile).then(function(upImgRes: UpImgRes)
      {
         if (upImgRes.id >= 0)
         {
            db.makeQuery("INSERT INTO `user_photo` (`user_id`, `photo_id`) VALUES (?, ?)", [obj.id, upImgRes.id]).then(function(res)
            {
               deferred.resolve(true);
            });
         } else {
            //error
            console.log("There was an error and the photo was not added.");
            deferred.resolve(false);
         }
      });
      return deferred.promise;
   }
   
//    /**
//     * Fully registers an invited user.
//    **/
//    registerInvited(name: string, handle: string, password: string)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery("UPDATE `user` SET `handle`=?, `registered`=1 WHERE `id`=?", [handle, obj.id]).then(function()
//       {
//          db.makeQuery("UPDATE `active` SET `alias`=? WHERE `id`=(SELECT `active_id` FROM `user` WHERE `id`=?)", [name, obj.id]).then(function()
//          {
//             obj.changePassword(password).then(function()
//             {
//                obj.alias = name
//                obj.handle = handle
//                deferred.resolve()
//             })
//          })
//       })
//       return deferred.promise;
//    }
   

   /*
    * Creates an empty alias without a user.
    *    If a matching alias exists already, it will use
    *  that alias instead.
    *
    * Returns the aliasID, not a user object.
    *
    */
   anonymous(alias: string)
   {
      var deferred = Q.defer();
      //First, see if an alias already exists.
      //If this logic changes, it must also be changed in createYoller
      db.makeQuery("SELECT `id` FROM `active` WHERE `user_id` IS NULL AND `group_id` IS NULL AND `alias`=? LIMIT 1", [alias])
         .then(function(res: {id: number}[])
         {
            if (res.length === 0)
            {
               db.makeQuery(
                  "INSERT INTO `active` (`user_id`, `group_id`, `alias`, `enabled`) VALUES (NULL,NULL,?,1)",
                  [alias]
               ).then(function(okpActive: OkPacket)
               {
                  deferred.resolve(okpActive.insertId);
               });
            }
            else
            {
               deferred.resolve(res[0].id);
            }
         });
      return deferred.promise;
   }
   

   //----------------- Aliases ----------------------

   getEnabledAliases() : Q.Promise<AliasEx[]>
   {
      var deferred = Q.defer<AliasEx[]>();
      User.getAliasesCore("AND `enabled`=1", this.id).then(function(aliases: AliasEx[])
      {
         deferred.resolve(aliases);
      });
      return deferred.promise;
   }
   
   getDisabledAliases() : Q.Promise<AliasEx[]>
   {
      var deferred = Q.defer<AliasEx[]>();
      User.getAliasesCore("AND `enabled`=0", this.id).then(function(aliases: AliasEx[])
      {
         deferred.resolve(aliases);
      });
      return deferred.promise;
   }
   
   getAllAliases() : Q.Promise<AliasEx[]>
   {
      var deferred = Q.defer<AliasEx[]>();
      User.getAliasesCore("", this.id).then(function(aliases: AliasEx[])
      {
         deferred.resolve(aliases);
      });
      return deferred.promise;
   }
   
   private static getAliasesCore(clause: string, id: number) : Q.Promise<AliasEx[]>
   {
      var deferred = Q.defer<AliasEx[]>();
      db.makeQuery("SELECT `alias`, `enabled` FROM `active` WHERE `user_id`=? " + clause, [id])
      .then(function(rows: { alias: string; enabled: number}[])
      {
         var rgax: AliasEx[] = [];
         for (var i = 0; i < rows.length; i++)
         {
            rgax.push(new AliasEx(rows[i].alias, rows[i].enabled));
         }
         deferred.resolve(rgax);
      });
      return deferred.promise;
   }

   
//    createGhostFollowCode(followeeActiveId)
//    {
//       var deferred = Q.defer()
//       var obj = this
// 
//       var code = obj.generateCode(50);
//       db.makeQuery("DELETE FROM `pending_ghost_follow` WHERE `user_id`=? AND `active_id`=?", [obj.id, followeeActiveId]).then(function()
//       {
//          db.makeQuery(
//             "INSERT INTO `pending_ghost_follow` (`user_id`, `active_id`, `code`) VALUES (?, ?, ?)",
//             [obj.id, followeeActiveId, code]
//          ).then(function()
//          {
//            deferred.resolve()
//          })
//       })
//          
//       return deferred.promise;
//    }
// 
//    /**
//     * Used to confirm the email address of a user.
//    **/
//    static confirmGhostFollow(code)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_id`, `active_id` FROM `pending_ghost_follow` WHERE `code`=?", [code]).then(function(res)
//       {
//          if (res.length == 0) {
//             //wrong code
//             deferred.resolve(false)
//          } else {
//             db.makeQuery("DELETE FROM `pending_ghost_follow` WHERE `code`=?", [code]).then(function()
//             {
//               User.get(res[0].user_id)
//               .then(function (user)
//               {
//                   user.followActive(res[0].active_id, true).then(function(userObj: User)
//                   {
//                      deferred.resolve(res[0].active_id)
//                   })
//                   User.confirmEmailByID(user.id)
//               })
//             })
//          }
//       })
//       return deferred.promise;
//    }
//    
// 
// 
//    
//    /**
//     * Used to confirm the email address of a user.
//    **/
//    static confirmEmail(code)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_id`, `email` FROM `pending_email_change` WHERE `code`=?", [code]).then(function(res)
//       {
//          if (res.length == 0) {
//             //wrong code
//             deferred.resolve(false)
//          } else {
//             db.makeQuery("DELETE FROM `pending_email_change` WHERE `user_id`=?", [res[0].user_id]).then(function()
//             {
//                db.makeQuery("UPDATE `user` SET `email`=? WHERE `id`=?", [res[0].email, res[0].user_id]).then(function()
//                {
//                   User.get(res[0].user_id).then(function(userObj: User)
//                   {
//                      deferred.resolve(userObj)
//                   })
//                })
//             })
//          }
//       })
//       return deferred.promise;
//    }
   
   
//    /**
//     * Sends an email to the user with a link to reset their password.
//    **/
//    sendPasswordResetEmail()
//    {
//       var deferred = Q.defer()
//       var obj = this
//       var code = obj.generateCode(50)
//       if (!obj.email)
//       {
//             db.makeQuery("SELECT `email` FROM `pending_email_change` WHERE `user_id`=?", [obj.id]).then(function(results)
//             {
//                if (results.length == 0) {
//                   //wrong code
//                   deferred.resolve(false)
//                } else {
//                   db.makeQuery("INSERT INTO `pending_password_reset` (`user_id`, `code`) VALUES (?, ?)", [obj.id, code]).then(function()
//                   {
//                      obj.sendEmail(
//                         'Ilion -- Reset Password',
//                         'If you requested a password reset, click ' +
//                         '<a href="https://ilion.com/i/auth/reset/'+code+'">here</a> ' +
//                         'to set your new password. If not, don\'t worry! Nothing has been changed.',
//                         results[0].email
//                      ).then(function()
//                      {
//                         deferred.resolve()
//                      })
//                   })
//                }
//             })
//       }
//       else
//       {
//          db.makeQuery("INSERT INTO `pending_password_reset` (`user_id`, `code`) VALUES (?, ?)", [obj.id, code]).then(function()
//          {
//             obj.sendEmail(
//                'Ilion -- Reset Password',
//                'If you requested a password reset, click ' +
//                '<a href="https://ilion.com/i/auth/reset/'+code+'">here</a> ' +
//                'to set your new password. If not, don\'t worry! Nothing has been changed.'
//             ).then(function()
//             {
//                deferred.resolve()
//             })
//          })
//       }
//    
//       return deferred.promise;
//    }
   

//    // sendInvitedEmail(yoller: YollerInfoDto, cp: CollabDto)
//    // {
//    //    var deferred = Q.defer()
//    //    var obj = this
//    //    db.makeQuery("SELECT `email`, `code` FROM `pending_email_change` WHERE `user_id`=?", [obj.id]).then(function(results)
//    //    {
//    //       if (results.length == 0)
//    //       {
//    //          deferred.resolve(false)
//    //       } else {
//    //          obj.sendEmail(
//    //             'Welcome to Ilion',
//    //             '<h1 style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">Welcome to Ilion</span></h1><p style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">You\'ve been added to ' + yoller.title + ' as ' + cp.role + '.<br/><br/<p style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">Ilion is an event networking site for theater artists, and you\'ve been invited to join!<br/><br/>Sign up <a href="https://ilion.com/api/auth/confirm/'+results[0].code+'">here</a>.',
//    //             results[0].email
//    //          ).then(function()
//    //          {
//    //             deferred.resolve(true)
//    //          })
//    //       }
//    //    })
//    //    return deferred.promise;
//    // }
// 
//    sendGhostFollowConfirmation(followee:User)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery("SELECT `code` FROM `pending_ghost_follow` WHERE `user_id`=? AND `active_id`=?", [obj.id, followee.activeID]).then(function(results)
//       {
//          if (results.length == 0)
//          {
//             deferred.resolve(false)
//          } else {
//             if (!obj.email)
//             {
//                db.makeQuery("SELECT `email` FROM `pending_email_change` WHERE `user_id`=?", [obj.id])
//                .then(function (emailRes)
//                {
// 
//                   obj.sendEmail(
//                     'Did you follow ' + followee.alias + '?',
//                     '<h1 style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">You followed ' +  followee.alias + ' on Ilion!</span></h1><p style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">If you didn\'t, then don\'t worry; no action is necessary.<br/><br/>But to receive emails when ' + followee.alias + ' is in a show, click <a href="https://ilion.com/api/auth/confirmFollowing?followeeActiveID='+ followee.activeID +'&code='+results[0].code+'">here</a>.',
//                     emailRes[0].email
//                   ).then(function()
//                   {
//                     deferred.resolve(true)
//                   })
//                })
//             }
//             else {
// 
//                obj.sendEmail(
//                  'Did you follow ' + followee.alias + '?',
//                  '<h1 style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">You followed ' +  followee.alias + ' on Ilion!</span></h1><p style="text-align: center;"><span style="font-family:trebuchet ms,helvetica,sans-serif;">If you didn\'t, then don\'t worry; no action is necessary.<br/><br/>But to receive emails when ' + followee.alias + ' is in a show, click <a href="https://ilion.com/api/auth/confirmFollowing?followeeActiveID='+ followee.activeID +'&code='+results[0].code+'">here</a>.'
//                ).then(function()
//                {
//                  deferred.resolve(true)
//                })
//            }
//          }
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     * Used to reset a User's password when they've clicked the link from an email.
//     * Returns a User object if it worked, false if incorrect code.
//    **/
//    static resetPassword(newPassword, code)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_id` FROM `pending_password_reset` WHERE `code`=?", [code]).then(function(userID)
//       {
//          console.log("userID:")
//          console.log(userID)
//          if (userID.length == 0)
//          {
//             console.log('no pending password resets')
//             deferred.resolve(false)
//          } else {
//             db.makeQuery("UPDATE `user` SET `password`=UNHEX(SHA1(CONCAT(?, `salt`))) WHERE `id`=?", [newPassword, userID[0].user_id]).then(function()
//             {
//                db.makeQuery("DELETE FROM `pending_password_reset` WHERE `user_id`=?", [userID[0].user_id]).then(function()
//                {
//                   User.get(userID[0].user_id).then(function(userObj: User)
//                   {
//                      User.confirmEmailByID(userObj.id)
//                      .then(function (userObj)
//                      {
//                         console.log('user confirmed and ready')
//                         console.log(userObj)
//                         deferred.resolve(userObj)
//                      })
//                   })
//                })
//             })
//          }
//       })
//       return deferred.promise;
//    }
   
   /**
    * Changes the user's password!
   **/
   changePassword(newPassword: string)
   {
      var deferred = Q.defer();
      db.makeQuery("UPDATE `user` SET `password`=UNHEX(SHA1(CONCAT(?, `salt`))) WHERE `id`=?", [newPassword, this.id]).then(function()
      {
         deferred.resolve();
      });
      return deferred.promise;
   }
   

   /*
    * When deactivating an alias, the user can choose whether
    * to change past yollers credit to current alias or whether
    * to keep past credits under the old alias.
    *
    *
    */
   deactivateAlias(activeID: number, changePastYollers: boolean)
   {
      var deferred = Q.defer();
      db.makeQuery("UPDATE `active` SET `enabled`=0 WHERE `id`=?", [activeID]).then(function(res) {
         //todo: if changePastYollers, change past credits.
         //todo: if changePastYollers OR past alias has no credits, delete.
         deferred.resolve();
      });
      return deferred.promise;
   }
   
//    //----------------- Credits ----------------------
//    
//    getUpcomingCredits()
//    {
//    
//    }
//    
//    getPastCredits()
//    {
//    
//    }
//    
//    /**
//     * Gets a user's current credits.
//    **/
//    getAllCredits()
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery(
//          "SELECT sar.id AS sarID, r.`label` AS role, y.id AS yollerID, y.title AS yollerTitle FROM `section_active_role` sar " +
//          "LEFT JOIN `yoller_section` sec ON (sec.id=sar.yoller_section_id) " +
//          "LEFT JOIN `role` r ON (r.id = sar.role_id) " +
//          'LEFT JOIN `yoller` y ON (y.id=sec.yoller_id) ' +
//          "WHERE sar.`active_id` IN (SELECT `id` FROM `active` WHERE `user_id`=?)", [obj.id]).then(function(sars)
//       {
//          deferred.resolve(sars)
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     * Returns the credits available for the user
//     * to claim -- that is, the credits given to
//     * an anonymous user with the same alias
//     * as the user's current alias.
//    **/
//    getAnonAliasCredits()
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery(
//          "SELECT sar.id AS sarID, r.`label` AS role, y.id AS yollerID, y.title AS yollerTitle FROM `section_active_role` sar " +
//          "LEFT JOIN `yoller_section` sec ON (sec.id=sar.yoller_section_id) " +
//          "LEFT JOIN `role` r ON (r.id = sar.role_id) " +
//          "LEFT JOIN `yoller` y ON (y.id=sec.yoller_id) " +
//          "WHERE sar.`active_id` IN (SELECT `id` FROM `active` WHERE `alias`=? AND `user_id` IS NULL AND `group_id` IS NULL)",
//          [obj.alias]
//       ).then(function(res)
//       {
//          deferred.resolve(res)
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     * Removes the requested section_active_role record,
//     * replacing it with an anonymous user credit by the
//     * same alias.
//     *
//     * Returns whether or not the SAR was successfully removed
//     * from this particular user.
//    **/
//    removeCredit(sarID)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       obj.ownsCredit(sarID).then(function(owns)
//       {
//          if (!owns)
//          {
//             deferred.resolve(false)
//          } else {
//             //The user owns the credit. Make an anonymous user to give credit to.
//             obj.anonymous(obj.alias).then(function(anonID)
//             {
//                db.makeQuery("UPDATE `section_active_role` SET `active_id`=? WHERE `id`=?", [anonID, sarID]).then(function()
//                {
//                   deferred.resolve(true)
//                })
//             })
//          }
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     * Allows a user to claim the credit of a role
//     * currently occupied by an anonymous user of the
//     * exact same alias as the current user object.
//     *
//     * Returns whether or not the credit was claimed.
//     * If false, it means the credit was not available.
//    **/
//    claimCredit(sarID)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       obj.isCreditAvailable(sarID).then(function(avail)
//       {
//          if (avail)
//          {
//             /* todo: see if the anonymous user that currently
//              * holds this credit has any other credits. If not,
//              * delete that user.
//              */
//             db.makeQuery("UPDATE `section_active_role` SET `active_id`=? WHERE `id`=?", [obj.activeID, sarID]).then(function()
//             {
//                deferred.resolve(true)
//             })
//          } else {
//             deferred.resolve(false)
//          }
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     * Used internally to determine if a credit is
//     * available for a user to claim. The credit must
//     * be currently occupied by an anonymous user of the
//     * same exact alias as the current user object's active alias.
//     *
//     * Returns whether the credit is available or not.
//    **/
//    isCreditAvailable(sarID)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `id` FROM `section_active_role` WHERE `id`=? AND `open`=1 AND `active_id` IN ("+
//          "SELECT `id` FROM `active` WHERE `alias`=? AND `user_id` IS NULL AND `group_id` IS NULL" +
//       ")", [sarID, this.alias]).then(function(res)
//       {
//          deferred.resolve(res.length > 0)
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     * Used internally to determine whether or not
//     * the current user owns the given credit.
//     *
//     * Returns whether the user owns the credit.
//    **/
//    ownsCredit(sarID)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery("SELECT `id` FROM `section_active_role` WHERE `id`=? AND `active_id` IN (" +
//          "SELECT `id` FROM `active` WHERE `user_id`=?" +
//       ")", [sarID, obj.id]).then(function(res)
//       {
//          deferred.resolve(res.length > 0)
//       })
//       return deferred.promise;
//    }
//    
//    //--------------- Communication ----------------
//    
//    //Sends `message` to user via their .phone number.
//    //Returns whether or not the text was sent.
//    sendText(message)
//    {
//       var deferred = Q.defer()
//       var twilio = require('twilio'),
//          client = new twilio.RestClient(strings.TWILIO_SID, strings.TWILIO_TOKEN),
//          obj = this
//       if (obj.phone != null) {
//          console.log("Sending '"+message+"' to "+this.phone+"...")
//          client.sms.messages.create(
//          {
//             to : obj.phone,
//             from : strings.TWILIO_NUM,
//             body : message
//          },
//          function(error, errorMessage)
//          {
//             if (error)
//             {
//                console.log("Error sending text message: " + errorMessage)
//                deferred.resolve(false)
//             } else {
//                db.makeQuery("INSERT INTO `sent_text` (`user_id`, `message`) VALUES (?, ?)", [obj.id, message]).then(function()
//                {
//                   deferred.resolve(true)
//                })
//             }
//          })
//       } else {
//          console.log("The user has no phone on record.")
//          deferred.resolve(false)
//       }
//       return deferred.promise;
//    }
//    


   
//    //----------------- RSVPs ----------------------
//    
//    getUpcomingRSVPs()
//    {
//    
//    }
//    
//    getPastRSVPs()
//    {
//    
//    }
//    
//    getAllRSVPs()
//    {
//    
//    }
//    
//    //----------------- Followers ----------------------
//    
//    getFollowers(currentUserID)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       var Users = require('./Users')
//       new Users().getByQuery("SELECT `follower_id` AS `id` FROM `active_follower` WHERE `active_id` IN (" +
//          "SELECT `id` FROM `active` WHERE `user_id`=?" +
//       ")", [obj.id]).then(function(users)
//       {
//         if (!users) deferred.resolve({userArray:[]})
//         else {
//          users.fillRelationsWith(currentUserID).then(function()
//          {
//             deferred.resolve(users)
//          })
//         }
//       })
//       return deferred.promise;
//    }
//    
//    getFollowees(currentUserID)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery("SELECT `active_id` FROM `active_follower` WHERE `follower_id`=?", [obj.id]).then(function(actives)
//       {
//          var actArray = []
//          var Active = require('./Active')
//          function addActive(i)
//          {
//             if (i < actives.length)
//             {
//                Active.get(actives[i].active_id, obj.id).then(function(active)
//                {
//                   actArray.push(active)
//                   if (active.type == 'user')
//                   {
//                      active.obj.fillRelationsWith(currentUserID).then(function()
//                      {
//                         addActive(i+1)
//                      })
//                   } else {
//                      addActive(i+1)
//                   }
//                })
//             } else {
//                deferred.resolve(actArray)
//             }
//          }
//          addActive(0)
//       })
//       return deferred.promise;
//    }
//    
//    
//    unfollowActive(activeID)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("DELETE FROM `active_follower` WHERE `follower_id`=? AND `active_id` IN (" +
//          //The following works because NULL != NULL in MySQL
//          //Selects all active IDs from and active ID (through user/group row)
//          "SELECT `id` FROM `active` WHERE `user_id`=(SELECT `user_id` FROM `active` WHERE `id`=?) OR "+
//                       "`group_id`=(SELECT `group_id` FROM `active` WHERE `id`=?) " +
//       ")", [this.id, activeID, activeID]).then(function(res)
//       {
//          if (res.affectedRows == 0)
//             console.log("The user wasn't following active "+activeID + " to begin with.")
//          deferred.resolve()
//       })
//       return deferred.promise;
//    }
//    
//    /*
//     * For a user that is already following the followee, this method lets you set
//     *    whether or not notifications will be sent about something that followee is doing.
//     *
//     *    The User must be already following the active.
//     *
//     */
//    setFollowNotifications(activeID, getNotifications)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("UPDATE `active_follower` SET `notifications`=? WHERE `active_id`=? AND `follower_id`=?",
//          [getNotifications, activeID, this.id]).then(function(results)
//       {
//          if (results.affectedRows == 0)
//          {
//             console.log("The user wasn't following active "+activeID+"! Notifications not set.")
//             deferred.reject(null);
//          }
//          else deferred.resolve()
//       })
//       return deferred.promise;
//    }
//    
//    /*
//     *
//     * Eventually, it will return a Users object of a bunch of people whom the User does NOT
//     *    follow, but are somehow connected to the current User. For now, it returns the last 10
//     *    users to sign up.
//     *
//     *
//     */
// // This query below may be faster, as it selects everything rather than just the ids
// // I should investigate how Users().getByQuery works
// //
// // select user_id AS `id` from 
// //   (select user_id, COUNT(yoller_id) as magnitude from
// //     (select u.id as user_id, y.id as yoller_id from user u  
// //           left join active a on a.user_id = u.id 
// //           left join section_active_role sar on sar.active_id = a.id 
// //           left join yoller_section ys on ys.id = sar.yoller_section_id 
// //           left join yoller y on y.id = ys.yoller_id 
// //       GROUP BY concat(u.id, y.id)) user_yollers
// //    GROUP BY user_id) u_mag
// // WHERE user_id != 48 AND `user_id` NOT IN ( 
// //   SELECT `user_id` FROM `active` WHERE `id` IN ( 
// //     SELECT `active_id` FROM `active_follower` WHERE `follower_id`=48 
// //     )
// //   )
// // ORDER BY u_mag.magnitude DESC LIMIT 10 
// 
// 
//    getRecommendedUsers() {
//       var deferred = Q.defer()
//       var Users = require('./Users.js')
//       new Users().getByQuery(
//         "select user_id AS `id` from  " +
//          "  (select user_id, COUNT(yoller_id) as magnitude from " +
//          "    (select u.id as user_id, y.id as yoller_id from user u   " +
//          "          left join active a on a.user_id = u.id  " +
//          "          left join section_active_role sar on sar.active_id = a.id  " +
//          "          left join yoller_section ys on ys.id = sar.yoller_section_id  " +
//          "          left join yoller y on y.id = ys.yoller_id  " +
//          "          left join yoller_occurrence yo on y.id = yo.yoller_id  " +
//          "          where yo.local_time >= NOW()-interval 6 month AND u.email IS NOT NULL AND u.profile_photo_id IS NOT NULL " +
//          "      GROUP BY concat(u.id, y.id)) user_yollers " +
//          "   GROUP BY user_id) u_mag " +
//          "WHERE user_id != ? AND `user_id` NOT IN (  " +
//          "  SELECT `user_id` FROM `active` WHERE `id` IN (  " +
//          "    SELECT `active_id` FROM `active_follower` WHERE `follower_id`=?  " +
//          "    ) " +
//          "  ) " +
//          "ORDER BY u_mag.magnitude DESC LIMIT 10  " , [this.id, this.id])
//         .then(function(usersObj) {deferred.resolve(usersObj)})
//       return deferred.promise;
//    }
//    
//    // ------------------ Groups ---------------------
//    
//    /*
//     * Adds a request for the user to join the given group.
//     *    If the Group has already requested that the user join
//     *    that group, it will simply confirm the membership,
//     *    Otherwise, it will create a request that the group
//     *    then must confirm.
//     *
//     *    the role attribute is a Role object (will be typescript
//     * eventually)
//     *
//     * Optionally, provide start and end parameters to request
//     * to join a group for that specific period. Default is
//     *    start: now
//     *    end: null (never)
//     */
//    joinGroup(groupID, role, start, end)
//    {
//       var Group = require('../modules/Group.js');
//       var deferred = Q.defer()
//       if (!start) start = new Date()
//       if (!end) end = null
//       var obj = this
//       new Group().getByID(groupID).then(function(group)
//       {
//          group.addMember({
//             userID : obj.id,
//             role : role,
//             start : start,
//             end : end
//          }, true).then(function()
//          {
//             deferred.resolve()
//          })
//       })
//       return deferred.promise
//    }
//    
//    /**
//     * Leaves the group at the current timestamp.
//     * This keeps the record of this user's membership,
//     * but ends it now. To remove a membership, use
//     * GroupObject.removeMembership(membershipID)
//    **/
//    endGroupMembership(membershipID)
//    {
//       var deferred = Q.defer()
//       //Uses the user ID as well to ensure that a user doesn't end someone else's membership.
//       db.makeQuery(
//          "UPDATE `user_group_membership` SET `end_time`=CURRENT_TIMESTAMP WHERE `end_time` IS NULL AND `user_id`=? AND `id`=?",
//          [this.id, membershipID]
//       ).then(function(res){ deferred.resolve() })
//       return deferred.promise;
//    }
//    
//    /**
//     * Returns an array of the following objects:
//     * {
//     *    role     : Role;
//     *    start       : Date;
//     *    end      : Date;
//     *    membershipID: number;
//     *    group       : Group
//     *  }
//    **/
//    getMemberships(includeRequests)
//    {
//       var Group = require('../modules/Group.js');
//       var deferred = Q.defer()
//       //Todo: use Groups.getByQuery when Groups are implemented
//       db.makeQuery(
//          "SELECT ugm.*, r.label FROM `user_group_membership` ugm LEFT JOIN `role` r ON (ugm.role_id=r.id) WHERE `user_id`=? " +
//          (includeRequests ? "" : " AND ugm.user_confirmed=1 AND ugm.group_confirmed=1"),
//          [this.id]
//       ).then(function(res)
//       {
//          var memberships = []
//          function getGroup(i)
//          {
//             if (i < res.length)
//             {
//                new Group().getByID(res[i].group_id).then(function(groupObj)
//                {
//                   memberships.push({
//                      role  : {
//                         id     : res[i].role_id,
//                         label: res[i].label
//                      },
//                      start    : res[i].start_time,
//                      end   : res[i].end_time,
//                      membershipID: res[i].id,
//                      group : groupObj,
//                      request : res[i].user_confirmed ? (res[i].group_confirmed ? "confirmed" : "outgoing") : "incoming"
//                   })
//                   getGroup(i+1)
//                })
//             } else {
//                deferred.resolve(memberships)
//             }
//          }
//          getGroup(0)
//       })
//       return deferred.promise;
//    }
//    
//    /**
//     *
//     * Gets a user's relationship with the given group.
//     *    returns one of the following:
//     *    "none"      : no requests/memberships
//     *       "incoming"  : the group has requested that the user join
//     *    "outgoing"  : the user has requested to join the group (pending)
//     *    "confirmed" : The user is a member of the group
//     *
//    **/
//    getGroupRelationship(groupID)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_confirmed`, `group_confirmed` FROM `user_group_membership` WHERE `group_id`=? AND `user_id`=?", [groupID, this.id])
//         .then(function(res)
//       {
//          if (res.length == 0) deferred.resolve('none')
//          if (res[0].user_confirmed) {
//             if (res[0].group_confirmed) deferred.resolve('confirmed')
//             else deferred.resolve('outgoing')
//          } else deferred.resolve('incoming')
//       })
//       return deferred.promise;
//    }
//    
//    /*
//     *
//     * Returns an array of Groups objects that the user owns.
//     *
//     */
//    getMyGroups()
//    {
//       var Group = require('../modules/Group.js');
//       //todo use Groups object instead.
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `id` FROM `group` WHERE `owner_id`=?", [this.id]).then(function(res)
//       {
//          var groups = []
//          function getGroup(i)
//          {
//             if (i < res.length)
//             {
//                new Group().getByID(res[i].id).then(function(groupObj)
//                {
//                   groups.push(groupObj)
//                   getGroup(i+1)
//                })
//             } else {
//                deferred.resolve(groups)
//             }
//          }
//          getGroup(0)
//       })
//       return deferred.promise;
//    }
//    
//    // ------------------- Yollers ----------------------
//    
//    /*
//     * Returns a Yollers object of the yollers that this user owns.
//     */
//    getMyYollers(nonUnter?:boolean)
//    {
//       var deferred = Q.defer()
//       var Yollers = require('../modules/Yollers.js');
//       Yollers.getByQuery("SELECT `id` FROM `yoller` WHERE `owner_id`=?" + (nonUnter?" AND `umbrella_yoller_id` IS NULL":""), [this.id], this.id).then(function(yollers)
//       {
//          deferred.resolve(yollers)
//       })
//       return deferred.promise
//    }
//    
//    /*
//     * Returns a Yollers object of the yollers that this user is
//     *    a collaborator of, in relation to currentUserID.
//     *
//     *    The optional parameter filter takes the following form:
//     *    filter = {
//     *       page      : int / undefined (0), (pages start at 0)
//     *    typeID       : int / undefined (all),
//     *    archived  : true / undefined (false [future])
//     * }
//     *
//     */
//    getProfileYollers(currentUserID, filter)
//    {
//       if (!currentUserID) currentUserID = null
//       var Yollers = require('../modules/Yollers.js');
//       if (!filter) filter = {}
//       if (!filter.page) filter.page = 0
//       var yllrsPerPage = 20
//       var deferred = Q.defer()
//       Yollers.getByQuery(
//          "SELECT `yoller_id` AS `id`, "+(filter.archived?"max(`local_time`) AS lastOcc ":"min(`local_time`) AS nextOcc ")+
//          "FROM `yoller_occurrence` yo " +
//          "LEFT JOIN `venue` ve ON (ve.id = yo.venue_id) " + 
//          "WHERE CONVERT_TZ(yo.`local_time`, ve.timezone, 'UTC') "+(filter.archived?"<":">")+" NOW() "+
//          //Ensure that, for archived occurrences, there are no future occurrences for this yoller.
//          (filter.archived
//             ? "AND NOT EXISTS (SELECT `id` FROM `yoller_occurrence` WHERE `yoller_id`=yo.yoller_id AND CONVERT_TZ(`local_time`, ve.timezone, 'UTC')> NOW())"
//             : "") +
//          "AND `yoller_id` IN (" +
//             "SELECT `yoller_id` AS `id` FROM `yoller_section` WHERE `id` IN ("+
//                "SELECT `yoller_section_id` FROM `section_active_role` WHERE `active_id` IN ("+
//                   "SELECT `id` FROM `active` WHERE `user_id`=?"+
//                ")"+
//             ")"+
//          ") GROUP BY `yoller_id` ORDER BY "+(filter.archived?"`lastOcc` DESC":"`nextOcc` ASC")+
//          " LIMIT "+(filter.page*yllrsPerPage)+","+yllrsPerPage, [this.id], currentUserID
//       ).then(function(resultYollers)
//       {
//          var yollerBlocks: YollerBlock[] = [];
//          for (var i = 0; i < resultYollers.length; i++) {
//             var newBlock:YollerBlock = {
//                id: resultYollers[i].id,
//                title: resultYollers[i].title,
//                tagline: resultYollers[i].tagline,
//                umbYollID: null,     // TODO: Do we need this in the feed?
//                type: resultYollers[i].type,
//                description: resultYollers[i].description,
//                occurrence: resultYollers[i].nextOccurrence,
//                nextOccurrence: resultYollers[i].nextOccurrence,
//                knownCollabs: [],
//                posterPicURL: resultYollers[i].posterPicURL,
//                locked: resultYollers[i].locked,
//                ownerID: resultYollers[i].owner_id,
//                flags: resultYollers[i].flags,
//                hidden: false
//             }
//             yollerBlocks.push(newBlock)
//          }
//          if (resultYollers.length == 0) {
//             deferred.resolve([])
//          } 
//          else if (currentUserID) {
//             Yollers.knownCollabs(yollerBlocks, currentUserID).then(function(yollerBlocks) {
//                deferred.resolve(yollerBlocks)
//             })
//          }
//          else deferred.resolve(yollerBlocks)
//       })
//       return deferred.promise;
//    }
//    /*
//     * Returns a Yollers object of the yollers that this user is
//     *    a collaborator of, in relation to currentUserID.
//     *
//     *    The optional parameter filter takes the following form:
//     *    filter = {
//     *       page      : int / undefined (0), (pages start at 0)
//     *    typeID       : int / undefined (all),
//     *    archived  : true / undefined (false [future])
//     * }
//     *
//     */
//    getResumeYollers(filter)
//    {
//       var Yollers = require('../modules/Yollers.js');
//       if (!filter) filter = {}
//       if (!filter.page) filter.page = 0
//       var yllrsPerPage = 20
//       var deferred = Q.defer()
//       var userID = this.id
//       Yollers.getByQuery(
//          "SELECT `yoller_id` AS `id`, max(`local_time`) AS lastOcc "+
//          "FROM `yoller_occurrence` yo " +
//          "LEFT JOIN `venue` ve ON ve.id = yo.venue_id " + 
//          "WHERE CONVERT_TZ(yo.`local_time`, ve.timezone, 'UTC') "+"< NOW() "+
//          "AND NOT EXISTS (SELECT `id` FROM `yoller_occurrence` nyo WHERE nyo.`yoller_id`=yo.yoller_id AND CONVERT_TZ(nyo.`local_time`, ve.timezone, 'UTC') > NOW()) "+
//          "AND `yoller_id` IN ( " +
//             "SELECT `yoller_id` AS `id` FROM `yoller_section` WHERE `id` IN ("+
//                "SELECT `yoller_section_id` FROM `section_active_role` WHERE `active_id` IN ( "+
//                   "SELECT `id` FROM `active` WHERE `user_id`=? "+
//                ") "+
//             ") "+
//          ") GROUP BY `yoller_id` ORDER BY `lastOcc` DESC "+
//          " LIMIT "+(filter.page*yllrsPerPage)+","+yllrsPerPage, [this.id], null
//       ).then(function(yollers)
//       {
//          Yollers.attachUserCredits(yollers, userID).then(function()
//          {
//             deferred.resolve(yollers)
//          })
//       })
//       return deferred.promise;
//    }
//    
//    getTotalYollerCount()
//    {
//       var Yollers = require('../modules/Yollers.js');
//       var yllrsPerPage = 20
//       var deferred = Q.defer()
//       var userID = this.id
//       db.makeQuery(
//          "SELECT `id` " +
//          "FROM yoller " +
//          "WHERE `id` IN (" +
//             "SELECT `yoller_id` AS `id` FROM `yoller_section` WHERE `id` IN ("+
//                "SELECT `yoller_section_id` FROM `section_active_role` WHERE `active_id` IN ("+
//                   "SELECT `id` FROM `active` WHERE `user_id`=?"+
//                ")"+
//             ")"+
//          ")", [this.id]
//       ).then(function(results)
//       {
//         deferred.resolve(results.length)
//       })
//       return deferred.promise;
//    }
//    
//    /*
//     * Returns a Yollers object of the yollers this user has RSVP'ed to,
//     *    plus the yollers in which followees are collaborating, sorted by
//     *    next occurrence date.
//     *
//     * The optional parameter, filter, takes the following form:
//     * filter = {
//     *       page      : int / undefined (0), (pages start at 0)
//     *    typeID       : int / undefined (default: all),
//     *    relationship : "none" / "friends" / undefined (default: followees),
//     *    archived  : true / undefined (default: future),
//     *       location     : [latitude (int), longitude (int)] / undefined (default: none)
//     * }
//     *
//     */
//    
//    updateVote (frID, val) {
//       console.log('id: ' + frID )
//       console.log('val: ' + val)
//           var deferred = Q.defer()
//           var obj = this
//           var frID = frID
//           var val = val
//           db.makeQuery("SELECT `value` FROM `user_feature_req` WHERE `user_id`=? AND `feature_req_id`=?;", [obj.id, frID]).then(function(results) {
//               if (results.length == 0)
//               {
//                   db.makeQuery("INSERT INTO `user_feature_req` (`user_id`, `feature_req_id`, `value`) VALUES (?, ?, ?);", [obj.id, frID, val])
//                   .then(function (result)
//                   {
//                      deferred.resolve(true)
//                   })
//               }
//               else {
//                   db.makeQuery("UPDATE `user_feature_req` SET `value`=? WHERE `user_id`=? AND `feature_req_id`=?;", [val, obj.id, frID])
//                   .then(function (result)
//                   {
//                      deferred.resolve(true)
//                   })
//               }
//           })
//           return deferred.promise;
//       }
// 
//       public static hasHidden(userId)
//       {
//         var deferred = Q.defer();
//           db.makeQuery("SELECT EXISTS (SELECT `id` FROM `user_project_hidden` uph WHERE uph.`user_id`=?) as hasHidden", [userId])
//           .then(function (result)
//           {
//             deferred.resolve(result[0])
//           })
//           return deferred.promise;
//       }
   }


export class User extends UserMin
{
   alias       : string;
   profilePhoto: string;
   
   constructor(info: UserRowExt)
      {
      super(info);
      this.alias        = info.alias;
      this.profilePhoto = info.profile_photo_url;
      }

   /**
    * Deletes the user's current profile picture and
    * sets it to the current URL.
    * Returns whether the operation was successful.
   **/
   setProfilePictureToURL(url: string)
   {
      var deferred = Q.defer();
      var obj = this;
      console.log("setting photo");
      db.makeQuery("INSERT INTO `photo` (`url`, `extension`) VALUES (?, NULL)", [url])
      .then(function(okpPhoto: OkPacket)
      {
         console.log("removing photo");
         obj.removeProfilePhoto().then(function()
         {
            console.log("updating");
            db.makeQuery("UPDATE `user` SET `profile_photo_id`=? WHERE `id`=?", [okpPhoto.insertId, obj.id]).then(function()
            {
               console.log("done");
               obj.profilePhoto = url;
               obj.profilePhotoID = okpPhoto.insertId;
               deferred.resolve();
            });
         });
      });
      return deferred.promise;
   }
   
   /**
    * Deletes the user's current profile picture and
    * saves the given file to Azure storage (and set).
    * Returns whether the operation was successful.
   **/
   setProfilePictureToFile(imageFile: Express.Multer.File)
   {
      var deferred = Q.defer();
      var blobStorage = require("./BlobStorage");
      var obj = this;
      blobStorage.uploadImage(imageFile).then(function(upImgRes: UpImgRes)
      {
         if (upImgRes.id < 0)
         {
            //There was an error uploading the file
            console.log("There was an error and the profile picture was not updated.");
            deferred.resolve(upImgRes);
         } else {
            //remove current photo and assign new one
            obj.removeProfilePhoto().then(function(res: boolean)
            {
               db.makeQuery("UPDATE `user` SET `profile_photo_id`=? WHERE `id`=?", [upImgRes.id, obj.id]).then(function(res)
               {
               obj.profilePhoto = upImgRes.url;
               obj.profilePhotoID = upImgRes.id;
               deferred.resolve(upImgRes);
               });
            });
         }
      });
      return deferred.promise;
   }
   
   /**
    * Removes a user's current profile photo. Returns fSuccess.
    * Used internally only.
   **/
   private removeProfilePhoto() : Q.Promise<boolean>
   {
      var obj = this;
      var deferred = Q.defer<boolean>();
      console.log("removing profile photo");
      if (obj.profilePhotoID)
      {
         console.log("ok");
         var blobStorage = require("./BlobStorage");
         blobStorage.removeImage(obj.profilePhotoID).then(function(res: boolean)
            {
            console.log("deleted");
            obj.profilePhoto = null;
            obj.profilePhotoID = null;
            deferred.resolve(res);
            });
      } else {
         obj.profilePhoto = null;
         deferred.resolve(true);
      }
      return deferred.promise;
   }

}


/*-----------------------------------------------------------------------------------------------------------
   AliasEx

Used for returning information about user aliases. See getEnabledAliases, etc.

------------------------------------------------------------------------------------------------ CGMoore --*/
class AliasEx
   {
   alias: string;
   enabled: boolean;

   constructor(alias: string, iEnabled: number)
      {
      this.alias = alias;
      this.enabled = Boolean(iEnabled);
      }
   }
