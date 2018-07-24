const ENV = process.env.NODE_ENV = process.env.ENV = "production";

var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

import * as webpack from "webpack";

var productionConfig = {
   context: __dirname, // to automatically find tsconfig.json
   resolve: {
      alias: {
         moment: "moment/moment.js"
      },
      extensions: [".scss", ".ts", ".js"],
      plugins: [
         new TsConfigPathsPlugin()
      ]
   },

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
            "./web/ProdBuild/main.ts"
         ],
   output: {
      path: path.resolve(__dirname + "/public/"),
      filename: "bundle.js"
   },
   module: {
      rules: [
         {
         test: /\.ts$/,
         exclude: /node_modules/,
         loader: "awesome-typescript-loader"
         },
         {
         test: /\.scss$/,
         loader: ExtractTextPlugin.extract({
               fallback: "style-loader", // The backup style loader
               use: ["css-loader?url=false", "sass-loader?url=false"]
            })
         }
      ]
   }
};

module.exports = function(env: {production: boolean}) {
  if (!env || !env.production) {
    console.log("-- Important --");
    console.log("Please use Gulp for development.");
    console.log("Exiting process...");
    process.exit(-1);
  }
  else {
    console.log("Running webpack for production");
    return productionConfig;
  }
};