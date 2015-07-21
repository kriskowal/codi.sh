"use strict";

var DirectionEventTranslator = require("./direction-event-translator");

module.exports = Columns;

function Columns(body, scope) {
    this.attention = scope.attention;
    this.columns = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.activeIteration = null;
    this.activeIndex = -1;
}

Columns.prototype.add = function add(component, id, scope) {
    if (id === "this") {
        this.columns = scope.components.columns;
        this.columns.value = [];
    } else if (id === "columns:iteration") {
        component.container = scope.components.container;
        component.container.style.left = component.index * 600 + "px";
    }
};

Columns.prototype.navigate = function navigate(value, index) {
    index = index || 0;
    var pos = this.columns.value.indexOf(value);
    if (pos < 0) {
        this.columns.value.swap(index + 1, this.columns.value.length - index - 1, [value]);
        this.activateIteration(this.columns.iterations[index + 1]);
        this.activeIndex = index + 1;
    } else {
        this.columns.value.swap(pos + 1, this.columns.value.length - pos);
        this.activateIteration(this.columns.iterations[pos]);
        this.activeIndex = pos;
    }
};

Columns.prototype.activate = function activate(value, index) {
    index = index || 0;
    var pos = this.columns.value.indexOf(value);
    if (pos < 0) {
        this.columns.value.swap(index + 1, this.columns.value.length - index - 1, [value]);
    }
};

Columns.prototype.deactivate = function activate(value, index) {
};

Columns.prototype.activateIteration = function activateIteration(iteration) {
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
    this.activeIteration = iteration;
    iteration.container.classList.add("columnActive");
    iteration.focus();
};

Columns.prototype.deactivateIteration = function deactivateIteration(iteration) {
    iteration.container.classList.remove("columnActive");
    if (iteration.blur) {
        iteration.blur();
    }
    this.activeIteration = null;
};

Columns.prototype.handleLeft = function handleLeft() {
    if (this.activeIndex > 0) {
        this.activeIndex--;
        this.activateIteration(this.columns.iterations[this.activeIndex]);
        this.columns.value.swap(
            this.activeIndex + 1,
            this.columns.value.length - this.activeIndex
        );
        window.scrollTo(600 * this.activeIndex, 0);
    }
};

Columns.prototype.handleRight = function handleRight() {
    var iteration = this.activeIteration;
    if (iteration && iteration.handleEnter) {
        iteration.handleEnter();
        window.scrollTo(600 * this.activeIndex, 0);
    }
};

Columns.prototype.handleTop = function handleTop() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        container.scrollTop = 0;
    }
};

Columns.prototype.handleBottom = function handleBottom() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        container.scrollTop = container.innerHeight;
    }
};

Columns.prototype.handleScrollUp = function handleScrollUp() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        container.scrollTop -= container.clientHeight / 2;
    }
};

Columns.prototype.handleScrollDown = function handleScrollDown() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        container.scrollTop += container.clientHeight / 2;
    }
};

Columns.prototype.handleEscape = function handleEscape() {
    this.handleLeft();
};

Columns.prototype.focus = function focus() {
    this.directionEventTranslator.focus();
};

Columns.prototype.blur = function blur() {
    this.directionEventTranslator.blur();
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
};
