"use strict";

var Identifier = require("system/identifier");

module.exports = Page;

function Page() {
    this.navigator = null;
    this.navigationIndex = null;
}

Object.defineProperty(Page.prototype, "value", {
    get: function get() {
    },
    set: function set(document) {
        this.see.options = document.head.see;
        this.body.value = document.body;
    }
});

Page.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.see = scope.components.see;
        this.see.navigator = this;
        this.body = scope.components.body;
    } else if (id === "see:iteration") {
        scope.components.label.value = component.value.label;
    }
};

Page.prototype.navigate = function navigate(value) {
    return this.navigator.navigate(value, this.navigationIndex);
};

Page.prototype.focus = function focus() {
    this.see.focus();
};

Page.prototype.handleEnter = function handleEnter() {
    this.see.handleEnter();
};
