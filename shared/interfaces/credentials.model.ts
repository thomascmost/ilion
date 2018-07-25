export interface ICredentials {
   username: string;
   password: string;
   rememberMe: boolean;
}

export interface ISignupCredentials {
   handle: string;
   email: string;
   publicName: string;
   password: string;
   cPassword: string;
}

export interface IPasswordResetCredentials {
   code: string;
   password: string;
   cPassword: string;
}