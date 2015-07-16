"use strict";

module.exports = Attention;

function Attention() {
    this.component = null;
}

Attention.prototype.take = function (component) {
    if (this.component && this.component.blur) {
        this.component.blur();
    }
    this.component = component;
};
