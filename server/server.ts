/*

_________ _       _________ _______  _       
\__   __/( \      \__   __/(  ___  )( (    /|
   ) (   | (         ) (   | (   ) ||  \  ( |
   | |   | |         | |   | |   | ||   \ | |
   | |   | |         | |   | |   | || (\ \) |
   | |   | |         | |   | |   | || | \   |
___) (___| (____/\___) (___| (___) || )  \  |
\_______/(_______/\_______/(_______)|/    )_)


*/

// Import environment variables and config strings from .env
// These include AWS access keys and our JWT secret
if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
 }

// Register our custom path resolution (see tsconfig.json)
// require("module-alias/register");

// Import Express
import * as express from "express";
let router = express.Router();

// Import and add our globals
// import addGlobals from "./globals";
// addGlobals();

/////////////////////////////////////////////////////////////////////////////////////////////////
//
// Core Dependencies
//--------------------------------------------------------------------------------------TCMoore//
/////////////////////////////////////////////////////////////////////////////////////////////////

const domainMiddleware = require("express-domain-middleware");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
import * as passport from "passport";
const path = require("path");

const exphbs  = require("express-handlebars");

// force https
const sslRedirect = require("heroku-ssl-redirect");

import * as db from "./abstraction/db.access";
db.checkDatabaseVersion();

// import { dataSafety } from "./data-safety.middleware";

//Initializes the Express application
var app = express();
if (process.env.NODE_ENV === "production") {
  app.use(sslRedirect());
}

//configure Passport
import passportConfig from "./abstraction/passport.abst";
passportConfig(passport);

/////////////////////////////////////////////////////////////////////////////////////////////////
//
// Express Middleware
//--------------------------------------------------------------------------------------TCMoore//
/////////////////////////////////////////////////////////////////////////////////////////////////

app.use(express.static(path.join(__dirname, "../../public")));

app.use(cookieParser()); //read cookies (needed for passport auth)
//JSON parser
app.use(bodyParser.json());

//Creates a new domain for each request !!!Must come before api routes!
app.use(domainMiddleware);

/////////////////////////////////////////////////////////////////////////////////////////////////
//
// Routing
//--------------------------------------------------------------------------------------TCMoore//
/////////////////////////////////////////////////////////////////////////////////////////////////

//requiring sessions as a function so that we can pass the passport object as a param
import apiCharacters from "./api/characters.api";
import apiScenes from "./api/scenes.api";
import apiProjects from "./api/projects.api";
// import apiAuth from "./api/auth.api";
import apiSessions from "./api/sessions.api";
// import apiUsers from "./api/users.api";

app.use("/api/characters", apiCharacters());
app.use("/api/scenes", apiScenes());
app.use("/api/projects", apiProjects());
// app.use("/api/auth",          apiAuth());
app.use("/api/sessions",      apiSessions(passport));
// app.use("/api/users",         apiUsers());

/////////////////////////////////////////////////////////////////////////////////////////////////
//
// Post-Routing Middleware
//--------------------------------------------------------------------------------------TCMoore//
/////////////////////////////////////////////////////////////////////////////////////////////////

//Sanitizing data before sending it down
//Called by next() in the routes
//Iterates recursively through data object and sanitizes all strings.
//--------------------------------------------------------------------------------------TCMoore//
// app.use(dataSafety);

// Main Route
//--------------------------------------------------------------------------------------TCMoore//
app.get("*", function response(req: express.Request, res: express.Response) {
   res.sendFile(path.join(__dirname, "../../public/index.html"));
});

//Log the domain id, req, and error to the console
app.use(function errorHandler(err: express.Errback, req: express.Request, res: express.Response, next: express.NextFunction) {
  if (process.domain)
  {
    console.log("error on request %s %s: %s", req.method, req.url, err);
  }
  else
  {
     console.log("Error occurred outside of a request: %s", err);
  }
  next(err);
});

//Log the error to Stackify
if (process.env.NODE_ENV === "production") {
  /*
  var winston = require('winston');
  var stackify = require('stackify-logger');
  stackify.start({apiKey: strings.STACKIFY_KEY, env: 'dev', debug: true});
  require('winston-stackify').Stackify;
  winston.add(winston.transports.Stackify, {storage : stackify});
  */
}

var port = process.env.PORT || 9657;

app.listen(port, function ()
{
   console.log("Node running in environment: " + process.env.NODE_ENV || "(No Environment Set)");
   console.log("Server listening on:", port);
   console.log("Serving path: " + path.join(__dirname, "../../public"));
});