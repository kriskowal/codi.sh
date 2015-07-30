'use strict';

module.exports = Main;

function Main() {
}

Object.defineProperty(Main.prototype, "documents", {
    get: function get() {
    },
    set: function set(_documents) {
        this._documents = _documents;
    }
});

Main.prototype.setPath = function setPath(path) {
    this.pages.setPath(path);
};

Main.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.pages = scope.components.pages;
    } else if (id === "pages:iteration") {
        var document = this._documents[component.value];
        scope.components.page.value = document;
        scope.components.page.navigationIndex = component.index;
        scope.components.page.navigator = scope.components.pages;
        component.path = document.head.slug;
        component.focus = focusIteration;
        component.handleEnter = handleEnterIteration;
        component.focusDelegate = scope.components.page;
    }
};

function focusIteration() {
    this.focusDelegate.focus();
}

function handleEnterIteration() {
    this.focusDelegate.handleEnter();
}

Main.prototype.focus = function focus() {
    this.pages.focus();
};
