"use strict";
var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Main = require("./main.html");
var document = new Document(window.document.body);
var scope = new Scope();
scope.main = new Main(document.documentElement, scope);
scope.main.value = require("./index.yaml");
