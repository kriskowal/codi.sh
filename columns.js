'use strict';

var DirectionEventTranslator = require("./direction-event-translator");

module.exports = Columns;

function Columns() {
    this.columns = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.activeIndex = -1;
}

Columns.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.columns = scope.components.columns;
        this.columns.value = [];
    } else if (id === "columns:iteration") {
        scope.components.container.style.left = component.index * 600 + 'px';
    }
};

Columns.prototype.navigate = function (value, index) {
    index = index || 0;
    var pos = this.columns.value.indexOf(value);
    if (pos < 0) {
        this.columns.value.swap(index + 1, this.columns.value.length - index - 1, [value]);
        this.columns.iterations[index + 1].focus();
        this.activeIndex = index + 1;
    } else {
        this.columns.value.swap(pos + 1, this.columns.value.length - pos);
        this.columns.iterations[pos].focus();
        this.activeIndex = pos;
    }
    window.scrollTo(600 * index, 0);
};

Columns.prototype.handleLeft = function () {
    if (this.activeIndex > 0) {
        this.activeIndex--;
        this.columns.iterations[this.activeIndex].focus();
        this.columns.value.swap(this.activeIndex + 1, this.columns.value.length - this.activeIndex);
        window.scrollTo(600 * this.activeIndex, 0);
    }
};

Columns.prototype.handleRight = function () {
    if (this.activeIndex >= 0) {
        var iteration = this.columns.iterations[this.activeIndex];
        if (iteration.handleEnter) {
            iteration.handleEnter();
        }
    }
};

Columns.prototype.handleEscape = function () {
    this.handleLeft();
};

Columns.prototype.focus = function focus() {
    this.directionEventTranslator.focus();
};

Columns.prototype.blur = function blur() {
    this.directionEventTranslator.blur();
};
