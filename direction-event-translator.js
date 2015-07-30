"use strict";

module.exports = DirectionEventTranslator;

function DirectionEventTranslator(handler) {
    this.handler = handler;
}

DirectionEventTranslator.prototype.keyMap = {
    "h": "handleLeft",
    "j": "handleDown",
    "k": "handleUp",
    "l": "handleRight",
    "g": "handleTop",
    "u": "handleScrollUp",
    "d": "handleScrollDown",
    "H": "handleShiftLeft",
    "J": "handleShiftDown",
    "K": "handleShiftUp",
    "L": "handleShiftRight",
    "G": "handleBottom",
};

DirectionEventTranslator.prototype.keyCodeMap = {
    13: "handleEnter",
    9: "handleTab",
    32: "handleScrollDown",
    27: "handleEscape",
    37: "handleLeft",
    38: "handleUp",
    39: "handleRight",
    40: "handleDown"
};

DirectionEventTranslator.prototype.shiftKeyCodeMap = {
    37: "handleShiftLeft",
    38: "handleShiftUp",
    39: "handleShiftRight",
    40: "handleShiftDown"
};

DirectionEventTranslator.prototype.handleEvent = function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    var handler = this.handler;

    if (event.metaKey || event.altKey || event.ctrlKey) {
    } else if (event.type === "keypress") {
        if (this.keyMap[key] && handler[this.keyMap[key]]) {
            event.preventDefault(); event.stopPropagation();
            return handler[this.keyMap[key]](event);
        }
    } else if (event.type === "keydown") {
        if (
            this.shiftKeyCodeMap[keyCode] &&
            event.shiftKey &&
            handler[this.shiftKeyCodeMap[keyCode]]
        ) {
            event.preventDefault(); event.stopPropagation();
            return handler[this.shiftKeyCodeMap[keyCode]](event);
        } else if (this.keyCodeMap[keyCode] && handler[this.keyCodeMap[keyCode]]) {
            event.preventDefault(); event.stopPropagation();
            return handler[this.keyCodeMap[keyCode]](event);
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
