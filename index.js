"use strict";

var URL = require("url");
var Animator = require("blick");
var History = require("./history");

var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Main = require("./main.html");
var Attention = require("./attention.js");
var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.attention = new Attention();
scope.history = new History(window);
scope.main = new Main(document.documentElement, scope);
scope.history.handler = scope.main;

var documents = {};
function collect(document, documents) {
    if (!document.head.slug) {
        return;
    }
    if (documents[document.head.slug]) {
        return;
    }
    documents[document.head.slug] = document;
    document.head.see.forEach(function (link) {
        collect(link.value, documents);
    });
}
collect(require("./index.yaml"), documents);

scope.main.documents = documents;
scope.history.update();
scope.main.focus();

