"use strict";

var DirectionEventTranslator = require("./direction-event-translator");

module.exports = List;

function List(body, scope) {
    this.navigator = null;
    this.optionsComponent = null;
    this.activeIndex = null;
    this.activeIteration = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
}

Object.defineProperty(List.prototype, "options", {
    set: function set(options) {
        this.optionsComponent.value = options;
    },
    get: function get() {
        return this.optionsComponent.value;
    }
});

List.prototype.add = function add(component, id, scope) {
    if (id === "this") {
        this.optionsComponent = scope.components.options;
    } else if (id === "options:iteration") {
        scope.components.optionLink.addEventListener("click", this);
        scope.components.optionLink.delegate = component;
    }
};

List.prototype.handleEvent = function handleEvent(event) {
    if (event.type === "click") {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.delegate) {
            return this.navigator.navigate(event.target.delegate.value.value);
        }
    }
};

List.prototype.handleEscape = function handleEscape(event) {
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
};

List.prototype.handleEnter = function handleEnter(event) {
    if (this.activeIteration) {
        this.navigator.navigate(this.activeIteration.value.value);
    }
};

List.prototype.activateIteration = function activateIteration(iteration) {
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
    var optionLink = iteration.scope.components.optionLink;
    optionLink.classList.add("optionActive");
    this.activeIteration = iteration;
};

List.prototype.deactivateIteration = function deactivateIteration(iteration) {
    var optionLink = iteration.scope.components.optionLink;
    optionLink.classList.remove("optionActive");
    this.activeIteration = null;
};

List.prototype.handleDownCommand = function handleDownCommand(event) {
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index + 1) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.handleUpCommand = function handleUpCommand(event) {
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index - 1 + iterations.length) % iterations.length;
        this.activateIteration(iterations[index]);
    } else {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.focus = function focus() {
    this.directionEventTranslator.focus();
    var iterations = this.optionsComponent.iterations;
    if (!this.activeIteration && iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.blur = function blur() {
    this.directionEventTranslator.blur();
};
