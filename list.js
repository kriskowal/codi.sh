"use strict";

var DirectionEventTranslator = require("./direction-event-translator");

module.exports = List;

function List(body, scope) {
    this.navigator = null;
    this.optionsComponent = null;
    this.optionsElement = null;
    this.activeIndex = null;
    this.activeIteration = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.attention = scope.attention;
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
        this.optionsElement = scope.components.optionsList;
    } else if (id === "options:iteration") {
        scope.components.optionLink.addEventListener("click", this);
        scope.components.optionLink.setAttribute("href", "");
        scope.components.optionLink.component = component;
    }
};

List.prototype.handleEvent = function handleEvent(event) {
    if (event.type === "click") {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.component) {
            this.activateIteration(event.target.component);
            return this.navigator.navigate(event.target.component.value);
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
        this.navigator.navigate(this.activeIteration.value);
    }
};

List.prototype.handleRight = function handleRight(event) {
    this.handleEnter(event);
};

List.prototype.activateIteration = function activateIteration(iteration) {
    if (!iteration) {
        throw new Error("Can't activate null iteration");
    }
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
    var optionLink = iteration.scope.components.optionLink;
    optionLink.classList.add("optionActive");
    this.activeIteration = iteration;
    this.navigator.activate(this.activeIteration.value);
};

List.prototype.deactivateIteration = function deactivateIteration(iteration) {
    this.navigator.deactivate(iteration.value);
    var optionLink = iteration.scope.components.optionLink;
    optionLink.classList.remove("optionActive");
    this.activeIteration = null;
};

List.prototype.handleDown = function handleDown(event) {
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index + 1) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.handleUp = function handleUp(event) {
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index - 1 + iterations.length) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.scrollIntoView = function scollIntoView() {
    this.optionsElement.scrollIntoView();
};

List.prototype.focus = function focus() {
    this.attention.take(this);
    this.directionEventTranslator.focus();
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        this.activeIteration.scope.components.optionLink.classList.add("optionActive");
    }
};

List.prototype.blur = function blur() {
    this.directionEventTranslator.blur();
    if (this.activeIteration) {
        this.activeIteration.scope.components.optionLink.classList.remove("optionActive");
    }
};
