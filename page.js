"use strict";

var Identifier = require("system/identifier");
var URL = require('url');

module.exports = Page;

function Page(body, scope) {
    this.navigator = null;
    this.navigationIndex = null;
    this.index = scope.index;
}

Object.defineProperty(Page.prototype, "value", {
    get: function get() {
    },
    set: function set(document) {
        this.see.options = document.head.see;
        this.body.value = document.body;
    }
});

Page.prototype.hookup = function (id, component, scope) {
    if (id === "this") {
        this.see = scope.components.see;
        this.see.navigator = this;
        this.body = scope.components.body;
    } else if (id === "see:iteration") {
        scope.components.label.value = component.value.label;
    }
};

Page.prototype.navigate = function navigate(document) {
    var slug = document.value.head.slug;
    return this.navigator.navigate(slug, this.navigationIndex);
};

Page.prototype.activate = function (document) {
    var slug = document.value.head.slug;
    return this.navigator.activate(slug, this.navigationIndex);
};

Page.prototype.deactivate = function (document) {
};

Page.prototype.focus = function focus() {
    this.see.focus();
};

Page.prototype.handleEnter = function handleEnter() {
    this.see.handleEnter();
};

