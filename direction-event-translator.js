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
        if (key === "h" && handler.handleLeftCommand) {
            return handler.handleLeftCommand(event);
        } else if (key === "j" && handler.handleDownCommand) {
            return handler.handleDownCommand(event);
        } else if (key === "k" && handler.handleUpCommand) {
            return handler.handleUpCommand(event);
        } else if (key === "l" && handler.handleRightCommand) {
            return handler.handleRightCommand(event);
        } else if (key === "H" && handler.handleShiftLeftCommand) {
            return handler.handleShiftLeftCommand(event);
        } else if (key === "J" && handler.handleShiftDownCommand) {
            return handler.handleShiftDownCommand(event);
        } else if (key === "K" && handler.handleShiftUpCommand) {
            return handler.handleShiftUpCommand(event);
        } else if (key === "L" && handler.handleShiftRightCommand) {
            return handler.handleShiftRightCommand(event);
        }
    } else if (event.type === "keydown") {
        if (keyCode === 13 && handler.handleEnter) {
            return handler.handleEnter(event);
        } else if (keyCode === 27 && handler.handleEscape) {
            return handler.handleEscape(event);
        } else if (keyCode === 37 && event.shiftKey && handler.handleShiftLeftCommand) {
            return handler.handleShiftLeftCommand(event);
        } else if (keyCode === 37 && handler.handleLeftCommand) {
            return handler.handleLeftCommand(event);
        } else if (keyCode === 38 && handler.handleUpCommand) {
            return handler.handleUpCommand(event);
        } else if (keyCode === 39 && event.shiftKey && handler.handleShiftRightCommand) {
            return handler.handleShiftRightCommand(event);
        } else if (keyCode === 39 && handler.handleRightCommand) {
            return handler.handleRightCommand(event);
        } else if (keyCode === 40 && handler.handleDownCommand) {
            return handler.handleDownCommand(event);
        }
    }

    return handler.handleEvent(event);
};

DirectionEventTranslator.prototype.focus = function focus() {
    window.addEventListener("keypress", this);
    window.addEventListener("keydown", this);
};

DirectionEventTranslator.prototype.blur = function blur() {
    window.removeEventListener("keypress", this);
    window.removeEventListener("keydown", this);
};
