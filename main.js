'use strict';

module.exports = Main;

function Main() {
}

Object.defineProperty(Main.prototype, "value", {
    get: function get() {
    },
    set: function set(document) {
        this.pages.navigate(document, -1);
    }
});

Main.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.pages = scope.components.pages;
    } else if (id === "pages:iteration") {
        scope.components.page.value = component.value;
        scope.components.page.navigationIndex = component.index;
        scope.components.page.navigator = scope.components.pages;
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
