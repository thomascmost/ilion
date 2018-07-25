//db.ts

export var pool: mysql.IPool =
  mysql.createPool({
    host     : strings.MYSQL_HOST,
    user     : strings.MYSQL_USER,
    password : strings.MYSQL_PASS,
    database : strings.MYSQL_DB
  })
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

export function doQuery(query: Query)
   {
   return makeQuery(query.strQuery, query.values);
   }
   
// This function performs a general query. The format is:
// strQuery: The MySQL query string with ?'s for values.
// values: the array of values, to be escaped and inserted where ? are.
// The callback function will be called and passed the results array of rows objects.
export function makeQuery(query: string, values?:any[])
{
  var deferred = Q.defer();
  pool.getConnection(function(error: mysql.IError, connection: mysql.IConnection)
    {
    if (error) {
      console.log("[DB]\tConnect Error: "+error);
      deferred.reject(error);
    } else {
      connection.query(
        query,
        values,
        function(err: mysql.IError, result: any) {
        connection.destroy();
        if (err) {
          console.log("[DB]\tQuery Error: "+err)
          console.log("[DB]\tRunning Query: "+query)
          console.log("[DB]\tWith Values: "+values)
          deferred.reject(error);
        } else {
          deferred.resolve(result);
        }
      })
    }
  })
  return deferred.promise;
};

function makeTransactionFromQueryStrings(rgstr: string[]) {
   var deferred = Q.defer();
   var rgqry: Query[] = []
   for (var istr = 0; istr < rgstr.length; istr++) {
      rgqry.push(new Query(rgstr[istr]))
   }
   makeTransaction(rgqry)
   .then(function (success:boolean)
     {
       if (success) deferred.resolve(true)
     });
   return deferred.promise;
}

export function makeTransaction(queryArray: Query[])
{
  var deferred = Q.defer();
  if (queryArray.length === 0)
     deferred.resolve([])
  
  function individualQuery(connection:any, i:any, callback:any)
  {
     // Must happen synchronously, so nest callbacks recursively!
     connection.query(queryArray[i].strQuery, queryArray[i].values, function(err:any, result:any)
     {
        if (err)
        {
          console.error("[DB]\tError performing query: " + queryArray[i].strQuery)
          console.error("[DB]\tQuery Error: "+err)
          connection.rollback()
          console.log("[DB]\tThe transaction has been rolled back. No database changes were made.")
          connection.destroy()
          deferred.reject(err)
        }
        else
        {
          // Now, move on to next query, if any. If none, call the callback with results from last query.
          if (i + 1 < queryArray.length)
             individualQuery(connection, i+1, callback)
          else
             callback(result)
        }
     })
  }

  //Now, actually begin the connection and the transaction
  pool.getConnection(function(error: mysql.IError, connection: mysql.IConnection)
  {
    if (error)
    {
      console.log("[DB]\tDB Connect Error: "+error);
      connection.destroy()
      deferred.reject(error)
    } else {
      connection.beginTransaction(function(err:any)
      {
        if (err)
        {
          console.error("[DB]\tError beginning transaction: "+err);
          connection.destroy()
          deferred.reject(err);
        } else {
          individualQuery(connection, 0, function(lastResult:any)
          {
            //Done with all queries
            connection.commit(function(err: mysql.IError)
            {
              connection.destroy()
              if (err)
              {
                console.error("[DB]\tError committing transaction: "+err);
                deferred.reject(err);
              } else {
                deferred.resolve(lastResult)
              }
            })
          })
        }
      })
    }
  })
  return deferred.promise;
}

export function done()
{
  console.log('[DB]\tShutting down MySQL connections...');
  pool.end();
}

export function escape(str: string) : string
{
   return mysql.escape(str);
}

//Escapes queries for LIKE queries
export function likeEscape(query: string) : string
{
  return query.replace("%","\\%").replace("_","\\_").replace("'", "''")
}


//Compares version compare strings
//  v1 == v2: 0
//  v1  > v2: 1
//  v1  < v2: -1
function versionCompare(v1:string, v2:string) {
  var v1parts:any = v1.split('.')
  var v2parts:any = v2.split('.')

  //Make 1.0.0.0.0 == 1.0
  while (v1parts.length < v2parts.length) v1parts.push('0')
  while (v2parts.length < v1parts.length) v2parts.push('0')

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
  // console.log("Preparing to connect to AWS")
  // console.log("Connection Pool:\n")
  // console.log(pool)
  console.log("\n")
  console.log("[DB]\tChecking database version...");
  makeQuery("SELECT `value` FROM `db_info` WHERE `key`='framework_version'", null)
    .then(function(result:any[]) {
    if (result.length < 1)
    {
      console.error("Missing record in db_info table. Database updates will not be automatic.")
      console.error("Please set up the database from the init file in the #database channel on Slack.")
    }
    else
    {
      updateDatabase(result[0].value)
    }
  });
}

function updateDatabase(fwVersion: string)
{
  var dbUpdates = [
    {
      "version" : "0.0.1",
      "queries" : [
        `CREATE TABLE db_info (
         id int(10) unsigned NOT NULL AUTO_INCREMENT,
         key varchar(255) NOT NULL,
         value varchar(255) NOT NULL,
         PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`
      ]
    },
  ];

  //Check min database version
  if (versionCompare(fwVersion, dbUpdates[0].version) == -1)
  {
    console.error("[DB]\tYour database is too out-of-date for automatic updates. "+
      "Please run mysql/yollerdb-setup.sql to manually update the database.");
    done();
    pool = null;
    throw "Out-of-date DB";
  } else if (versionCompare(fwVersion, dbUpdates[dbUpdates.length - 1].version) == 1)
  {
    console.error("[DB]\tWARNING: Your database is too new for this version of the website. " +
      "Please update to the latest commit, or unexpected behavior may occur.");
  }
  var queriesNeeded:any = [];
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
    console.log("[DB]\tUpdating database from "+fwVersion+" to "+latestVersion + ". This may take a few seconds...");
    queriesNeeded.push("UPDATE `db_info` SET `value`='"+latestVersion+"' WHERE `key`='framework_version'");
    makeTransactionFromQueryStrings(queriesNeeded).then(function()
    {
      console.log("[DB]\tUpdate to "+latestVersion+" complete!");
    });
  } else {
    console.log("[DB]\tYou're running YollerDB® v"+fwVersion +" and ready to go!");
  }
}
