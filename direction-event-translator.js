"use strict";

module.exports = DirectionEventTranslator;

function DirectionEventTranslator(handler) {
    this.handler = handler;
}

DirectionEventTranslator.prototype.handleEvent = function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    var handler = this.handler;

    if (event.type === "keypress") {
        if (key === "h" && handler.handleLeft) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleLeft(event);
        } else if (key === "j" && handler.handleDown) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleDown(event);
        } else if (key === "k" && handler.handleUp) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleUp(event);
        } else if (key === "l" && handler.handleRight) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleRight(event);
        } else if (key === "H" && handler.handleShiftLeft) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleShiftLeft(event);
        } else if (key === "J" && handler.handleShiftDown) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleShiftDown(event);
        } else if (key === "K" && handler.handleShiftUp) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleShiftUp(event);
        } else if (key === "L" && handler.handleShiftRight) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleShiftRight(event);
        }
    } else if (event.type === "keydown") {
        if (keyCode === 13 && handler.handleEnter) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleEnter(event);
        } else if (keyCode === 27 && handler.handleEscape) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleEscape(event);
        } else if (keyCode === 37 && event.shiftKey && handler.handleShiftLeft) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleShiftLeft(event);
        } else if (keyCode === 37 && handler.handleLeft) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleLeft(event);
        } else if (keyCode === 38 && handler.handleUp) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleUp(event);
        } else if (keyCode === 39 && event.shiftKey && handler.handleShiftRight) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleShiftRight(event);
        } else if (keyCode === 39 && handler.handleRight) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleRight(event);
        } else if (keyCode === 40 && handler.handleDown) {
            event.preventDefault(); event.stopPropagation();
            return handler.handleDown(event);
        }
    }

    if (handler.handleEvent) {
        return handler.handleEvent(event);
    }
};

DirectionEventTranslator.prototype.focus = function focus() {
    window.addEventListener("keypress", this);
    window.addEventListener("keydown", this);
};

DirectionEventTranslator.prototype.blur = function blur() {
    window.removeEventListener("keypress", this);
    window.removeEventListener("keydown", this);
};
