var gulp = require("gulp");
var path = require("path");
var expectFile = require("gulp-expect-file");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");

var webpack = require("webpack");
var webpackStream = require("webpack-stream");
const WebpackBar = require("webpackbar");
var WebpackBuildLogger = require("webpack-build-logger");
var sass = require("gulp-sass");
var nodemon = require("gulp-nodemon");
var del = require("del");
var rename = require("gulp-rename");
var inject = require("gulp-inject-string");
var TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

var remAssert = require("./rem-assert");
   
let webpackBuildLogger = new WebpackBuildLogger({
    logEnabled: true, // false - default 
    // logger: (counter, time, scripts, warnings) => { // by default - console.log will be used
    //   customLogger(counter, time, scripts, warnings)
    // }
  });

var browserSync = require("browser-sync").create();

/*-----------------------------------------------------------------------------------------------------------
   safeSrc

Uses gulp.src to read 'files' from disk, then pipes them to gulp-expect-file to ensure that they actually
exist. Returns the result for further piping.

gulp-expect-file logs an error to the console if a passed file name does not exist. Thus, this routine should
be used throughout this file, in place of gulp.src, to ensure that we are successfully finding all the files
that we're asking for.

------------------------------------------------------------------------------------------------ CGMoore --*/
gulp.safeSrc = function (files: string)
   {
   return (gulp.src(files).pipe(expectFile(files)));
   };


// webpack options structure
var wpOpts =
   {
   mode: "development",
   watch: false,
   context: __dirname, // to automatically find tsconfig.json
   resolve:
      {
      alias:
         {
         moment: "moment/moment.js"
         },
      extensions: [".scss", ".ts", ".js"],
      plugins: [
          new TsConfigPathsPlugin()
      ]
      },
   output:
      {
      filename: "bundle.js"
      },
   plugins: [
            new WebpackBar(),
            webpackBuildLogger,
            // new webpack.ContextReplacementPlugin(
            // /@angular/,
            // path.resolve(__dirname, "../web")),
            ],
   devtool: "source-map",
   module:
      {
      rules: [
         {
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: "awesome-typescript-loader"
         },
         {
         test: /\.scss$/,
         loader: "ignore-loader"
         }
         ]
      }
    };

/*-----------------------------------------------------------------------------------------------------------
   buildClientJS

Performs compilation of client-side TypeScript to JavaScript. fWatch specifies whether webpack should start
watching for (and automatically reloading) source code changes.

------------------------------------------------------------------------------------------------ CGMoore --*/
gulp.buildClientJS = function (fWatch: boolean)
   {
   console.log("\x1b[1m", "   WP   ] Starting async webpack-stream")
   var strRootFile: string;
   if (process.env.NODE_ENV === "production")
      {
      console.log("This is a Production build.");
      strRootFile = "web/ProdBuild/main.ts";
      }
   else
      {
      console.log("This is a Debug build.");
      strRootFile = "web/app/main.ts";
      }
   wpOpts.watch = fWatch;
   return (gulp.safeSrc(strRootFile)
               .pipe(sourcemaps.init())
               .pipe(webpackStream(wpOpts, require("webpack")))
               .pipe(sourcemaps.write())
               .pipe(gulp.dest("public")))
   };


/****************************************/
/* Please keep gulp tasks alphabetized. */
/****************************************/

// Background Processes
gulp.task("bg", function(cb: any)
{
   var exec = require("child_process").exec;
   exec("tsc -p ./bg-processes", function (err: any, stdout: any, stderr: any)
      {
      console.log(stdout);
      console.log(stderr);
      console.log("Background processes compiled!")
      cb(err);
      });

});

// BrowserSync
gulp.task("browser-sync", function() {
    browserSync.init({
        proxy: "localhost:9657",
        browser: ["chrome"]
    });
});

// Build the entire product
gulp.task("build", ["client", "server", "bg"], function ()
{
	//del('../Build/node_modules/**/test/**/*', {force:true}) //won't work on an initial build, but on subsequent calls should operate correctly
});

//Removes test directories from node_modules.
//Must be run separately on a new install because gulp-install runs asynchronously
gulp.task("build:del", function ()
{
	//del('../Build/node_modules/**/test/**/*', {force:true})
});

//Cleans build directory
//Only sure way to remove files
gulp.task("clean", function()
{
	del([
            "dist/**/*",
            "public/**/*"
		], {force:true})
});

// Build the client.
gulp.task("client", ["css", "html", "img", "js"], function ()
{
});

// Construct screen.css from SASS
gulp.task("css", function ()
{
	gulp.safeSrc("web/app/sass/index.scss")
	.pipe(sourcemaps.init())
    .pipe(plumber({
     errorHandler: function (err: any) {
           console.log("\x1b[1m","SASS Error in file:")
           console.log("\x1b[31m", err.file)
           console.log("\x1b[1m","Message: " + err.message)
           this.emit("end");
        }
    }))
    .pipe(sass({
        errLogToConsole: true
    }))
    .pipe(sourcemaps.write())
    .pipe(rename("app.css"))
	.pipe(gulp.dest("public"))
	.pipe(browserSync.stream());
});

//Runs nodemon server, will restart on server changes
gulp.task("dev:server", function ()
{
	nodemon({
		script: "dist/server/server.js",
		ext: "js",
		watch: ["dist/server/server.js"]
	})
});

gulp.task("nodemon", function ()
{
    nodemon({
        script: "dist/server/server.js"
    })
} );

// html templates
gulp.task("html", function()
{
    gulp.safeSrc("web/index.html")
        .pipe(inject.after("<!-- CSS -->", "\n<link rel=\"stylesheet\" href=\"app.css\" />\n"))
        .pipe(inject.after("<!-- JS -->", "\n<script type=\"text/javascript\" src=\"bundle.js\" ></script>\n"))
	.pipe(gulp.dest("public"))

	// Weirdness with piping directly from the line above ("gulp.dest") into browserSync forces us to
	// break this apart into two separate gulp statements. If we do the direct pipe, then gulp only
	// copies the first six files out of the templates/yforms directory into the build directory.
	gulp.safeSrc("public")
	.pipe(browserSync.stream())
});

// images
gulp.task("img", function ()
{
   gulp.safeSrc(["web/static/**/*"])
   .pipe(gulp.dest("public"))
});

// Client-side javascript to single js file.
gulp.task("js", ["pre-process"], function ()
{
    gulp.buildClientJS(true)
        .pipe(browserSync.stream())
});


// Pre-processes client-side TypeScript. In production builds, this consists of removing Asserts from the
// source code. In debug builds, this is a no-op.
gulp.task("pre-process", function()
   {
   if (process.env.NODE_ENV === "production")
      {
      return (gulp.safeSrc("web/app/**/*.ts")
         .pipe(remAssert())
         .pipe(gulp.dest("web/ProdBuild")));
      }
   });

// Client-side javascript to single js file without starting a "watch" at the end.
gulp.task("tsclient", ["pre-process"], function ()
{
    console.log("\x1b[1m", "   WP   ] Webpack will compile once.");
    gulp.buildClientJS(false);
});

gulp.task("tsClient", ["tsclient"]);

// Build the server
gulp.task("server", function(cb: any)
{
    console.log("Compiling server by running 'tsc' directly...");
    var exec = require("child_process").exec;
    exec("tsc -p ./server", function (err: any, stdout: any, stderr: any)
      {
        console.log(stdout);
        console.log(stderr);
        console.log("Server compiled!");
        cb(err);
      });
});

//sets watches on client/server files, starts gulp nodemon task
gulp.task("run", ["client"], function ()
{
   gulp.start("watchclient");
   gulp.start("watchserver");
   gulp.start("browser-sync");
});

gulp.task("watch", ["build"], function ()
{
   gulp.start("watchclient");
   gulp.watch(["server.js", "api/*.js", "modules/*.js", "modules/*.ts"], ["server"]);
});

//watches client files
gulp.task("watchclient", function ()
{
   gulp.watch("web/app/sass/**/*.scss", ["css"]);
   gulp.watch("web/static/**/*.*", ["img"]);

});

gulp.task("watchserver", ["server"], function ()
{
   gulp.watch(["server/**/*.ts", "shared/models/**/*.ts", "shared/util/**/*.ts"], ["server"]);
   gulp.start("dev:server");
});
