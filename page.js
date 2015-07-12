'use strict';

var Identifier = require("system/identifier");

module.exports = Page;

function Page() {
    this.navigator = null;
    this.index = null;
}

Object.defineProperty(Page.prototype, "value", {
    get: function get() {
    },
    set: function set(document) {
         this.see.value = document.head.see || [];
         this.body.value = document.body;
    }
});

Page.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.see = scope.components.see;
        this.body = scope.components.body;
    } else if (id === "see:iteration") {
        if (component.value.href) {
            if (module.system) {
                scope.components.link.value = module.system.systems["codi.sh"].require(component.value.href);
            } else {
                var id = Identifier.resolve(component.value.href, "codi.sh/");
                scope.components.link.value = module.modules[id]._require();
            }
            scope.components.link.setAttribute("href", "#");
        }
        scope.components.link.addEventListener("click", this);
        scope.components.label.value = component.value.label;
    }
};

Page.prototype.handleEvent = function handleEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.value) {
        this.navigator.navigate(event.target.value, this.index);
    }
};
