//db.ts

// tslint:disable-next-line:variable-name
import { Sequelize } from "sequelize-typescript";
import Env from "../env";
import {initializeDB} from "./db.initializer";
const sequelize = new Sequelize({
   url: Env.DATABASE_URL,
   dialect: "postgres",
   port: 5432,
   modelPaths: [__dirname + "/../models"],
   pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
   }
});

// initializeDB(sequelize);
// var sequelize = new Sequelize("postgres://postgres:0pass@localhost:5432/iliondb");

// Use this class to construct a general query object. The format is:
// strQuery: The MySQL query string with ?'s for values.
// values: the array of values, to be escaped and inserted where ? are.
export class Query
   {
   strQuery : string;
   values: any[];

   constructor (strQuery: string, values?: any[])
      {
      this.strQuery = strQuery;
      if (values)
         this.values = values;
      else
         this.values = [];
      }
   }
//Compares version compare strings
//  v1 == v2: 0
//  v1  > v2: 1
//  v1  < v2: -1
function versionCompare(v1:string, v2:string) {
  var v1parts:any = v1.split(".")
  var v2parts:any = v2.split(".")

  //Make 1.0.0.0.0 == 1.0
  while (v1parts.length < v2parts.length) {
     v1parts.push("0");
  }
  while (v2parts.length < v1parts.length) {
     v2parts.push("0");
  }

  //Make each one an integer
  v1parts = v1parts.map(Number);
  v2parts = v2parts.map(Number);

  //test each string
  for (var i = 0; i < v1parts.length; ++i)
  {
    if (v2parts.length == i) return 1;
    if (v1parts[i] == v2parts[i]) continue;
    else if (v1parts[i] > v2parts[i]) return 1;
    else return -1;
  }

  if (v1parts.length != v2parts.length) return -1;

  return 0;
}


//update script
export function checkDatabaseVersion()
{
   return initializeDB(sequelize)
   .then(function () {
      console.log("\n")
      console.log("[DB]\tChecking database version...");
      sequelize.query(`SET search_path='public'; SELECT value FROM db_info WHERE key='framework_version'`)
        .then(function(result: {value: string}[][] ) {
        if (result.length < 1)
        {
          console.error("Missing record in db_info table. Database updates will not be automatic.")
          console.error("Please set up the database from the init file in the #database channel on Slack.")
        }
        else
        {
          updateDatabase(result[0][0].value);
        }
      });
   });
}

function updateDatabase(fwVersion: string)
{
   console.log(fwVersion);
   var dbUpdates = [
   {
      "version" : "0.0.5",
      "queries" : [
         ""
      ]
   },
   {
      "version" : "0.0.6",
      "queries" : [
         `ALTER TABLE scene add column x_col INT NOT NULL DEFAULT 0`
      ]
   }
  ];

  //Check min database version
  if (versionCompare(fwVersion, dbUpdates[0].version) == -1)
  {
    console.error("[DB]\tYour database is too out-of-date for automatic updates. "+
      "Please run mysql/yollerdb-setup.sql to manually update the database.");
    throw "Out-of-date DB";
  } else if (versionCompare(fwVersion, dbUpdates[dbUpdates.length - 1].version) == 1)
  {
    console.error("[DB]\tWARNING: Your database is too new for this version of the website. " +
      "Please update to the latest commit, or unexpected behavior may occur.");
  }
  var queriesNeeded: any = [];
  var latestVersion = fwVersion;
  for (var i = 0; i < dbUpdates.length; i++)
  {
    if (versionCompare(fwVersion, dbUpdates[i].version) == -1)
    {
      Array.prototype.push.apply(queriesNeeded, dbUpdates[i].queries);
      latestVersion = dbUpdates[i].version;
    }
  }
  if (queriesNeeded.length > 0)
  {
   //updates are happening
   console.log("[DB]\tUpdating database from " + fwVersion + " to " + latestVersion + ". This may take a few seconds...");
   queriesNeeded.push(`UPDATE "db_info" SET "value"='${latestVersion}' WHERE key='framework_version'`);
   return sequelize.transaction(function (t) {
      let promises = [];
      for (const query of queriesNeeded) {
         promises.push(sequelize.query(query, {transaction: t}));
      }
      return Promise.all(promises)
         .then(function () {
         console.log("[DB]\tUpdate to " + latestVersion + " complete!");
         });
      });
   } else {
      console.log("[DB]\tYou're running IlionDB® v" + fwVersion + " and ready to go!");
   }
}
