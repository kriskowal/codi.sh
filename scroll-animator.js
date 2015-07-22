"use strict";

var Point2 = require("ndim/point2");

module.exports = ScrollAnimator;

function ScrollAnimator(component, animator) {
    this.component = component;
    this.animator = animator.add(this);
    this.startTime = null;
    this.duration = null;
    this.startPoint = new Point2();
    this.displacement = new Point2();
    this.position = new Point2();
    this.relative = false;
}

ScrollAnimator.prototype.destroy = function destroy() {
    this.animator.destroy();
}

ScrollAnimator.prototype.scrollTo = function scrollTo(left, top, duration) {
    this.startTime = Date.now();
    this.duration = duration;
    this.displacement.x = left;
    this.displacement.y = top;
    this.animator.requestMeasure();
    this.animator.requestAnimation();
    this.relative = false;
};

ScrollAnimator.prototype.scrollBy = function scrollBy(left, top, duration) {
    this.startTime = Date.now();
    this.duration = duration;
    this.displacement.x = left;
    this.displacement.y = top;
    this.animator.requestMeasure();
    this.animator.requestAnimation();
    this.relative = true;
};

ScrollAnimator.prototype.measure = function measure() {
    this.startPoint.x = this.component.scrollLeft;
    this.startPoint.y = this.component.scrollTop;
    if (!this.relative) {
        this.displacement.subThis(this.startPoint);
    }
};

ScrollAnimator.prototype.animate = function animate(now) {
    var progress = (now - this.startTime) / this.duration;
    if (progress > 1) {
        this.animator.cancelAnimation();
        progress = 1;
    }
    this.position
        .become(this.displacement)
        .scaleThis(progress)
        .addThis(this.startPoint);
    this.component.scrollLeft = this.position.x;
    this.component.scrollTop = this.position.y;
};
