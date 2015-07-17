"use strict";

var URL = require("url");
var HistoryState = require("history-state");

var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Main = require("./main.html");
var Attention = require("./attention.js");
var document = new Document(window.document.body);
var scope = new Scope();
scope.attention = new Attention();
scope.history = new HistoryState({hash: true});
scope.main = new Main(document.documentElement, scope);

var index = {};
function collect(document, index) {
    if (!document.head.slug) {
        return;
    }
    if (index[document.head.slug]) {
        return;
    }
    index[document.head.slug] = document;
    document.head.see.forEach(function (link) {
        collect(link.value, index);
    });
}
collect(require("./index.yaml"), index);

var hash = URL.parse(window.location.toString()).hash;
hash = hash && hash.slice(1);
if (hash && index[hash]) {
    scope.main.value = index[hash];
} else {
    scope.main.value = require("./index.yaml");
}

scope.main.focus();

