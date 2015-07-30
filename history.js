"use strict";

// Handles and manipulates the window history using shebanged location anchors.

module.exports = History;

function History(window, handler) {
    this.handler = handler;
    this.window = window;
    this.location = window.location;
    this.history = window.history;

    this.window.addEventListener("hashchange", this);
}

History.prototype.destroy = function destroy() {
    this.window.removeEventListener("hashchange", this);
};

History.prototype.handleEvent = function handleEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    this.update();
};

History.prototype.update = function update() {
    var hash = this.location.hash;
    if (hash.lastIndexOf("#!", 0) === 0) {
        this.handler.setPath(hash.slice(2));
    } else {
        this.handler.setPath("index");
    }
};

History.prototype.push = function push(path) {
    this.history.pushState(null, null, "#!" + path);
};

History.prototype.pop = function pop() {
    this.history.popState();
};

History.prototype.replace = function replace(path) {
    this.history.replaceState(null, null, "#!" + path);
};
