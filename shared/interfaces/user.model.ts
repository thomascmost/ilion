export interface User
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
   sticky: boolean;
   admin: boolean;
   aesir: boolean;
   timezone: string;
   profilePhoto: string;
   profilePhotoID: number;
   twitterToken: string;
   isFriend : boolean;
   isFollower: boolean;
   isFollowee: boolean;
   isNtfFollowee: boolean;
}