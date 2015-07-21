"use strict";

var Point2 = require("ndim/point2");

module.exports = ScrollAnimator;

function ScrollAnimator(component, animator) {
    this.component = component;
    this.animator = animator.add(this);
    this.startTime = null;
    this.stopTime = null;
    this.startPoint = new Point2();
    this.vector = new Point2();
    this.position = new Point2();
}

ScrollAnimator.prototype.destroy = function destroy() {
    this.animator.destroy();
}

ScrollAnimator.prototype.animateTo = function animateTo(left, top, duration) {
    this.startTime = Date.now();
    this.stopTime = this.startTime + duration;
    this.animator.requestMeasure();
    this.animator.requestAnimation();
};

ScrollAnimator.prototype.measure = function measure() {
    this.startPoint.x = this.component.scrollLeft;
    this.startPoint.y = this.component.scrollTop;
};

ScrollAnimator.prototype.animate = function animate(now) {
    var progress = (now - this.start) / (this.stop - this.start);
    if (progress > 1) {
        this.animator.cancelAnimation();
        progress = 1;
    }
    this.position
        .become(this.vector)
        .scaleThis(progress)
        .addThis(this.startPoint);
    this.component.scrollTo(this.position.x, this.position.y);
};
