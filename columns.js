"use strict";

var DirectionEventTranslator = require("./direction-event-translator");
var ScrollAnimator = require("./scroll-animator");

module.exports = Columns;

function Columns(body, scope) {
    this.attention = scope.attention;
    this.columns = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.activeIteration = null;
    this.scrollAnimator = null;
    this.activeIndex = -1;
    this.animator = scope.animator;
}

Columns.prototype.transitionDuration = 200;

Columns.prototype.add = function add(component, id, scope) {
    if (id === "this") {
        this.columns = scope.components.columns;
        this.columns.value = [];
        this.scrollAnimator = new ScrollAnimator(scope.components.columnsViewport, this.animator);
    } else if (id === "columns:iteration") {
        component.container = scope.components.container;
        component.container.style.left = component.index * 600 + "px";
        component.scrollAnimator = new ScrollAnimator(component.container, this.animator);
        component.destroy = destroyIteration;
    }
};

function destroyIteration() {
    this.scrollAnimator.destroy();
}

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
        this.scrollAnimator.scrollTo(600 * (1 + this.activeIndex), 0, this.transitionDuration);
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
        this.scrollAnimator.scrollTo(600 * this.activeIndex, 0, this.transitionDuration);
    }
};

Columns.prototype.handleRight = function handleRight() {
    var iteration = this.activeIteration;
    if (iteration && iteration.handleEnter) {
        iteration.handleEnter();
        this.scrollAnimator.scrollTo(600 * this.activeIndex, 0, this.transitionDuration);
    }
};

Columns.prototype.handleTop = function handleTop() {
    if (this.activeIteration) {
        this.activeIteration.scrollAnimator.scrollTo(0, 0, this.transitionDuration);
    }
};

Columns.prototype.handleBottom = function handleBottom() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        this.activeIteration.scrollAnimator.scrollTo(
            0,
            container.scrollHeight,
            this.transitionDuration
        );
    }
};

Columns.prototype.handleScrollUp = function handleScrollUp() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        this.activeIteration.scrollAnimator.scrollTo(
            0,
            container.scrollTop - container.clientHeight / 2,
            this.transitionDuration
        );
    }
};

Columns.prototype.handleScrollDown = function handleScrollDown() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        this.activeIteration.scrollAnimator.scrollTo(
            0,
            container.scrollTop + container.clientHeight / 2,
            this.transitionDuration
        );
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
