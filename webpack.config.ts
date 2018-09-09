const ENV = process.env.NODE_ENV = process.env.ENV = "production";

var path = require("path");
var BrowserSyncPlugin = require("browser-sync-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackBar = require("webpackbar");
var WebpackBuildLogger = require("webpack-build-logger");
var TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
var bourbon = require("bourbon").includePaths;
var neat = require("bourbon-neat").includePaths;
var stylepaths = bourbon.concat(neat);

let webpackBuildLogger = new WebpackBuildLogger({
   logEnabled: true, // false - default 
   // logger: (counter, time, scripts, warnings) => { // by default - console.log will be used
   //   customLogger(counter, time, scripts, warnings)
   // }
 });

import * as webpack from "webpack";

var productionConfig = {
   context: __dirname, // to automatically find tsconfig.json
   resolve: {
      alias: {
         moment: "moment/moment.js"
      },
      extensions: [".ts", ".tsx", ".scss", ".css", ".js"],
      plugins: [
         new TsConfigPathsPlugin()
      ]
   },
   mode: "production",
   devtool: "source-map",
   plugins: [
      new webpack.DefinePlugin({
         "process.env": {
         ENV: JSON.stringify(ENV)
         }
      }),
      new webpack.ContextReplacementPlugin(
         /@angular/,
         path.resolve(__dirname, "../web")
         ),
         new CopyWebpackPlugin([
            { from: "web/static" }
         ]),
         new HtmlWebpackPlugin({
            title: "Ilion",
            inject: "body",
            hash: true,
            template: "web/index.html"
         }),
         new ExtractTextPlugin("app.css")
   ],

   entry: [
            "./web/polyfills.ts",
            "./web/app/main.ts"
         ],
   output: {
      path: path.resolve(__dirname + "/public/"),
      filename: "bundle.js"
   },
   module: {
      rules: [
         {
            test: /\.(ts|tsx)?$/, 			
            exclude: /node_modules/,
            loader: "ts-loader"
         },
         {
            test: /\.(scss|css)$/,
            loader: ExtractTextPlugin.extract({
                  use: [{
                      loader: "css-loader"
                  }, {
                      loader: "sass-loader",
                      options: {
                          includePaths: stylepaths
                      }
                  }]
                })
         }
      ]
   }
};

module.exports = function(env: {production: boolean}) {
  if (!env || !env.production) {
   productionConfig.mode = "development";
   productionConfig.plugins = productionConfig.plugins.concat(
      new WebpackBar(),
      webpackBuildLogger,
      new BrowserSyncPlugin({
        // browse to http://localhost:3000/ during development, 
        // ./public directory is being served 
        host: "localhost",
        port: 3000,
        proxy: "http://localhost:9657/"
      }));
   return productionConfig;
  }
  else {
    console.log("Running webpack for production");
    productionConfig.mode = "production";
    return productionConfig;
  }
};