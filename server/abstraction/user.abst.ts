// import * as db from "./db.access";
// // import * as multer from 'multer';
// import * as Q from 'q';

// import {GetTimezoneFromGoogle} from "../place-dets";
// import {IUserSettings} from "@ilion/models/user-types";
// // import {OkPacket, UploadImageResult} from '@ilion/models/other.model';
// import {YollerInfoDto, CollabDto} from "@ilion/models/yoller-info";
// import {OkPacket, EmailAvailabilityStatus} from "@ilion/models/other.model";
// import {UserCreate} from "./user-create";
// import {User, UserMin, UserRow, UserRowExt} from "../classes/user";
// import YStrings from "../strings";
// import {IFeedFilter, UserUpcomingFilters} from "@ilion/models/feed.model";
// import {EmailAbst} from "./email.abst";
// import {YollerBlock} from "@ilion/models/yoller-block.model";
// import {YollerBlocks} from "./yoller-blocks.abst";
// import {YollerSetsAbst} from "./yoller-sets.abst";

// import { Val } from "@ilion/shared/validation";

// export interface ILoginResult
//    {
//    success: boolean;
//    reason: string;
//    user: User;
//    }

// /* Base query that selects a UserRowExt object out of the database. */
// export const k_qryUserRowExt = "SELECT u.*, pp.url AS profile_photo_url, a.`alias` FROM `user` u " +
//                         "LEFT JOIN `active` a ON (u.active_id = a.id) " +
//                         "LEFT JOIN `photo` pp ON (u.profile_photo_id=pp.id) ";
   
// export abstract class UserAbst
//    {
//    /*
//     * Methods for retrieving/constructing a User object by ID, email, or handle.
//     *
//     * Returns either the User object (if successful)
//     *    or null if no such user exists.
//     *
//     * NOTE: The optional parameter currentUserID is the ID of a different user,
//     * from which relationships will be automatically filled out. For example, if
//     * user A is currently logged in, getting User B by User.get(B.id, A.id) will
//     * fill out information about the relationship between user A and user B as such:
//     *       userObj.isFollower    : bool (whether B follows user A)
//     *       userObj.isFollowee    : bool (whether A follows user B)
//     *       userObj.isNtfFollowee: bool (whether A follows B and has notifications turned on)
//     *       userObj.isFriend      : bool (whether A and B both follow each other)
//     *
//     */
    
//    static getByIdOrHandle(field: string, currentUserID?: number) : Q.Promise<User>
//    {
//       /* If 'field' consists entirely of digits, then interpret it as an ID. If it does not, then interpret
//        * it as a handle. */
//       var rgstrMatch: string[] = field.match(/[0-9]+/);
//       if (rgstrMatch !== null && rgstrMatch.length > 0 && rgstrMatch[0].length === field.length)
//          return UserAbst.getByID(parseInt(field));
//       else
//          return UserAbst.getByHandle(field, currentUserID);
//    }
    
//    static getByEMail(email: string, currentUserID?: number) : Q.Promise<User>
//    {
//       Assert(email.indexOf("@") > 0, "Invalid e-mail address passed to UserAbst.getByEMail.");
//       return UserAbst.getByConstraintsAndFillRelations({"u.email": email}, currentUserID);
//    }

//    static getByHandle(handle: string, currentUserID?: number) : Q.Promise<User>
//    {
//       return UserAbst.getByConstraintsAndFillRelations({"u.handle": handle}, currentUserID);
//    }

//    static getByHandleOrEmail(handleOrEmail: string) : Q.Promise<User>
//    {
//       var fieldToCheck = (typeof(handleOrEmail)=="string"&&~handleOrEmail.indexOf("@")) ? "email" : "handle"
//       if (fieldToCheck === "email")
//       {
//          return UserAbst.getByEMail(handleOrEmail);
//       }
//       else if (fieldToCheck === "handle")
//       {
//          return UserAbst.getByHandle(handleOrEmail);
//       }
//       else
//       {
//          Assert(false, "Bad option passed to getByHandleOrEmail.");
//          var deferred = Q.defer<User>();
//          deferred.resolve(null);
//          return deferred.promise;
//       }
//    }
   
//    static getByID(id: number, currentUserID?: number) : Q.Promise<User>
//    {
//       Assert(isFinite(id), "Invalid id passed to UserAbst.getByID.");
//       Assert(id > 0, "User ID 0 passed to UserAbst.getByID.");
//       return UserAbst.getByConstraintsAndFillRelations({"u.id": id}, currentUserID);
//    }

//    private static getByConstraintsAndFillRelations(constraints: object, currentUserID?: number) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>();
//       UserAbst.getByConstraints(constraints, false).then(function(user: User)
//       {
//          if (!user)
//          {
//             console.error("Could not find user with following constraints: ")
//             console.log(constraints)
//             deferred.resolve(null)
//          }
//          else
//          {
//             if (currentUserID)
//                UserAbst.fillRelationsWith(user, currentUserID).then(function() {deferred.resolve(user)})
//             else
//                deferred.resolve(user)
//          }
//       })
//       return deferred.promise;
//    }


//    /*
//     *
//     * For constraints, use 'u.____' : 'value' for a constraint with the user's User info, or
//     *  'a.____' : 'value' for a constraint with the user's Active info.
//     *
//     *    Used internally. Fetches user by given constraints object
//     */
//    private static getByConstraints(constraints: object, onlyConfirmed: boolean) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>();
//       if (constraints["u.email"] && !onlyConfirmed) {
//          db.makeQuery("SELECT `user_id` FROM `pending_email_change` WHERE `email`=?", [constraints["u.email"]]).then(function(res: {user_id: number}[])
//          {
//             UserAbst.getByConstraints((res.length == 0 ? constraints : {"u.id":res[0].user_id} ), true).then(function(userObj: User)
//             {
//                deferred.resolve(userObj)
//             })
//          })
//       } else {
//          db.makeQuery(k_qryUserRowExt + "WHERE ?", [constraints])
//          .then(function(result: UserRowExt[])
//          {
//             if (result.length == 0) {
//                deferred.resolve(null)
//             } else {
//                var obj: User = new User(result[0]);
//                deferred.resolve(obj)
//             }
//          })
//       }
//       return deferred.promise;
//    }


//    /*--------------------------------------------------------------------------------------------------------
//       getUsers

//    Constructs and returns an array of User objects for the array of user IDs passed as 'rgid'.

//    --------------------------------------------------------------------------------------------- CGMoore --*/
//    private static getUsers(rgid: number[]) : Q.Promise<User[]>
//       {
//       var deferred = Q.defer<User[]>();

//       db.makeQuery(k_qryUserRowExt + "WHERE u.`id` IN (" + rgid.toString() + ")")
//       .then(function (rgurx: UserRowExt[])
//          {
//          Assert(rgurx, "Null returned from query in getUsers.");
//          var rguser: User[] = [];
//          for (var iurx = 0 ; iurx < rgurx.length ; iurx++)
//             {
//             rguser.push(new User(rgurx[iurx]));
//             }
//          deferred.resolve(rguser);
//          })
//       return deferred.promise;
//       }
   

//    /*--------------------------------------------------------------------------------------------------------
//       fillRelationsWith

//    Fills the relationship booleans in 'user' to reflect user's relationship with 'otherUserID'.

//    Note: This only really makes sense when 'otherUserID' represents the current logged-on user and 'user'
//    represents some other user with whom the current user might have some relationship. So, for example, if
//    User A is currently logged in and User B is some other user, then fillRelationsWith(userB, userA.id) will
//    fill out the userB object with information about userB's relationship to A. In particular:

//    userB.isFollower    : bool (whether B follows user A)
//    userB.isFollowee    : bool (whether A follows user B)
//    userB.isNtfFollowee : bool (whether A follows B and has notifications turned on)
//    userB.isFriend      : bool (whether A and B follow each other)

//    --------------------------------------------------------------------------------------------- CGMoore --*/
//    private static fillRelationsWith(user: User, otherUserID: number)
//    {
//       user.isFriend = false
//       user.isFollowee = false
//       user.isNtfFollowee = false
//       var deferred = Q.defer()
      
//       // First, see if 'user' follows otherUserID (see if 'user' is a follower)
//       db.makeQuery(
//          "SELECT * FROM `active_follower` WHERE `active_id` IN (SELECT `id` FROM `active` WHERE `user_id`=?) AND `follower_id`=?",
//          [otherUserID, user.id]
//       ).then(function(following: any[])
//       {
//          user.isFollower = (following.length > 0)
         
//          // Now, see if the otherUser follows 'user' (see if 'user' is a followee)
//          db.makeQuery(
//             "SELECT `notifications` FROM `active_follower` WHERE `active_id` IN (SELECT `id` FROM `active` WHERE `user_id`=?) AND `follower_id`=?",
//             [user.id, otherUserID]
//          ).then(function(followeeing: {notifications: boolean}[]) //Yeah, that's definitely a word.
//          {
//             for (var i = 0; i < followeeing.length; i++)
//             {
//                if (followeeing[i].notifications) user.isNtfFollowee = true
//             }
//             user.isFollowee = (followeeing.length > 0)
//             user.isFriend = (user.isFollowee && user.isFollower)
//             deferred.resolve()
//          })
//       })
//       return deferred.promise;
//    }

   
//    static getMinByID(id: number) : Q.Promise<UserMin>
//       {
//       var deferred = Q.defer<UserMin>();
//       db.makeQuery("SELECT * FROM `user` WHERE `id` = ?", [id])
//       .then(function(rows: UserRow[])
//          {
//          if (rows.length === 0)
//             deferred.resolve(null);
//          else
//             {
//             var userMin: UserMin = new UserMin(rows[0]);
//             deferred.resolve(userMin);
//             }
//          })

//       return deferred.promise;
//       }
   
//    /*
//     * Attempts to log in with the given handle or email (string) and password (plaintext string).
//     *
//     * Returns either the User object (if the handle/password combo is correct)
//     *  or false (if login information is incorrect)
//     *
//     * Usage:
//     *    UserAbst.login('handleOrEmail', 'pass').then(function(userObj)
//     *    {
//     *       if (userObj === false)
//     *       {
//     *          //Login credentials were incorrect
//     *       } else {
//     *          //Login credentials were correct -- user object is filled out.
//     *       }
//     *    })
//     *
//     */
//    static login(handleOrEmail: string, password: string) : Q.Promise<ILoginResult>
//    {
//       var deferred = Q.defer<ILoginResult>()
//       var obj = this
//       var fieldToCheck = (typeof(handleOrEmail)=="string"&&~handleOrEmail.indexOf("@")) ? "email" : "handle"
//       console.log("Logging in with "+fieldToCheck)
//       db.makeQuery(
//          "SELECT `id`, `email` FROM `user` WHERE `"+fieldToCheck+"`=? AND `password`=UNHEX(SHA1(CONCAT(?,(SELECT `salt` FROM `user` WHERE `"+fieldToCheck+"`=?))))",
//          [handleOrEmail, password, handleOrEmail]
//       ).then(function(result: {id: number; email: string;}[])
//       {
//          if (result.length == 0)
//          {
//             if (fieldToCheck == "email")
//             {
//                //check to see if email is pending
//                db.makeQuery("SELECT `id` FROM `pending_email_change` WHERE `email`=?", [handleOrEmail])
//                .then(function(pending: {id: number}[] )
//                {
//                   deferred.resolve({
//                      success: false,
//                      reason: (pending.length > 0 ? "unconfirmed" : "incorrect"),
//                      user: null
//                   })
//                })
//             } else {
//                deferred.resolve({
//                   success: false,
//                   reason: "incorrect",
//                   user: null
//                })
//             }
//          } else {
//             if (result[0].email == null) {
//                deferred.resolve({
//                   success: false,
//                   reason: "unconfirmed",
//                   user: null
//                })
//             } else {
//                UserAbst.getByID(result[0].id).then(function(userObj: User)
//                {
//                   deferred.resolve({
//                      success: true,
//                      reason: "correct",
//                      user: userObj
//                   })
//                })
//             }
//          }
//       })
//       return deferred.promise
//    }
   
   
//    /*
//     * Usage:
//     *       isEmailAvailable("email@domain.com", function(isAvailable)
//     *    {
//     *       if (isAvailable) //go ahead! email is available
//     *       else // tell user that email is taken
//     *    })
//     */
//    static isEmailAvailable(email: string) : Q.Promise<{ status: EmailAvailabilityStatus, alias?: string}>
//    {
//       var deferred = Q.defer<{ status: EmailAvailabilityStatus, alias?: string}>();
//       email = email.toLowerCase();
//       db.makeQuery("SELECT `id` from `user` where `email`=? and `registered`=1", [email])
//       .then((res: {id: number}[]) => {
//          if (res.length > 0)
//          {
//             deferred.resolve({
//                status: EmailAvailabilityStatus.NOT_AVAILABLE
//             });
//          }
//          else
//          {
//             db.makeQuery("SELECT u.`id`, u.`registered`, p.`email`, a.`alias` from `user` u " +
//                            "LEFT JOIN `pending_email_change` p ON (u.id = p.user_id) " +
//                            "LEFT JOIN `active` a ON (u.active_id = a.id) " +
//                            "WHERE p.`email`=?", [email])
//             .then((res: {
//                id: number,
//                registered: boolean,
//                alias: string,
//                email: string
//             }[]) => {
//                if (res.length === 0)
//                {
//                   deferred.resolve({
//                      status: EmailAvailabilityStatus.AVAILABLE
//                   });
//                }
//                else if (res[0].registered)
//                {
//                   deferred.resolve({
//                      status: EmailAvailabilityStatus.NOT_AVAILABLE
//                   });
//                }
//                else
//                {
//                   deferred.resolve({
//                      status: EmailAvailabilityStatus.INVITED,
//                      alias: res[0].alias
//                   });
//                }
//             });
//          }
//       });
//       return deferred.promise;
//    }

//    /*
//     * Usage:
//     *       isHandleAvailable("myAwesomeUsername32", function(isAvailable)
//     *    {
//     *       if (isAvailable) //go ahead! handle is available
//     *       else // tell user that handle is taken
//     *    })
//     */
//    static isHandleAvailable(handle: string) : Q.Promise<boolean>
//    {
//       var deferred = Q.defer<boolean>()
//       db.makeQuery(
//          "SELECT COUNT(1) AS numUsers FROM `user` WHERE `handle`=? LIMIT 1", [handle.toLowerCase()]
//       ).then(function(res: {numUsers: number}[])
//       {
//          deferred.resolve(res[0].numUsers == 0)
//       })
//       return deferred.promise
//    }

//    static registerInvited(userID: number, name: string, handle: string, password: string)
//    {
//       var deferred = Q.defer();
//       db.makeQuery("UPDATE `user` SET `handle`=?, `registered`=1 WHERE `id`=?", [handle, userID]).then(() =>
//       {
//          db.makeQuery("UPDATE `active` SET `alias`=? WHERE `id`=(SELECT `active_id` FROM `user` WHERE `id`=?)", [name, userID]).then(() =>
//          {
//             UserAbst.changePassword(userID, password).then(function()
//             {
//                deferred.resolve();
//             });
//          });
//       });
//       return deferred.promise;
//    }

//    //--------------- Facebook / Google Plus / Twitter ------------------
//    /*
//     * Attaches a particular user to a token that can be
//     *    used for login in the future.
//     *
//     *    This will override any currently attached tokens
//     * for that service for thatuser.
//     *
//     */

//    static attachFB(uid: number, fbToken: string)
//    {
//       var deferred = Q.defer()
//       UserAbst.attachToken(uid, fbToken, "fb_token", "fbToken").then(function(){deferred.resolve()})
//       return deferred.promise;
//    }
   
//    static attachGPlus(uid: number, gPlusToken: string)
//    {
//       var deferred = Q.defer()
//       UserAbst.attachToken(uid, gPlusToken, "gplus_token", "gPlusToken").then(function(){deferred.resolve()})
//       return deferred.promise;
//    }
   
//    static attachTwitter(uid: number, twitterToken: string)
//    {
//       var deferred = Q.defer()
//       UserAbst.attachToken(uid, twitterToken, "twitter_token", "twitterToken").then(function(){deferred.resolve()})
//       return deferred.promise;
//    }
   
//    private static attachToken(uid: number, token: string, dbToken: string, usrToken: string)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("UPDATE `user` SET `"+dbToken+"`=? WHERE `id`=?", [token, uid]).then(function()
//       {
//          // obj[usrToken] = token    // Is it important to set this token into a User object for uid?
//          deferred.resolve()
//       })
//       return deferred.promise
//    }
   

//    static getByFB(fbToken: string) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()
//       UserAbst.getByToken("fb_token",fbToken).then(function(res){deferred.resolve(res)})
//       return deferred.promise;
//    }
//    static getByGPlus(gPlusToken: string) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()
//       UserAbst.getByToken("gplus_token",gPlusToken).then(function(res){deferred.resolve(res)})
//       return deferred.promise;
//    }
//    static getByTwitter(twitterToken: string) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()
//       UserAbst.getByToken("twitter_token",twitterToken).then(function(res){deferred.resolve(res)})
//       return deferred.promise;
//    }
//    private static getByToken(type: string, token: string) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()
//       db.makeQuery("SELECT `id` FROM `user` WHERE `"+type+"`=?", [token])
//       .then(function(results: {id: number}[])
//       {
//          if (results.length == 0)
//          {
//             deferred.resolve(null)
//          }
//          else
//          {
//             UserAbst.getByID(results[0].id).then(function(userObj: User)
//             {
//                deferred.resolve(userObj)
//             })
//          }
//       })
//       return deferred.promise
//    }

//    static onInvitedSignUp(userID: number, info: UserCreate)
//    {
//       var deferred = Q.defer<User>();
//       this.registerInvited(userID, info.alias, info.handle, info.password)
//       .then( () => {
//          UserAbst.sendConfirmationEmail(userID).then(function()
//          {
//             UserAbst.getByID(userID).then((user) =>
//             {
//                deferred.resolve(user);
//             });
//          });
//       });
//       return deferred.promise;
//    }

//    static onSignUp(info: UserCreate, flagInvited?:boolean, flagGhost?:boolean) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()

//       var vUser = Val.user(info);
//       if (!vUser.valid) {
//          deferred.resolve(null);
//       }

//       UserAbst.getByEMail(info.email)
//       .then(user => {
//          if (user && !user.registered)
//          {
//             UserAbst.onInvitedSignUp(user.id, info)
//             .then(user => {
//                deferred.resolve(user);
//             });
//          }
//          else {
//             UserAbst.create(info)
//             .then(user => {
//                deferred.resolve(user);
//             });
//          }
//       });
//       return deferred.promise;
//    }
   
//    //------------------ User Creation / Deletion ----------------------
//    static create(info: UserCreate, flagInvited?:boolean, flagGhost?:boolean) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()

//       //ToDo: Kick off Google query to get correct timezone from lat and lng and then update the table.
//       db.makeQuery(
//          "INSERT INTO `active` (user_id, group_id, alias, enabled) VALUES (NULL, NULL, ?, 1)", [info.alias]
//       ).then(function(okpActive: OkPacket)
//       {
//          var salt = Math.random().toString(36).substr(2, 10);
//          db.makeQuery(
//             "INSERT INTO `user` (`active_id`, `handle`, `password`, `salt`, `email`, `email_notifications`, "+
//             "`phone`, `tagline`, `bio`, `fb_token`, `gplus_token`, `registered`, `portfolio_html`, `timezone`) VALUES " +
//             "(?,?,UNHEX(SHA1(?)),?,NULL,?,?,?,?,?,?,?,'', NULL)",
//             [ okpActive.insertId, info.handle, info.password+salt, salt, +info.emailNtfs, info.phone, info.tagline, info.bio, info.fbToken, info.gPlusToken, info.registered]
//          ).then(function(okpUser: OkPacket)
//          {
//             //TODO: Catch failure here, then delete Active record and don't do the stuff below.

//             if (info.latitude && info.longitude)
//                {
//                /* Find and update the correct timezone. */
//                GetTimezoneFromGoogle(info.latitude, info.longitude).then(function(timezone: string)
//                   {
//                   if (timezone !== null)
//                      {
//                      var query: db.Query = new db.Query("UPDATE `user` SET `timezone` = ? WHERE `id` = ?",
//                                                         [timezone, okpUser.insertId]);
//                      db.doQuery(query);
//                      }
//                   });
//                }
//             db.makeQuery(
//                "UPDATE `active` SET `user_id`=? WHERE id=?", [okpUser.insertId, okpActive.insertId]
//             ).then(function(res)
//             {
//                UserAbst.getByID(okpUser.insertId).then(function(userObject: User)
//                {
//                   if (info.email == null) {
//                      deferred.resolve(userObject)
//                   } else {
//                      //Now, record the email change and send a confirmation email.
//                      UserAbst.changeEmail(okpUser.insertId, info.email, true).then(function(code)
//                      {
//                         if (flagInvited)
//                         {
//                            deferred.resolve(userObject)
//                         }
//                         else if (flagGhost)
//                         {
//                            deferred.resolve(userObject)
//                         }
//                         else if (info.fSuppressEmail)
//                            {
//                            console.log("confirmation email suppressed")
//                            deferred.resolve(userObject)
//                            }
//                         else
//                            {
//                            UserAbst.sendConfirmationEmail(userObject.id).then(function()
//                               {
//                               deferred.resolve(userObject)
//                               })
//                            }
//                      })
//                   }
//                })
//             })
//          })
//       })
//       return deferred.promise;
//    }
   
//    /**
//     * Creates a new user account using social media only.
//     * Requires the info object provided in .create() above,
//     * with two differences:
//     *       1. either fbToken or gPlusToken must be filled out
//     *       2. no password should be provided (one will be auto-generated)
//     * Returns the new user object.
//    **/
//    static createSocial(info: UserCreate) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>();
//       info.fSuppressEmail = true
//       if (info.fbToken || info.gPlusToken)
//       {
//          info.password = UserAbst.generatePassword()
//          UserAbst.create(info).then(function(userObj: User)
//          {
//             UserAbst.confirmEmailByID(userObj.id)
//             .then(function (user:User)
//             {
//               deferred.resolve(user)
//             })
//          })
//       } else {
//          console.error("Neither a FB token nor a G+ token were provided.")
//          deferred.resolve(null);
//       }
//       return deferred.promise;
//    }

//    // -------------------- Anonymous Users ----------------------
//    /*
//     * Creates an invited user with just alias and email
//     *
//     * Returns the resulting User object.
//     *
//     */

//    static invited(alias: string, email: string, inviterID: number) : Q.Promise<InvitedUser>
//    {
//       var deferred = Q.defer<InvitedUser>()
//       db.makeQuery("(SELECT `id` FROM `user` WHERE `email`=?) UNION (SELECT `user_id` AS `id` FROM `pending_email_change` WHERE `email`=?)", [email, email]).then(function(existingUser: {id: number}[])
//       {
//          if (existingUser.length == 0) {
//             //The user does not exist yet.
//             var uc: UserCreate = new UserCreate();
//             uc.alias = alias;
//             uc.email = email; // set email into the user create object
//             uc.password = UserAbst.generatePassword();
// //            uc.latitude =     // TODO: Uh-oh, what do we do about latitude and longitude?
// //            uc.longitude =
//             UserAbst.create(uc, true).then(function(userObj: User)
//             {
//                UserAbst.changeEmail(userObj.id, email, true).then((code) =>
//                {
//                   db.makeQuery("INSERT INTO `bg_invite` (inviter, invited) VALUES (?, ?)", [inviterID, userObj.id]);
//                   (userObj as InvitedUser).inviteCode = code;
//                   deferred.resolve(userObj as InvitedUser)
//                })
//             })
//          } else {
//             //The user exists already! Re-up the expiration and add a new alias.
//             db.makeQuery("UPDATE `user` SET `created`=CURRENT_TIMESTAMP WHERE `id`=?", [existingUser[0].id]).then(function()
//             {
//                db.makeQuery("INSERT INTO `active` (`user_id`, `alias`) VALUES (?, ?)", [existingUser[0].id, alias]).then(function()
//                {
//                   UserAbst.getByID(existingUser[0].id).then(function(userObj: User)
//                   {
//                     db.makeQuery("SELECT `code` FROM `pending_email_change` WHERE `user_id`=?", [userObj.id])
//                     .then((res: {code: string}[]) => {
//                         let code = res[0].code;
//                         (userObj as InvitedUser).inviteCode = code;
//                        deferred.resolve(userObj as InvitedUser)
//                     })
//                   })
//                })
//             })
//          }
//       })
//       return deferred.promise;
//    }

   
//    /**
//     * Ghost Users
//    **/

//    // -------------------- Anonymous Users ----------------------
   
//    /*
//     * Creates an invited user with just alias and email
//     *
//     * Returns the resulting User object.
//     *
//     */
//    static createGhost(alias: string, email: string, inviterID: number) : Q.Promise<User>
//    {
//       var deferred = Q.defer<User>()
//       db.makeQuery("(SELECT `id` FROM `user` WHERE `email`=?) UNION (SELECT `user_id` AS `id` FROM `pending_email_change` WHERE `email`=?)", [email, email]).then(function(existingUser: {id: number}[])
//       {
//          if (existingUser.length == 0) {
//             //The user does not exist yet.
//             var uc: UserCreate = new UserCreate();
//             uc.alias = alias;
//             uc.email = email; // set email into the user create object
//             uc.password = UserAbst.generatePassword();
// //            uc.latitude =     // TODO: Uh-oh, what do we do about latitude and longitude?
// //            uc.longitude =
//             UserAbst.create(uc, false, true).then(function(userObj: User)
//             {
//                UserAbst.changeEmail(userObj.id, email, true).then(function(code)
//                {
//                  if (inviterID > 0)
//                  {
//                     db.makeQuery("INSERT INTO `bg_invite` (inviter, invited) VALUES (?, ?)", [inviterID, userObj.id])
//                     deferred.resolve(userObj)
//                  }                    
//                  deferred.resolve(userObj)
//                })
//             })
//          } else {
//             //The user exists already! Re-up the expiration and add a new alias.
//             db.makeQuery("UPDATE `user` SET `created`=CURRENT_TIMESTAMP WHERE `id`=?", [existingUser[0].id]).then(function()
//             {
//                db.makeQuery("INSERT INTO `active` (`user_id`, `alias`) VALUES (?, ?)", [existingUser[0].id, email.split("@")[0]]).then(function()
//                {
//                   UserAbst.getByID(existingUser[0].id).then(function(userObj: User)
//                   {
//                      deferred.resolve(userObj)
//                   })
//                })
//             })
//          }
//       })
//       return deferred.promise;
//    }


//    //----------------- Updating User Info ----------------------
   
//    /*
//     *    Updates the given user's settings.
//     *    Pass in the following object with only
//     *    what you want defined
//     *       (for example, if the user just changed
//     *        his/her email, pass in {email: 'new@email.com'}
//     *     only)
//     *
//     * settings = {
//     *    phone       : string / undefined,
//     *       phoneNtfs   : bool / undefined,
//     *    email       : string / undefined,
//     *    emailNtfs   : bool / undefined,
//     *    handle      : string / undefined,
//     *    bio      : string / undefined
//     *    givenName   : string / undefined
//     *       familyName  : string / undefined
//     *  }
//     *
//     * Note: this cannot be used to change user alias.
//     *    use .changeAlias() instead.
//     *
//     */
//    static changeSettings(uid: number, settings: IUserSettings)
//    {
//       var deferred = Q.defer()
//       var nameMappings = {
//          "phone"  : "phone",
//          "phoneNtfs" : "phone_notifications",
//          "email"  : "email",
//          "emailNtfs" : "email_notifications",
//          "handle"    : "handle",
//          "tagline"   : "tagline",
//          "bio"       : "bio",
//          "givenName" : "given_name",
//          "familyName": "family_name"
//       }
//       var maxLengths = {
//          handle      :  20,
//          email       : 100,
//          tagline     : 150,
//          givenName   : 30,
//          familyName  : 30
//       };
//       var finalSettings = {}
//       for (var prop in nameMappings)
//       {
//          //Map the name to the column in the database
//          if (settings.hasOwnProperty(prop) && prop != "email") {
//             if (maxLengths[prop] && settings[prop].length > maxLengths[prop]) {
//                console.error(prop + " can only be "+maxLengths[prop]+" characters!")
//                return deferred.promise;
//             } else {
//                finalSettings[nameMappings[prop]] = settings[prop]
//             }
//          }
//       }
//       if (settings.email)
//          {
//          UserAbst.changeEmail(uid, settings.email, false);
//          }
//       var empty = true
//       for (var x in finalSettings) empty = false
//       if (empty) {
//          deferred.resolve()
//       } else {
//          db.makeQuery("UPDATE `user` SET ? WHERE `id`=?", [finalSettings, uid])
//          .then(function(result)
//          {
//          deferred.resolve()
//          })
//       }
//       return deferred.promise;
//    }


//    // Change the user's alias
//    static changeAlias(user: UserMin, name: string, keepOldActive: boolean)
//    {
//       var deferred = Q.defer();
//       //First, see if alias exists
//       db.makeQuery("SELECT `id` FROM `active` WHERE `alias`=? AND `user_id`=?", [name, user.id])
//       .then(function(matchingAliases: { id: number }[])
//       {
//          if (matchingAliases.length > 0) {
//             //This alias has existed before! Reactivate it.
//             db.makeQuery("UPDATE `active` SET `enabled`=1 WHERE `id`=?", [matchingAliases[0].id]).then(() =>
//             {
//                UserAbst.updateUserActive(user, matchingAliases[0].id, keepOldActive).then(() =>
//                {
//                   deferred.resolve(true);
//                });
//             });
//          } else {
//             //This alias has not yet existed! Create it.
//             db.makeQuery("INSERT INTO `active` (`user_id`, `group_id`, `alias`, `enabled`) VALUES (?,NULL,?,1)",
//                          [user.id, name])
//             .then(function(okpActive: OkPacket)
//             {
//                UserAbst.updateUserActive(user, okpActive.insertId, keepOldActive).then(() =>
//                {
//                   deferred.resolve(true);
//                });
//             });
//          }
//       });
//       return deferred.promise;
//    }


   
//    /**
//     * Used INTERNALLY to change a user's email address.
//     * Does NOT run full set of checks before performing change.
//     * Returns the confirmation code for the email change.
//    **/
//    private static changeEmail(uid: number, email: string, dontSend: boolean) : Q.Promise<string>
//    {
//       var deferred = Q.defer<string>();
//       if (!email)
//          {
//          deferred.resolve();
//          }
//       else if (!~email.indexOf("@"))
//          {
//          console.error("The email must be an email!")
//          }
//       else
//          {
//          var code = UserAbst.generateCode(50);
//          db.makeQuery("DELETE FROM `pending_email_change` WHERE `user_id`=?", [uid]).then(function()
//             {
//             db.makeQuery("INSERT INTO `pending_email_change` (`user_id`, `email`, `code`) VALUES (?, ?, ?)",
//                          [uid, email, code])
//             .then(() =>
//                {
//                if (!dontSend)
//                   {
//                   EmailAbst.send(
//                   "Ilion -- Please Confirm your Email Address",
//                   "If you recently changed your email address to "+email+", please click "+
//                   "<a href=" + YStrings.RETURN_HOST + "api/auth/confirm/" + code + ">here</a> to confirm this change. <br/><br/>Thanks!",
//                   email, uid)
//                   .then(function()
//                      {
//                      console.log("email sent")
//                      deferred.resolve(code)
//                      })
//                   } else {
//                   deferred.resolve(code)
//                   }
//                })
//             })
//       }
//       return deferred.promise;
//    }
   


   

//    /**
//     * Used internally to generate random passwords for
//     * invited and social-network accounts.
//    **/
//    private static generatePassword() : string
//    {
//       return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
//    }
   

//    /*--------------------------------------------------------------------------------------------------------
//       delete

//    Deletes the user whose ID is 'id'.

//    --------------------------------------------------------------------------------------------- CGMoore --*/
//    static delete(id: number) : Q.Promise<void>
//    {
//       // TODO: delete photos before removing user.
//       var deferred = Q.defer<void>()
//       db.makeQuery("DELETE FROM `user` WHERE `id`=?", [id]).then(function()
//       {
//          deferred.resolve()
//       })
//       return deferred.promise;
//    }
   
   
   
//    /**
//     * Used INTERNALLY to change a user's email address.
//     * Does NOT run full set of checks before performing change.
//     * Returns the confirmation code for the email change.
//    **/
//    createGhostFollowCode(userId: number, followeeActiveId: number)
//    {
//       var deferred = Q.defer()

//       var code = UserAbst.generateCode(50);
//       db.makeQuery("DELETE FROM `pending_ghost_follow` WHERE `user_id`=? AND `active_id`=?", [userId, followeeActiveId]).then(function()
//       {
//          db.makeQuery(
//             "INSERT INTO `pending_ghost_follow` (`user_id`, `active_id`, `code`) VALUES (?, ?, ?)",
//             [userId, followeeActiveId, code]
//          ).then(function()
//          {
//            deferred.resolve()
//          })
//       })
         
//       return deferred.promise;
//    }

//    /**
//     * Used to confirm the email address of a user.
//    **/
//    static confirmGhostFollow(code: string)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_id`, `active_id` FROM `pending_ghost_follow` WHERE `code`=?", [code]).then(function(res: {user_id: number, active_id: number}[])
//       {
//          if (res.length == 0) {
//             //wrong code
//             deferred.resolve(false)
//          } else {
//             db.makeQuery("DELETE FROM `pending_ghost_follow` WHERE `code`=?", [code]).then(function()
//             {
//               UserAbst.getByID(res[0].user_id)
//               .then(function (user)
//               {
//                   UserAbst.followActive(user.id, res[0].active_id, true).then(function(userObj: User)
//                   {
//                      deferred.resolve(res[0].active_id)
//                   })
//                   UserAbst.confirmEmailByID(user.id)
//               })
//             })
//          }
//       })
//       return deferred.promise;
//    }
   


   
//    /**
//     * Used to confirm the email address of a user.
//    **/
//    static confirmEmail(code:string)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_id`, `email` FROM `pending_email_change` WHERE `code`=?", [code]).then(function(res: any[])
//       {
//          if (res.length == 0) {
//             //wrong code
//             deferred.resolve(false)
//          } else {
//             db.makeQuery("DELETE FROM `pending_email_change` WHERE `user_id`=?", [res[0].user_id]).then(function()
//             {
//                db.makeQuery("UPDATE `user` SET `email`=? WHERE `id`=?", [res[0].email, res[0].user_id]).then(function()
//                {
//                   UserAbst.getByID(res[0].user_id).then(function(userObj: User)
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
//     * Used to confirm the email address of a user based on other logic (such as password reset).
//     * Use with caution. - TCMoore
//     * FLAG SECURITY
//    **/
//    private static confirmEmailByID(id: number)
//    {
//       console.log("Confirming user " + id + " by ID")
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `email` FROM `pending_email_change` WHERE `user_id`=?", [id])
//       .then(function(res: { email: string}[])
//       {
//          if (res.length == 0) {
//             //wrong code
//             UserAbst.getByID(id)
//             .then( function (user: User)
//             {
//                deferred.resolve(user)
//             })
//          } else {
//             db.makeQuery("DELETE FROM `pending_email_change` WHERE `user_id`=?", [id]).then(function()
//             {
//                db.makeQuery("UPDATE `user` SET `email`=? WHERE `id`=?", [res[0].email, id]).then(function()
//                {
//                   UserAbst.getByID(id).then(function(userObj: User)
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
//     * Sends an email to the user about confirming their email address.
//     * does NOT create the record -- only sends the email for existing records.
//    **/
//    static sendConfirmationEmail(uid: number) : Q.Promise<boolean>
//    {
//       var deferred = Q.defer<boolean>()
//       db.makeQuery("SELECT `email`, `code` FROM `pending_email_change` WHERE `user_id`=?", [uid])
//       .then(function(results: { email: string; code: string}[])
//       {
//          if (results.length == 0)
//          {
//             deferred.resolve(false)
//          } else {
//             EmailAbst.send(
//                "Welcome to Ilion",
//                "<h1 style='text-align: center;'><span style='font-family:trebuchet ms,helvetica,sans-serif;'>Welcome to Ilion</span></h1><p style='text-align: center;'><span style='font-family:trebuchet ms,helvetica,sans-serif;'>To confirm your email address, please click </span><span style='helvetica, sans-serif; text-align: center;'><a href='" + YStrings.RETURN_HOST + "api/auth/confirm/"+results[0].code+"'>here</a>.",
//                results[0].email, uid
//             ).then(function()
//             {
//                deferred.resolve(true)
//             })
//          }
//       })
//       return deferred.promise;
//    }

   
//    /**
//     * Sends an email to the user with a link to reset their password.
//    **/
//    static sendPasswordResetEmail(userID: number, email: string)
//    {
//       var deferred = Q.defer()
//       var code = UserAbst.generateCode(50)
//       if (!email)
//       {
//             db.makeQuery("SELECT `email` FROM `pending_email_change` WHERE `user_id`=?", [userID]).then(function(results: {email: string}[])
//             {
//                if (results.length == 0) {
//                   //wrong code
//                   deferred.resolve(false)
//                } else {
//                   db.makeQuery("INSERT INTO `pending_password_reset` (`user_id`, `code`) VALUES (?, ?)", [userID, code]).then(function()
//                   {
//                      EmailAbst.send(
//                         "Ilion | Password Reset",
//                         "If you requested a password reset, click " +
//                         "<a href='" + YStrings.RETURN_HOST + "i/auth/reset/" +code+ "'>here</a> " +
//                         "to set your new password. If not, don\'t worry! Nothing has been changed.",
//                         results[0].email,
//                         userID
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
//          db.makeQuery("INSERT INTO `pending_password_reset` (`user_id`, `code`) VALUES (?, ?)", [userID, code]).then(function()
//          {
//             EmailAbst.send(
//                "Ilion | Password Reset",
//                "If you requested a password reset, click " +
//                "<a href='" + YStrings.RETURN_HOST + "i/auth/reset/"+code+"'>here</a> " +
//                "to set your new password. If not, don\'t worry! Nothing has been changed.",
//                email,
//                userID
//             ).then(function()
//             {
//                deferred.resolve()
//             })
//          })
//       }
//       return deferred.promise;
//    }

//    sendInvitedEmail(userID: number, yoller: YollerInfoDto, cp: CollabDto)
//    {
//       var deferred = Q.defer();
//       db.makeQuery("SELECT `email`, `code` FROM `pending_email_change` WHERE `user_id`=?", [userID]).then(function(results: {email: string, code: string}[])
//       {
//          if (results.length == 0)
//          {
//             deferred.resolve(false)
//          } else {
//             EmailAbst.send(
//                "Welcome to Ilion",
//                "<h1 style='text-align: center;'><span style='font-family:trebuchet ms,helvetica,sans-serif;'>Welcome to Ilion</span></h1><p style='text-align: center;'><span style='font-family:trebuchet ms,helvetica,sans-serif;'>You've been added to " + yoller.title + " as " + cp.role + ".<br/><br/<p style='text-align: center;'><span style='font-family:trebuchet ms,helvetica,sans-serif;'>Ilion is an event networking site for theater artists, and you've been invited to join!<br/><br/>Sign up <a href='" + YStrings.RETURN_HOST + "api/auth/confirm/" +results[0].code+"'>here</a>.",
//                results[0].email,
//                userID
//             ).then(function()
//             {
//                deferred.resolve(true)
//             })
//          }
//       })
//       return deferred.promise;
//    }

//    sendGhostFollowConfirmation(userID: number, email: string, followee:User)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       db.makeQuery("SELECT `code` FROM `pending_ghost_follow` WHERE `user_id`=? AND `active_id`=?", [userID, followee.activeID]).then(function(results: {code:string}[])
//       {
//          if (results.length == 0)
//          {
//             deferred.resolve(false)
//          } else {
//             if (!email)
//             {
//                db.makeQuery("SELECT `email` FROM `pending_email_change` WHERE `user_id`=?", [userID])
//                .then(function (emailRes)
//                {

//                   EmailAbst.send(
//                     "Did you follow " + followee.alias + "?",
//                     "<h1 style=\"text-align: center;\"><span style=\"font-family:trebuchet ms,helvetica,sans-serif;\">You followed " +  followee.alias + " on Ilion!</span></h1><p style=\"text-align: center;\"><span style=\"font-family:trebuchet ms,helvetica,sans-serif;\">If you didn\'t, then don\'t worry; no action is necessary.<br/><br/>But to receive emails when " + followee.alias + " is in a show, click <a href=\"" + YStrings.RETURN_HOST + "api/auth/confirmFollowing?followeeActiveID="+ followee.activeID +"&code="+results[0].code+"\">here</a>.",
//                     emailRes[0].email,
//                     userID
//                   ).then(function()
//                   {
//                     deferred.resolve(true)
//                   })
//                })
//             }
//             else {

//                EmailAbst.send(
//                  "Did you follow " + followee.alias + "?",
//                  "<h1 style=\"text-align: center;\"><span style=\"font-family:trebuchet ms,helvetica,sans-serif;\">You followed " +  followee.alias + " on Ilion!</span></h1><p style=\"text-align: center;\"><span style=\"font-family:trebuchet ms,helvetica,sans-serif;\">If you didn\'t, then don\'t worry; no action is necessary.<br/><br/>But to receive emails when " + followee.alias + " is in a show, click <a href= YStrings.RETURN_HOST + \"api/auth/confirmFollowing?followeeActiveID="+ followee.activeID +"&code="+results[0].code+"\">here</a>.",
//                  email,
//                  userID
//                ).then(function()
//                {
//                  deferred.resolve(true)
//                })
//            }
//          }
//       })
//       return deferred.promise;
//    }


//    // Need to bring this back -- TCMoore

//   //  public static removeProfilePhoto(userId:number)
//   //  {
//   //      var obj = this
//   //      var deferred = Q.defer()
//   //      console.log('removing profile photo')
//   //      if (obj.profilePhotoID)
//   //      {
//   //         console.log('ok')
//   //         var blobStorage = require('./BlobStorage')
//   //         blobStorage.removeImage(obj.profilePhotoID).then(function(res)
//   //            {
//   //            console.log('deleted')
//   //            obj.profilePhoto = null
//   //            obj.profilePhotoID = null;
//   //            deferred.resolve(res)
//   //            })
//   //      } else {
//   //         obj.profilePhoto = null
//   //         deferred.resolve(true)
//   //      }
//   //      return deferred.promise;
//   //  }

//    public static setProfilePictureToURL(userId: number, url: string)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       console.log("setting photo")
//       db.makeQuery("INSERT INTO `photo` (`url`, `extension`) VALUES (?, NULL)", [url]).then((newPhoto: any) =>
//       {
//          console.log("removing photo")
//         //  this.removeProfilePhoto(userId).then(() =>
//         //  {
//             console.log("updating")
//             db.makeQuery("UPDATE `user` SET `profile_photo_id`=? WHERE `id`=?", [newPhoto.insertId, userId]).then(() =>
//             {
//                console.log("done")
//                deferred.resolve(true)
//             })
//         //  })
//       })
//       return deferred.promise;
//    }

//    /**
//     * Used to reset a User's password when they've clicked the link from an email.
//     * Returns a User object if it worked, false if incorrect code.
//    **/
//    static resetPassword(newPassword: string, code: string)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("SELECT `user_id` FROM `pending_password_reset` WHERE `code`=?", [code]).then(function(records: {user_id: number}[])
//       {
//          console.log("userID:")
//          console.log(records)
//          if (records.length == 0)
//          {
//             console.log("no pending password resets")
//             deferred.resolve(false)
//          } else {
//             db.makeQuery("UPDATE `user` SET `password`=UNHEX(SHA1(CONCAT(?, `salt`))) WHERE `id`=?", [newPassword, records[0].user_id]).then(function()
//             {
//                db.makeQuery("DELETE FROM `pending_password_reset` WHERE `user_id`=?", [records[0].user_id]).then(function()
//                {
//                   UserAbst.getByID(records[0].user_id).then(function(userObj: User)
//                   {
//                      UserAbst.confirmEmailByID(userObj.id)
//                      .then(function (userObj)
//                      {
//                         console.log("user confirmed and ready");
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

//    static changePassword(uid: number, newPassword: string)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("UPDATE `user` SET `password`=UNHEX(SHA1(CONCAT(?, `salt`))) WHERE `id`=?", [newPassword, uid]).then(function()
//       {
//          deferred.resolve()
//       })
//       return deferred.promise;
//    }
//    /**
//     * Used internally to generate auth codes to send to users to confirm
//     * emails and other things.
//     *
//     * TODO: This implementation is ridiculous. There is no reason to be using recursion here. This should be
//     * re-written with a 'for' loop.
//     * 
//    **/
//    private static generateCode(length: number) : string
//    {
//       if (length <= 0) {
//          return "";
//       }
//       var language: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//       return language.charAt(Math.floor(Math.random() * language.length)) + this.generateCode(length - 1);
//    }


//    private static updateUserActive(user: UserMin, activeID: number, keepOldActive: boolean): Q.Promise<boolean>
//    {
//       var deferred = Q.defer<boolean>()
//       db.makeQuery("UPDATE `user` SET `active_id`=? WHERE `id`=?", [activeID, user.id])
//       .then((upd) =>
//       {
//          var oldActiveID = user.id
//          user.activeID = activeID
//          if (keepOldActive) {
//             deferred.resolve(true);
//          }
//          else
//          {
//             //deactivate old alias
//             db.makeQuery("UPDATE `active` SET `enabled`=0 WHERE `id`=?",[oldActiveID])
//             .then((res) =>
//             {
//                deferred.resolve(true);
//             });
//          }
//       })
//       return deferred.promise;
//    }

// //    //----------------- Credits ----------------------
// //    
// //    getUpcomingCredits()
// //    {
// //    
// //    }
// //    
// //    getPastCredits()
// //    {
// //    
// //    }

//    /**
//     * Gets a user's current credits.
//    **/
//    getAllCredits(userID: number)
//    {
//       var deferred = Q.defer();
//       db.makeQuery(
//          "SELECT sar.id AS sarID, r.`label` AS role, y.id AS yollerID, y.title AS yollerTitle FROM `section_active_role` sar " +
//          "LEFT JOIN `yoller_section` sec ON (sec.id=sar.yoller_section_id) " +
//          "LEFT JOIN `role` r ON (r.id = sar.role_id) " +
//          "LEFT JOIN `yoller` y ON (y.id=sec.yoller_id) " +
//          "WHERE sar.`active_id` IN (SELECT `id` FROM `active` WHERE `user_id`=?)", [userID]).then(function(sars)
//       {
//          deferred.resolve(sars)
//       })
//       return deferred.promise;
//    }

//    /**
//     * Returns the credits available for the user
//     * to claim -- that is, the credits given to
//     * an anonymous user with the same alias
//     * as the user's current alias.
//    **/
//    static getAnonAliasCredits(userAlias: number)
//    {
//       var deferred = Q.defer();
//       db.makeQuery(
//          "SELECT sar.id AS sarID, r.`label` AS role, y.id AS yollerID, y.title AS yollerTitle FROM `section_active_role` sar " +
//          "LEFT JOIN `yoller_section` sec ON (sec.id=sar.yoller_section_id) " +
//          "LEFT JOIN `role` r ON (r.id = sar.role_id) " +
//          "LEFT JOIN `yoller` y ON (y.id=sec.yoller_id) " +
//          "WHERE sar.`active_id` IN (SELECT `id` FROM `active` WHERE `alias`=? AND `user_id` IS NULL AND `group_id` IS NULL)",
//          [userAlias]
//       ).then(function(res)
//       {
//          deferred.resolve(res)
//       })
//       return deferred.promise;
//    }

//    /**
//     * Removes the requested section_active_role record,
//     * replacing it with an anonymous user credit by the
//     * same alias.
//     *
//     * Returns whether or not the SAR was successfully removed
//     * from this particular user.
//    **/
//    static removeCredit(userID: number, sarID: number)
//    {
//       var deferred = Q.defer()
//       this.ownsCredit(userID, sarID).then((owns) =>
//       {
//          if (!owns)
//          {
//             deferred.resolve(false)
//          } else {
//             //The user owns the credit. Make an anonymous user to give credit to.
//             // UserAbst.anonymous(obj.alias).then(function(anonID)
//             // {
//             //    db.makeQuery("UPDATE `section_active_role` SET `active_id`=? WHERE `id`=?", [anonID, sarID]).then(function()
//             //    {
//             //       deferred.resolve(true)
//             //    })
//             // })
//          }
//       })
//       return deferred.promise;
//    }

//    public static getAnonymous(alias: string)
//    {
//       var deferred = Q.defer()
//       //First, see if an alias already exists.
//       //If this logic changes, it must also be changed in createYoller
//       db.makeQuery("SELECT `id` FROM `active` WHERE `user_id` IS NULL AND `group_id` IS NULL AND `alias`=? LIMIT 1",[alias])
//          .then((res: any[]) =>
//          {
//             if (res.length == 0)
//             {
//                db.makeQuery(
//                   "INSERT INTO `active` (`user_id`, `group_id`, `alias`, `enabled`) VALUES (NULL,NULL,?,1)",
//                   [alias]
//                ).then((active: OkPacket) =>
//                {
//                   deferred.resolve(active.insertId)
//                })
//             }
//             else
//             {
//                deferred.resolve(res[0].id)
//             }
//          })
//       return deferred.promise;
//    }

//    /**
//     * Allows a user to claim the credit of a role
//     * currently occupied by an anonymous user of the
//     * exact same alias as the current user object.
//     *
//     * Returns whether or not the credit was claimed.
//     * If false, it means the credit was not available.
//    **/
//    static claimCredit(activeID: number, activeAlias: string, sarID: number)
//    {
//       var deferred = Q.defer()
//       var obj = this
//       UserAbst.isCreditAvailable(activeAlias, sarID).then((avail) =>
//       {
//          if (avail)
//          {
//             /* todo: see if the anonymous user that currently
//              * holds this credit has any other credits. If not,
//              * delete that user.
//              */
//             db.makeQuery("UPDATE `section_active_role` SET `active_id`=? WHERE `id`=?", [activeID, sarID]).then(() =>
//             {
//                deferred.resolve(true)
//             })
//          } else {
//             deferred.resolve(false)
//          }
//       })
//       return deferred.promise;
//    }

//    /**
//     * Used internally to determine if a credit is
//     * available for a user to claim. The credit must
//     * be currently occupied by an anonymous user of the
//     * same exact alias as the current user object's active alias.
//     *
//     * Returns whether the credit is available or not.
//    **/
//    static isCreditAvailable(userAlias: string, sarID: number): Q.Promise<boolean>
//    {
//       var deferred = Q.defer<boolean>()
//       db.makeQuery("SELECT `id` FROM `section_active_role` WHERE `id`=? AND `open`=1 AND `active_id` IN ("+
//          "SELECT `id` FROM `active` WHERE `alias`=? AND `user_id` IS NULL AND `group_id` IS NULL" +
//       ")", [sarID, userAlias]).then((res: any[]) =>
//       {
//          deferred.resolve(res.length > 0)
//       })
//       return deferred.promise;
//    }

//    /**
//     * Used internally to determine whether or not
//     * the current user owns the given credit.
//     *
//     * Returns whether the user owns the credit.
//    **/
//    static ownsCredit(userID: number, sarID: number): Q.Promise<boolean>
//    {
//       var deferred = Q.defer<boolean>()
//       db.makeQuery("SELECT `id` FROM `section_active_role` WHERE `id`=? AND `active_id` IN (" +
//          "SELECT `id` FROM `active` WHERE `user_id`=?" +
//       ")", [sarID, userID]).then((res: any[]) =>
//       {
//          deferred.resolve(res.length > 0)
//       })
//       return deferred.promise;
//    }

// //    //--------------- Communication ----------------
// //    
// //    //Sends `message` to user via their .phone number.
// //    //Returns whether or not the text was sent.
// //    sendText(message)
// //    {
// //       var deferred = Q.defer()
// //       var twilio = require('twilio'),
// //          client = new twilio.RestClient(strings.TWILIO_SID, strings.TWILIO_TOKEN),
// //          obj = this
// //       if (obj.phone != null) {
// //          console.log("Sending '"+message+"' to "+this.phone+"...")
// //          client.sms.messages.create(
// //          {
// //             to : obj.phone,
// //             from : strings.TWILIO_NUM,
// //             body : message
// //          },
// //          function(error, errorMessage)
// //          {
// //             if (error)
// //             {
// //                console.log("Error sending text message: " + errorMessage)
// //                deferred.resolve(false)
// //             } else {
// //                db.makeQuery("INSERT INTO `sent_text` (`user_id`, `message`) VALUES (?, ?)", [userID, message]).then(function()
// //                {
// //                   deferred.resolve(true)
// //                })
// //             }
// //          })
// //       } else {
// //          console.log("The user has no phone on record.")
// //          deferred.resolve(false)
// //       }
// //       return deferred.promise;
// //    }
// //    



    
// //    //----------------- RSVPs ----------------------
// //    
// //    getUpcomingRSVPs()
// //    {
// //    
// //    }
// //    
// //    getPastRSVPs()
// //    {
// //    
// //    }
// //    
// //    getAllRSVPs()
// //    {
// //    
// //    }

//    //----------------- Followers ----------------------

//    // TODO: All of these routines can and should be simplified by changing our model so that a user follows
//    // another user, rather than a user following an active.
   
//    /* Sets the user identified by 'uid' to be a follower of the active identified by 'activeID'. */
//    static followActive(uid: number, activeID: number, getNotifications: boolean)
//    {
//       var deferred = Q.defer()
//       //First, make sure user isn't already following active and isn't trying to follow himself!
//       db.makeQuery("(SELECT `id` FROM `active_follower` WHERE `active_id`=? AND `follower_id`=? LIMIT 1) UNION " +
//          "(SELECT `id` FROM `active` WHERE `user_id`=? AND `id`=? LIMIT 1)",[activeID, uid, uid, activeID])
//       .then(function(existingFollows: {}[])
//       {
//          if (existingFollows.length > 0)
//          {
//             //already following!
//             console.log("This user is either already following active " + activeID + " or she IS that active!")
//             deferred.resolve()
//          } else {
//             db.makeQuery("INSERT INTO `active_follower` (`active_id`, `follower_id`, `notifications`) VALUES (?,?,?)",
//                [activeID, uid, (getNotifications ? 1 : 0)]).then(function(result)
//             {
//                deferred.resolve()
//             })
//          }
//       })
//       return deferred.promise;
//    }

//    static unfollowActive(uid: number, activeID: number)
//    {
//       var deferred = Q.defer()
//       db.makeQuery("DELETE FROM `active_follower` WHERE `follower_id`=? AND `active_id` IN (" +
//          //The following works because NULL != NULL in MySQL
//          //Selects all active IDs from and active ID (through user/group row)
//          "SELECT `id` FROM `active` WHERE `user_id`=(SELECT `user_id` FROM `active` WHERE `id`=?) OR "+
//                       "`group_id`=(SELECT `group_id` FROM `active` WHERE `id`=?) " +
//       ")", [uid, activeID, activeID]).then(function(res: OkPacket)
//       {
//          if (res.affectedRows == 0)
//          {
//             console.log("The user wasn't following active "+activeID + " to begin with.")
//          }
//          deferred.resolve()
//       })
//       return deferred.promise;
//    }

//    static getFollowers(uid: number) : Q.Promise<User[]>
//    {
//       var deferred = Q.defer<User[]>();
//       db.makeQuery("SELECT `follower_id` AS `id` FROM `active_follower` WHERE `active_id` IN (" +
//                    "SELECT `id` FROM `active` WHERE `user_id`=?)", [uid])
//       .then(function(rgobj: {id: number}[])
//       {
//         Assert(rgobj, "Got null back from query in getFollowers.");
//         var rguid: number[] = [];
//         for (var iobj = 0 ; iobj < rgobj.length ; iobj++) {
//            rguid.push(rgobj[iobj].id);
//         }
//         if (rguid.length === 0) return deferred.resolve([])  
//         else {
//             UserAbst.getUsers(rguid)
//             .then((rguser) =>
//            {
//             // TODO: Do we need the information provided by fillRelationsWith? If so, we should bring back
//             // this functionality, probably as a boolean parameter to UserAbst.getUsers.

//    //             users.fillRelationsWith(uid).then(function()
//    //                {
//    //                deferred.resolve(users)
//    //                })
      
//             deferred.resolve(rguser);
//             })
//          }
//       })
//       return deferred.promise;
//    }



//    /*--------------------------------------------------------------------------------------------------------
//       getRawFollowees

//    Returns an array of active_ids representing the actives who are followed by the user whose ID is 'uid'.

//    --------------------------------------------------------------------------------------------- CGMoore --*/
//    static getRawFollowees(uid: number) : Q.Promise<number[]>
//       {
//       var deferred = Q.defer<number[]>();
//       var qry: db.Query = new db.Query(
//          "SELECT `active_id` FROM `active_follower` WHERE `follower_id` = ? ORDER BY `active_id` ASC",
//          [ uid ]);
//       db.doQuery(qry)
//       .then(function( rgActId: number[])
//          {
//          deferred.resolve(rgActId);
//          })
//       return deferred.promise;
//       }

      
//    static getFollowees(uid: number) : Q.Promise<User[]>
//    {
//       var deferred = Q.defer<User[]>();
//       db.makeQuery("SELECT act.`user_id`, af.`active_id` FROM `active_follower` af " +
//                    "LEFT JOIN `active` act ON (af.active_id = act.id) WHERE `follower_id`=? " +
//                    "ORDER BY act.`user_id` ASC", [uid])
//       .then(function(actives: {active_id: number; user_id: number}[])
//          {
//          if (actives.length === 0)
//             deferred.resolve([]);
//          else
//             {
//             // Now need to find unique users. (Remove duplicates from a sorted array. :-) )
//             var rguid: number[] = [];
//             for (var iact: number = 0 ; iact < actives.length ; iact++)
//             {
//                if (rguid.length === 0)
//                {
//                   if (actives[iact].user_id) {
//                      rguid.push(actives[iact].user_id);
//                   }
//                   continue;
//                }
//                if (actives[iact].user_id && actives[iact].user_id !== rguid[rguid.length - 1])
//                {
//                   rguid.push(actives[iact].user_id);
//                }
//             }
//             if (rguid.length === 0) return deferred.resolve([])  
//             else UserAbst.getUsers(rguid)
//             .then(function(rguser: User[])
//                {
//                // TODO: Do we need the information provided by fillRelationsWith? If so, we should bring back
//                // this functionality, probably as a boolean parameter to UserAbst.getUsers.
           
// //             users.fillRelationsWith(uid).then(function()
// //                {
// //                deferred.resolve(users)
// //                })
   
//                deferred.resolve(rguser);
//                })
//             }
//          })
//       return deferred.promise;
//    }

// //    /*
// //     * For a user that is already following the followee, this method lets you set
// //     *    whether or not notifications will be sent about something that followee is doing.
// //     *
// //     *    The User must be already following the active.
// //     *
// //     */
// //    setFollowNotifications(activeID, getNotifications)
// //    {
// //       var deferred = Q.defer()
// //       db.makeQuery("UPDATE `active_follower` SET `notifications`=? WHERE `active_id`=? AND `follower_id`=?",
// //          [getNotifications, activeID, this.id]).then(function(results)
// //       {
// //          if (results.affectedRows == 0)
// //          {
// //             console.log("The user wasn't following active "+activeID+"! Notifications not set.")
// //             deferred.reject(null);
// //          }
// //          else deferred.resolve()
// //       })
// //       return deferred.promise;
// //    }
// //    
// //    /*
// //     *
// //     * Eventually, it will return a Users object of a bunch of people whom the User does NOT
// //     *    follow, but are somehow connected to the current User. For now, it returns the last 10
// //     *    users to sign up.
// //     *
// //     *
// //     */
// // // This query below may be faster, as it selects everything rather than just the ids
// // // I should investigate how Users().getByQuery works
// // //
// // // select user_id AS `id` from 
// // //   (select user_id, COUNT(yoller_id) as magnitude from
// // //     (select u.id as user_id, y.id as yoller_id from user u  
// // //           left join active a on a.user_id = u.id 
// // //           left join section_active_role sar on sar.active_id = a.id 
// // //           left join yoller_section ys on ys.id = sar.yoller_section_id 
// // //           left join yoller y on y.id = ys.yoller_id 
// // //       GROUP BY concat(u.id, y.id)) user_yollers
// // //    GROUP BY user_id) u_mag
// // // WHERE user_id != 48 AND `user_id` NOT IN ( 
// // //   SELECT `user_id` FROM `active` WHERE `id` IN ( 
// // //     SELECT `active_id` FROM `active_follower` WHERE `follower_id`=48 
// // //     )
// // //   )
// // // ORDER BY u_mag.magnitude DESC LIMIT 10 
// // 
// // 
// //    getRecommendedUsers() {
// //       var deferred = Q.defer()
// //       var Users = require('./Users.js')
// //       new Users().getByQuery(
// //         "select user_id AS `id` from  " +
// //          "  (select user_id, COUNT(yoller_id) as magnitude from " +
// //          "    (select u.id as user_id, y.id as yoller_id from user u   " +
// //          "          left join active a on a.user_id = u.id  " +
// //          "          left join section_active_role sar on sar.active_id = a.id  " +
// //          "          left join yoller_section ys on ys.id = sar.yoller_section_id  " +
// //          "          left join yoller y on y.id = ys.yoller_id  " +
// //          "          left join yoller_occurrence yo on y.id = yo.yoller_id  " +
// //          "          where yo.local_time >= NOW()-interval 6 month AND u.email IS NOT NULL AND u.profile_photo_id IS NOT NULL " +
// //          "      GROUP BY concat(u.id, y.id)) user_yollers " +
// //          "   GROUP BY user_id) u_mag " +
// //          "WHERE user_id != ? AND `user_id` NOT IN (  " +
// //          "  SELECT `user_id` FROM `active` WHERE `id` IN (  " +
// //          "    SELECT `active_id` FROM `active_follower` WHERE `follower_id`=?  " +
// //          "    ) " +
// //          "  ) " +
// //          "ORDER BY u_mag.magnitude DESC LIMIT 10  " , [this.id, this.id])
// //         .then(function(usersObj) {deferred.resolve(usersObj)})
// //       return deferred.promise;
// //    }
// //    
// //    // ------------------ Groups ---------------------
// //    
// //    /*
// //     * Adds a request for the user to join the given group.
// //     *    If the Group has already requested that the user join
// //     *    that group, it will simply confirm the membership,
// //     *    Otherwise, it will create a request that the group
// //     *    then must confirm.
// //     *
// //     *    the role attribute is a Role object (will be typescript
// //     * eventually)
// //     *
// //     * Optionally, provide start and end parameters to request
// //     * to join a group for that specific period. Default is
// //     *    start: now
// //     *    end: null (never)
// //     */
// //    joinGroup(groupID, role, start, end)
// //    {
// //       var Group = require('../modules/Group.js');
// //       var deferred = Q.defer()
// //       if (!start) start = new Date()
// //       if (!end) end = null
// //       var obj = this
// //       new Group().getByID(groupID).then(function(group)
// //       {
// //          group.addMember({
// //             userID : userID,
// //             role : role,
// //             start : start,
// //             end : end
// //          }, true).then(function()
// //          {
// //             deferred.resolve()
// //          })
// //       })
// //       return deferred.promise
// //    }
// //    
// //    /**
// //     * Leaves the group at the current timestamp.
// //     * This keeps the record of this user's membership,
// //     * but ends it now. To remove a membership, use
// //     * GroupObject.removeMembership(membershipID)
// //    **/
// //    endGroupMembership(membershipID)
// //    {
// //       var deferred = Q.defer()
// //       //Uses the user ID as well to ensure that a user doesn't end someone else's membership.
// //       db.makeQuery(
// //          "UPDATE `user_group_membership` SET `end_time`=CURRENT_TIMESTAMP WHERE `end_time` IS NULL AND `user_id`=? AND `id`=?",
// //          [this.id, membershipID]
// //       ).then(function(res){ deferred.resolve() })
// //       return deferred.promise;
// //    }
// //    
// //    /**
// //     * Returns an array of the following objects:
// //     * {
// //     *    role     : Role;
// //     *    start       : Date;
// //     *    end      : Date;
// //     *    membershipID: number;
// //     *    group       : Group
// //     *  }
// //    **/
// //    getMemberships(includeRequests)
// //    {
// //       var Group = require('../modules/Group.js');
// //       var deferred = Q.defer()
// //       //Todo: use Groups.getByQuery when Groups are implemented
// //       db.makeQuery(
// //          "SELECT ugm.*, r.label FROM `user_group_membership` ugm LEFT JOIN `role` r ON (ugm.role_id=r.id) WHERE `user_id`=? " +
// //          (includeRequests ? "" : " AND ugm.user_confirmed=1 AND ugm.group_confirmed=1"),
// //          [this.id]
// //       ).then(function(res)
// //       {
// //          var memberships = []
// //          function getGroup(i)
// //          {
// //             if (i < res.length)
// //             {
// //                new Group().getByID(res[i].group_id).then(function(groupObj)
// //                {
// //                   memberships.push({
// //                      role  : {
// //                         id     : res[i].role_id,
// //                         label: res[i].label
// //                      },
// //                      start    : res[i].start_time,
// //                      end   : res[i].end_time,
// //                      membershipID: res[i].id,
// //                      group : groupObj,
// //                      request : res[i].user_confirmed ? (res[i].group_confirmed ? "confirmed" : "outgoing") : "incoming"
// //                   })
// //                   getGroup(i+1)
// //                })
// //             } else {
// //                deferred.resolve(memberships)
// //             }
// //          }
// //          getGroup(0)
// //       })
// //       return deferred.promise;
// //    }
// //    
// //    /**
// //     *
// //     * Gets a user's relationship with the given group.
// //     *    returns one of the following:
// //     *    "none"      : no requests/memberships
// //     *       "incoming"  : the group has requested that the user join
// //     *    "outgoing"  : the user has requested to join the group (pending)
// //     *    "confirmed" : The user is a member of the group
// //     *
// //    **/
// //    getGroupRelationship(groupID)
// //    {
// //       var deferred = Q.defer()
// //       db.makeQuery("SELECT `user_confirmed`, `group_confirmed` FROM `user_group_membership` WHERE `group_id`=? AND `user_id`=?", [groupID, this.id])
// //         .then(function(res)
// //       {
// //          if (res.length == 0) deferred.resolve('none')
// //          if (res[0].user_confirmed) {
// //             if (res[0].group_confirmed) deferred.resolve('confirmed')
// //             else deferred.resolve('outgoing')
// //          } else deferred.resolve('incoming')
// //       })
// //       return deferred.promise;
// //    }
// //    
// //    /*
// //     *
// //     * Returns an array of Groups objects that the user owns.
// //     *
// //     */
// //    getMyGroups()
// //    {
// //       var Group = require('../modules/Group.js');
// //       //todo use Groups object instead.
// //       var deferred = Q.defer()
// //       db.makeQuery("SELECT `id` FROM `group` WHERE `owner_id`=?", [this.id]).then(function(res)
// //       {
// //          var groups = []
// //          function getGroup(i)
// //          {
// //             if (i < res.length)
// //             {
// //                new Group().getByID(res[i].id).then(function(groupObj)
// //                {
// //                   groups.push(groupObj)
// //                   getGroup(i+1)
// //                })
// //             } else {
// //                deferred.resolve(groups)
// //             }
// //          }
// //          getGroup(0)
// //       })
// //       return deferred.promise;
// //    }
// //    
// //    // ------------------- Yollers ----------------------
// //    
// //    /*
// //     * Returns a Yollers object of the yollers that this user owns.
// //     */
// //    getMyYollers(nonUnter?:boolean)
// //    {
// //       var deferred = Q.defer()
// //       var Yollers = require('../modules/Yollers.js');
// //       Yollers.getByQuery("SELECT `id` FROM `yoller` WHERE `owner_id`=?" + (nonUnter?" AND `umbrella_yoller_id` IS NULL":""), [this.id], this.id).then(function(yollers)
// //       {
// //          deferred.resolve(yollers)
// //       })
// //       return deferred.promise
// //    }
   
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
//     * Parameters:
//     * userID         The ID of the user whose profile we are fetching.
//     * currentUserID  The ID of the current session user (the user making the request).
//     *
//     */
//    static getProfileYollers(userID: number, currentUserID: number, filter: IFeedFilter) : Q.Promise<YollerBlock[]>
//    {
//       var yllrsPerPage = 20
//       var deferred = Q.defer<YollerBlock[]>();

//       /* Find the yoller_ids for the yollers in which 'userID' has (or has had) a hand. (Is or has been a
//        * collaborator.) */

//       // TODO: the page limit applied below should probably not be applied here. It should instead be
//       // applied inside YollerBlocks.getNextUpcomingByIDs.
//       db.makeQuery(
//          "SELECT DISTINCT `yoller_id` AS `id` " +
//          "FROM `yoller_occurrence` yo " +
//          "WHERE `yoller_id` IN (" +
//             "SELECT `yoller_id` AS `id` FROM `yoller_section` WHERE `id` IN ("+
//                "SELECT `yoller_section_id` FROM `section_active_role` WHERE `active_id` IN ("+
//                   "SELECT `id` FROM `active` WHERE `user_id`=?"+
//                ")"+
//             ")"+
//          ")" +
//          " LIMIT "+(filter.page*yllrsPerPage)+","+yllrsPerPage, [userID])
//       .then(function(results: {id: number}[])
//       {
//          var rgid: number[] = [];
//          for (var i = 0 ; i < results.length ; i++)
//             {
//             rgid.push(results[i].id);
//             }
//          YollerBlocks.getNextUpcomingByIDs(rgid, currentUserID).then(function(yollerBlocks: YollerBlock[])
//             {
//             deferred.resolve(yollerBlocks);
//             })
//       })
//       return deferred.promise;
//    }
   
// //    /*
// //     * Returns a Yollers object of the yollers that this user is
// //     *    a collaborator of, in relation to currentUserID.
// //     *
// //     *    The optional parameter filter takes the following form:
// //     *    filter = {
// //     *       page      : int / undefined (0), (pages start at 0)
// //     *    typeID       : int / undefined (all),
// //     *    archived  : true / undefined (false [future])
// //     * }
// //     *
// //     */
//    static getResumeYollers(userID: number, currentUserID: number, filter: IFeedFilter)
//    {
//       if (!filter.page) filter.page = 0
//       var yllrsPerPage = 20
//       var deferred = Q.defer()
//       YollerSetsAbst.getByQuery(
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
//          " LIMIT "+(filter.page*yllrsPerPage)+","+yllrsPerPage, [userID], null
//       ).then((yollers) =>
//       {
//         //  Yollers.attachUserCredits(yollers, userID).then(function()
//         //  {
//         //     deferred.resolve(yollers)
//         //  })
//          deferred.resolve(yollers)
//       })
//       return deferred.promise;
//    }


//    static getTotalYollerCount(userID: number)
//    {
//       var deferred = Q.defer()
//       db.makeQuery(
//          "SELECT `id` " +
//          "FROM yoller " +
//          "WHERE `id` IN (" +
//             "SELECT `yoller_id` AS `id` FROM `yoller_section` WHERE `id` IN ("+
//                "SELECT `yoller_section_id` FROM `section_active_role` WHERE `active_id` IN ("+
//                   "SELECT `id` FROM `active` WHERE `user_id`=?"+
//                ")"+
//             ")"+
//          ")", [userID]
//       ).then(function(results: any[])
//       {
//         deferred.resolve(results.length)
//       })
//       return deferred.promise;
//    }
   
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
   
// //    updateVote (frID, val) {
// //       console.log('id: ' + frID )
// //       console.log('val: ' + val)
// //           var deferred = Q.defer()
// //           var obj = this
// //           var frID = frID
// //           var val = val
// //           db.makeQuery("SELECT `value` FROM `user_feature_req` WHERE `user_id`=? AND `feature_req_id`=?;", [userID, frID]).then(function(results) {
// //               if (results.length == 0)
// //               {
// //                   db.makeQuery("INSERT INTO `user_feature_req` (`user_id`, `feature_req_id`, `value`) VALUES (?, ?, ?);", [userID, frID, val])
// //                   .then(function (result)
// //                   {
// //                      deferred.resolve(true)
// //                   })
// //               }
// //               else {
// //                   db.makeQuery("UPDATE `user_feature_req` SET `value`=? WHERE `user_id`=? AND `feature_req_id`=?;", [val, userID, frID])
// //                   .then(function (result)
// //                   {
// //                      deferred.resolve(true)
// //                   })
// //               }
// //           })
// //           return deferred.promise;
// //       }
// // 
// //       public static hasHidden(userId)
// //       {
// //         var deferred = Q.defer();
// //           db.makeQuery("SELECT EXISTS (SELECT `id` FROM `user_project_hidden` uph WHERE uph.`user_id`=?) as hasHidden", [userId])
// //           .then(function (result)
// //           {
// //             deferred.resolve(result[0])
// //           })
// //           return deferred.promise;
// //       }
//    }

   
//    class InvitedUser extends User {
//     inviteCode: string;
//   }