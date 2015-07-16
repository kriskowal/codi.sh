'use strict';

module.exports = Columns;

function Columns() {
    this.columns = null;
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
        this.columns.value.splice(index + 1, this.columns.value.length - index - 1, value);
        this.columns.iterations[index].focus();
    } else {
        this.columns.value.splice(pos + 1, this.columns.value.length);
        this.columns.iterations[pos].focus();
    }
    window.scrollTo(600 * index, 0);
};
