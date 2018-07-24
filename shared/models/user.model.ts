export class User implements IHandleAndName
{
   id        : number
   activeID  : number
   handle    : string 
   registered: boolean;
   alias     : string;
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
   sticky: boolean = false;
   admin: boolean = false;
   aesir: boolean = false;
   timezone: string;
   profilePhoto: string;
   profilePhotoID: number;
   twitterToken: string;
   isFriend : boolean;
   isFollower: boolean;
   isFollowee: boolean;
   isNtfFollowee: boolean;

   constructor()
   {
   this.id     = null
   this.activeID  = null
   this.handle    = null
   this.registered = false;
   this.alias     = null
   this.familyName   = null
   this.givenName = null
   this.email     = null
   this.emailNtfs = false;
   this.phone     = null
   this.phoneNtfs = false;
   this.bio       = null
   this.tagline       = null
   this.fbToken   = null
   this.gPlusToken = null
   this.sticky = false
   this.admin = false
   this.aesir = false
   this.timezone = null;
   this.profilePhoto = null;
   this.profilePhotoID = null;
   this.twitterToken = null;

   this.isFriend  = null;
   this.isFollower = null;
   this.isFollowee = null;
   this.isNtfFollowee = null;
   }
}

export class UserTiny implements IHandleAndName
{
   constructor(public id: number, public activeID: number, public handle: string, public alias: string, public profilePhoto?: string)
   {
   }
}

export interface IHandleAndName {
   alias: string;
   handle: string;
}

// export class UserMin {

//    id     = null
//    activeID  = null
//    handle    = null

//    isFriend  = null
//    isFollower = null
//    isFollowee = null
//    isNtfFollowee = null
// }