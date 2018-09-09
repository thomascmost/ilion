export default abstract class Env {

   // static get MYSQL_HOST(): string {
   //    return process.env.MYSQL_HOST;
   // }

   // static get MYSQL_USER(): string {
   //    return process.env.MYSQL_USER;
   // }

   // static get MYSQL_PASS(): string {
   //    return process.env.MYSQL_PASS;
   // }

   // static get MYSQL_DB(): string {
   //    return process.env.MYSQL_DB;
   // }

   static get DATABASE_URL(): string {
      return process.env.DATABASE_URL;
   }

   static get RETURN_HOST(): string {
      return process.env.RETURN_HOST;
   }

   static get JWT_SECRET(): string {
      return process.env.JWT_SECRET;
   }

   static get PASSKEY(): string {
      return process.env.PASSKEY;
   }

}