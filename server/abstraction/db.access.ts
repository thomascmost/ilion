//db.ts

//Dependencies
import * as Q from 'q';
import * as mysql from 'mysql';
import strings from './../strings' 

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

function updateDatabase(fwVersion:string)
{
  var dbUpdates = [
    {
      "version" : "1.0.1",
      "queries" : [
        "CREATE TABLE `pending_ghost_follow` ( " +
          "`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
          "`user_id` int(10) UNSIGNED NOT NULL, " +
          "`active_id` int(10) UNSIGNED NOT NULL, " +
          "`code` char(50) NOT NULL, " +
          "FOREIGN KEY (`user_id`) REFERENCES `user` (`id`), " +
          "FOREIGN KEY (`active_id`) REFERENCES `active` (`id`) " +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
      ]
    },
    {
      "version" : "1.0.2",
      "queries" : [
        "alter table sent_email change column `subject` `subject` varchar(256) NOT NULL"
      ]
    },
    {
      "version" : "1.0.3",
      "queries" : [
        "INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Staged Reading', 'Staged Readings', 'rdng');"
      ]
    },
    {
      "version" : "1.0.4",
      "queries" : [
         "DROP TRIGGER IF EXISTS yoller_occ_after_update;",
         "DROP TRIGGER IF EXISTS yoller_occ_after_delete;",
      ]
    },
    {
      "version" : "1.1.1",
      "queries" : [
        "alter table section_active_role change column `order` `row_index` int unsigned NOT NULL DEFAULT 0"
      ]
    },
    {
      "version" : "1.2.0",
      "queries" : [
        "CREATE TABLE `bulletin` ( " +
    "`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
    "`name` varchar(255) NOT NULL, " +
    "`type_id` int unsigned NULL, " +
    "`description` TEXT NOT NULL, " +
    "`creator_id` int unsigned NOT NULL, " +
    "`created_datetime` DATETIME NOT NULL, " +
  "FOREIGN KEY (`type_id`) REFERENCES `yoller_type`(`id`) ON DELETE CASCADE ON UPDATE CASCADE, " +
  "FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE " +
");",


"CREATE TABLE `bulletin_role` ( " +
    "`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
    "`label` varchar(255) NOT NULL, " +
    "`role_id` int unsigned NOT NULL, " +
    "`bulletin_id` int unsigned NOT NULL, " +
  "FOREIGN KEY (`bulletin_id`) REFERENCES `bulletin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE, " +
  "FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE " +
");",

"CREATE TABLE `bulletin_response` ( " +
    "`id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
    "`user_id` int unsigned NOT NULL, " +
    "`datetime` DATETIME NOT NULL, " +
    "`bulletin_role_id` int unsigned NOT NULL, " +
    "FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE, " +
    "FOREIGN KEY (`bulletin_role_id`) REFERENCES `bulletin_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE " +
");"
      ]
    },
    {
      "version" : "1.2.1",
      "queries" : [
        "Alter Table `user` Modify `timezone` VARCHAR(44);"
      ]
    },
    {
      "version" : "1.9.3",
      "queries" : [
        "ALTER TABLE `yoller_type` ADD `enabled` BIT DEFAULT 1;",
        "INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Concert', 'Concerts', 'ccrt');",
        "UPDATE `yoller_type` SET `enabled`=0 WHERE `short` in ('prty', 'scpt', 'inst', 'fest', 'mft', 'vid')"
      ]
    },
    {
      "version" : "2.0.0",
      "queries" : [
        "update yoller set cover_photo_id = profile_photo_id;"
      ]
    },
    {
      "version" : "2.0.1",
      "queries" : [
         "INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Lyrics', 2, 0, 0, 7), " +
         "('Composer', 2, 0, 0, 7), " +
         "('Book', 2, 0, 0, 7);"
      ]
    },
    {
      "version" : "2.0.3",
      "queries" : [
         "CREATE TABLE `project_draft` ( " +
           "`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
           "`user_id` int(10) UNSIGNED NOT NULL, " +
           "`project_id` int(10) UNSIGNED NULL, " +
           "`project_json` TEXT NOT NULL, " +
           "`created` timestamp DEFAULT CURRENT_TIMESTAMP, " +
           "`updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
           "`title` varchar(175) NULL, " +
           "`type_id` int unsigned DEFAULT NULL, " +
           "FOREIGN KEY (`type_id`) REFERENCES `yoller_type` (`id`) ON UPDATE CASCADE ON DELETE SET NULL, " +
           "FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE, " +
           "FOREIGN KEY (`project_id`) REFERENCES `yoller` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE" +
       ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
      ]
    },
    {
      "version" : "2.0.4",
      "queries" : [
         "alter table section_active_role add `role_index` smallint NOT NULL DEFAULT 0",
         "alter table section_active_role add `active_index` smallint NOT NULL DEFAULT 0"
      ]
    },
    {
      "version" : "2.1.1",
      "queries" : [
         "alter table `venue` add `owner_id` int unsigned NULL;",
         "alter table `venue` add `f_private` tinyint NOT NULL DEFAULT 0;",
         "alter table `venue` add `address_line_1` varchar(128) NOT NULL DEFAULT '';",
         "alter table `venue` add `address_line_2` varchar(128) NOT NULL DEFAULT '';",
         "alter table `venue` add `city` varchar(50) NOT NULL DEFAULT '';",
         "alter table `venue` add `province` varchar(50) NOT NULL DEFAULT '';",
         "alter table `venue` add `postal_code` int NOT NULL DEFAULT 0;",
         "alter table `venue` add `country` varchar(50) NOT NULL DEFAULT '';",
         "alter table `venue` add `additional_info` TEXT NULL;",
         "alter table `venue` add FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`);"
      ]
    },
    {
      "version" : "2.2.0",
      "queries" : [
        "INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('General Event', 'General Events', 'gnrl');"
      ]
    },
    {
      "version" : "2.2.1",
      "queries" : [
        "UPDATE `yoller_type` SET `label`='Event', `plural`='Events' where `short`='gnrl';"
      ]
    },
    {
      "version" : "2.2.2",
      "queries" : [
         "INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Drag Show', 'Drag Shows', 'drag');"
      ]
    },
    {
      "version" : "2.2.3",
      "queries" : [
         "alter table `venue` change column `postal_code` `postal_code` varchar(12) NULL;"
      ]
    },
    {
      "version" : "2.2.4",
      "queries" : [
         "DELETE FROM `project_draft`;",
         "ALTER TABLE `project_draft` ADD CONSTRAINT U_Project_Draft UNIQUE (`project_id`);"
      ]
    },
    {
      "version" : "2.2.5",
      "queries" : [
         "DELETE FROM `project_draft`;",
         "ALTER TABLE `project_draft` ADD CONSTRAINT U_Project_Draft_2 UNIQUE (`title`, `type_id`, `user_id`);"
      ]
    },
    {
      "version" : "2.2.6",
      "queries" : [
         "UPDATE `venue` SET `postal_code` = null WHERE `postal_code` = 0;"
      ]
   },
   {
      "version" : "2.2.7",
      "queries" : [
         "DROP TABLE `yoller_occurrence_rsvp`;",
         "CREATE TABLE `rsvp` ( " +
           "`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
           "`user_id` int(10) UNSIGNED NOT NULL, " +
           "`project_id` int(10) UNSIGNED NOT NULL, " +
           "`occurrence_id` int(10) UNSIGNED NULL, " +
           "`attested` tinyint NOT NULL DEFAULT 0, " +
           "`confirmed_by_geolocation` tinyint NOT NULL DEFAULT 0, " +
           "`created` timestamp DEFAULT CURRENT_TIMESTAMP, " +
           "`updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
           "FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE, " +
           "FOREIGN KEY (`project_id`) REFERENCES `yoller` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE, " +
           "FOREIGN KEY (`occurrence_id`) REFERENCES `yoller_occurrence` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE" +
       ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
      ]
   },
   {
      "version" : "2.2.8",
      "queries" : [
         "INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES " +
         "('Door', 2, 0, 0, 2), " +
         "('DJ', 2, 0, 0, 3), " +
         "('Bartender', 2, 0, 0, 2);",
         "UPDATE `yoller_type` SET `label`='Drag', `plural`='Drag Shows' where `short`='drag';"
      ],
   },
   {
      "version": "2.3.1",
      "queries": [
         "DROP TABLE IF EXISTS `user_yoller_hidefromfeed`;",
         "DROP TABLE IF EXISTS `user_project_hidden`;",

         "CREATE TABLE user_project_hidden ( " +
            "`id` int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "`user_id` int UNSIGNED NOT NULL, " +
            "`project_id` int UNSIGNED NOT NULL, " +
            "CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE, " +
            "CONSTRAINT FOREIGN KEY (`project_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE " +
         ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
      ]
   },
   {
      "version": "2.3.2",
      "queries": [
         "DROP TABLE IF EXISTS `user_project_starred`;",

         "CREATE TABLE user_project_starred ( " +
            "`id` int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "`user_id` int UNSIGNED NOT NULL, " +
            "`project_id` int UNSIGNED NOT NULL, " +
            "CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE, " +
            "CONSTRAINT FOREIGN KEY (`project_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE " +
         ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
      ]
   },
   {
     "version" : "2.3.3",
     "queries" : [
         "DROP TABLE `rsvp`;",
         "CREATE TABLE `rsvp` ( " +
         "`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
         "`user_id` int(10) UNSIGNED NOT NULL, " +
         "`occurrence_id` int(10) UNSIGNED NOT NULL, " +
         "`attested` tinyint NOT NULL DEFAULT 0, " +
         "`confirmed_by_geolocation` tinyint NOT NULL DEFAULT 0, " +
         "`created` timestamp DEFAULT CURRENT_TIMESTAMP, " +
         "`updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
         "FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE, " +
         "FOREIGN KEY (`occurrence_id`) REFERENCES `yoller_occurrence` (`id`)  ON UPDATE CASCADE ON DELETE CASCADE" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
     ]
   },
   {
     "version" : "2.5.0",
     "queries" : [
        `CREATE TABLE house (
         id int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
         name varchar(128) NOT NULL DEFAULT 'Standard Configuration',
         status tinyint NOT NULL DEFAULT 0,
         venue_id int(10) UNSIGNED NOT NULL,
         user_created_by int(10) UNSIGNED NOT NULL,
         created timestamp DEFAULT CURRENT_TIMESTAMP,
         updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         CONSTRAINT venue_house_name UNIQUE (venue_id, name),
         FOREIGN KEY (user_created_by) REFERENCES user (id)  ON UPDATE CASCADE ON DELETE CASCADE,
         FOREIGN KEY (venue_id) REFERENCES venue (id)  ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

      `CREATE TABLE house_tier (
         id int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
         name varchar(128) NOT NULL DEFAULT 'General Admission',
         rank tinyint NOT NULL DEFAULT 0,
         house_id int(10) UNSIGNED NOT NULL,
         seat_count int(10) UNSIGNED NOT NULL,
         created timestamp DEFAULT CURRENT_TIMESTAMP,
         updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         CONSTRAINT house_tier_name UNIQUE (house_id, name),
         FOREIGN KEY (house_id) REFERENCES house (id)  ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`,

      `ALTER TABLE yoller_occurrence ADD COLUMN house_id int(10) UNSIGNED NULL;`,
      `ALTER TABLE yoller_occurrence ADD FOREIGN KEY (house_id) REFERENCES house (id) ON UPDATE CASCADE ON DELETE CASCADE;`
     ]
   }
    // Add a useful function and procedure for creating sample venues.
    // {
    //   'version' : '1.2.2',
    //   'queries' : [
    //     "DROP FUNCTION IF EXISTS `venueWord`;",
    //     "CREATE FUNCTION `venueWord` () RETURNS varchar(100) NOT DETERMINISTIC " +
    //     "   BEGIN " +
    //     "   DECLARE word varchar(100); " +
    //     "   SET word = ELT(0.5 + RAND() * 78, 'Apple', 'Banana', 'Cherry', 'Date', 'Eggplant', 'Fig', 'Grape', 'Honeydew', 'Ice cream', 'Jelly', 'Kava', 'Lemon', " +
    //     "                  'Melon', 'Nut', 'Orange', 'Persimmon', 'Quiet', 'Raspberry', 'Salt', 'Topping', 'Umami', 'Viceroy', 'Wonder', 'Xtra', 'Yum', 'Zipper', " +
    //     "                  'Austria', 'Banbury Lane', 'California', 'Denmark', 'England', 'Finland', 'Greece', 'Hawaii', 'Iceland', 'Jerusalem', 'Koloa', " +
    //     "                  'Luxembourg', 'Manchester', 'Nottingham', 'Oregon', 'Pacific', 'Queensland', 'Rotenburg', 'Silesia', 'Tuvalu', 'Uraguay', 'Venice', " +
    //     "                  'Washington', 'Xanadu', 'Yellowstone', 'Zealand', " +
    //     "                  'Area', 'Brook', 'Court', 'Deal', 'Entry', 'Fan', 'Grove', 'Headway', 'Interstate', 'Jog', 'Kitchen', 'Lane', 'Motorway', 'Neville', " +
    //     "                  'O-ring', 'Place', 'Quentin', 'Road', 'Street', 'Tunnel', 'Underground', 'Vale', 'Waterway', 'X-ing', 'Yesterday', 'Zoo'); " +
    //     "   RETURN word; " +
    //     "   END ", 
   
    //     "DROP PROCEDURE IF EXISTS `createVenues`; ",

    //     "CREATE PROCEDURE `createVenues` (IN numVenues INT) " +
    //     "BEGIN " +
    //     "   DECLARE name varchar(60); " +
    //     "   DECLARE description varchar(80); " +
    //     "   DECLARE popularity, latitude, longitude INT; " +
    //     "   DECLARE timezone varchar(44); " +
    //     "   WHILE numVenues > 0 DO " +
    //     "      SET name = CONCAT(venueWord(), ' ', venueWord()); " +
    //     "      SET description = CONCAT(randWord(8), ' ', randWord(8), ' ', randWord(8)); " +
    //     "      SET popularity = randNumber(1, 5); " +
    //     "      SET latitude = randNumber(25, 50); " +
    //     "      SET longitude = randNumber(-100, -40); " +
    //     "      SET timezone = 'America/New_York'; " +
    //     "      INSERT INTO `venue` (`popularity`, `name`, `description`, `latitude`, `longitude`, `timezone`) VALUES " +
    //     "                          (popularity, name, description, latitude, longitude, timezone); " +
    //     "      SET numVenues = numVenues - 1; " +
    //     "   END WHILE; " +
    //     "END "
    //   ]
    // }
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
