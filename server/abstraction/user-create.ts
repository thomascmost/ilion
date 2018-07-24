import {IUserCreate} from '@ilion/models/user-types'

export class UserCreate implements IUserCreate
   {
   alias       : string = null;
   tagline     : string = "";
   bio         : string = "";    // Not nullable in DB, so initialize to the empty string.
   email       : string = null;
   emailNtfs   : boolean = false;
   handle      : string = null; 
   password    : string = null;
   phone       : string = null;
   fbToken     : string = null;
   gPlusToken  : string = null;
   twitterToken: string = null;
   latitude    : number = null;
   longitude   : number = null;
   registered  : boolean = false;
   fSuppressEmail: boolean = false;
   }
