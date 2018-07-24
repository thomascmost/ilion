/// <reference path="../../shared/assert.d.ts" />

import "zone.js";
import "reflect-metadata";
import { Assert } from "@ilion/shared/assert";
(<any>window).Assert = Assert;

import "../app/sass/index.scss";

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app.module";

import {enableProdMode} from "@angular/core";

if (process.env.ENV === "production") {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);