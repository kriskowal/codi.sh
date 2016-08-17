global = this;
(function (modules) {

    // Bundle allows the run-time to extract already-loaded modules from the
    // boot bundle.
    var bundle = {};
    var main;

    // Unpack module tuples into module objects.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        module = modules[i] = new Module(
            module[0],
            module[1],
            module[2],
            module[3],
            module[4]
        );
        bundle[module.filename] = module;
    }

    function Module(id, dirname, basename, dependencies, factory) {
        this.id = id;
        this.dirname = dirname;
        this.filename = dirname + "/" + basename;
        // Dependency map and factory are used to instantiate bundled modules.
        this.dependencies = dependencies;
        this.factory = factory;
    }

    Module.prototype._require = function () {
        var module = this;
        if (module.exports === void 0) {
            module.exports = {};
            var require = function (id) {
                var index = module.dependencies[id];
                var dependency = modules[index];
                if (!dependency)
                    throw new Error("Bundle is missing a dependency: " + id);
                return dependency._require();
            };
            require.main = main;
            module.exports = module.factory(
                require,
                module.exports,
                module,
                module.filename,
                module.dirname
            ) || module.exports;
        }
        return module.exports;
    };

    // Communicate the bundle to all bundled modules
    Module.prototype.modules = bundle;

    return function require(filename) {
        main = bundle[filename];
        main._require();
    }
})([["animator.js","blick","animator.js",{"raf":62},function (require, exports, module, __filename, __dirname){

// blick/animator.js
// -----------------

"use strict";

var defaultRequestAnimation = require("raf");

module.exports = Animator;

function Animator(requestAnimation) {
    var self = this;
    self._requestAnimation = requestAnimation || defaultRequestAnimation;
    self.controllers = [];
    // This thunk is doomed to deoptimization for multiple reasons, but passes
    // off as quickly as possible to the unrolled animation loop.
    self._animate = function () {
        try {
            self.animate(Date.now());
        } catch (error) {
            self.requestAnimation();
            throw error;
        }
    };
}

Animator.prototype.requestAnimation = function () {
    if (!this.requested) {
        this._requestAnimation(this._animate);
    }
    this.requested = true;
};

Animator.prototype.animate = function (now) {
    var node, temp;

    this.requested = false;

    // Measure
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.measure) {
            controller.component.measure(now);
            controller.measure = false;
        }
    }

    // Transition
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        // Unlke others, skipped if draw or redraw are scheduled and left on
        // the schedule for the next animation frame.
        if (controller.transition) {
            if (!controller.draw && !controller.redraw) {
                controller.component.transition(now);
                controller.transition = false;
            } else {
                this.requestAnimation();
            }
        }
    }

    // Animate
    // If any components have animation set, continue animation.
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.animate) {
            controller.component.animate(now);
            this.requestAnimation();
            // Unlike others, not reset implicitly.
        }
    }

    // Draw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.draw) {
            controller.component.draw(now);
            controller.draw = false;
        }
    }

    // Redraw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.redraw) {
            controller.component.redraw(now);
            controller.redraw = false;
        }
    }
};

Animator.prototype.add = function (component) {
    var controller = new AnimationController(component, this);
    this.controllers.push(controller);
    return controller;
};

function AnimationController(component, controller) {
    this.component = component;
    this.controller = controller;

    this.measure = false;
    this.transition = false;
    this.animate = false;
    this.draw = false;
    this.redraw = false;
}

AnimationController.prototype.destroy = function () {
};

AnimationController.prototype.requestMeasure = function () {
    if (!this.component.measure) {
        throw new Error("Can't requestMeasure because component does not implement measure");
    }
    this.measure = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelMeasure = function () {
    this.measure = false;
};

AnimationController.prototype.requestTransition = function () {
    if (!this.component.transition) {
        throw new Error("Can't requestTransition because component does not implement transition");
    }
    this.transition = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelTransition = function () {
    this.transition = false;
};

AnimationController.prototype.requestAnimation = function () {
    if (!this.component.animate) {
        throw new Error("Can't requestAnimation because component does not implement animate");
    }
    this.animate = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelAnimation = function () {
    this.animate = false;
};

AnimationController.prototype.requestDraw = function () {
    if (!this.component.draw) {
        throw new Error("Can't requestDraw because component does not implement draw");
    }
    this.draw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelDraw = function () {
    this.draw = false;
};

AnimationController.prototype.requestRedraw = function () {
    if (!this.component.redraw) {
        throw new Error("Can't requestRedraw because component does not implement redraw");
    }
    this.redraw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelRedraw = function () {
    this.redraw = false;
};

}],["asap.yaml","codi.sh","asap.yaml",{},function (require, exports, module, __filename, __dirname){

// codi.sh/asap.yaml
// -----------------

var body = "<h1 id=\"-asap-\"><a href=\"https://github.com/kriskowal/asap\">ASAP</a></h1>\n<p>Promise and asynchronous observer libraries, as well as hand-rolled callback\nprograms and libraries, often need a mechanism to postpone the execution of a\ncallback until the next available event.\n(See <a href=\"http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony\">Designing API’s for Asynchrony</a>.)\nThe <code>asap</code> function executes a task <strong>as soon as possible</strong> but not before it\nreturns, waiting only for the completion of the current event and previously\nscheduled tasks.</p>\n<pre><code class=\"lang-javascript\">asap(function () {\n    // ...\n});\n</code></pre>\n<p>The <a href=\"https://github.com/kriskowal/asap\">ASAP</a> package provides such an <code>asap</code> function that executes a task <em>as\nsoon as possible</em>, after returning.\nASAP strives to schedule events to occur before yielding for IO, reflow,\nor redrawing.\nEach event receives an independent stack, with only platform code in parent\nframes and the events run in the order they are scheduled.</p>\n<p>ASAP provides a fast event queue that will execute tasks until it is\nempty before yielding to the JavaScript engine&#39;s underlying event-loop.\nWhen a task gets added to a previously empty event queue, ASAP schedules a flush\nevent, preferring for that event to occur before the JavaScript engine has an\nopportunity to perform IO tasks or rendering, thus making the first task and\nsubsequent tasks semantically indistinguishable.\nASAP uses a variety of techniques to preserve this invariant on different\nversions of browsers and Node.js.</p>\n<p>By design, ASAP prevents input events from being handled until the task\nqueue is empty.\nIf the process is busy enough, this may cause incoming connection requests to be\ndropped, and may cause existing connections to inform the sender to reduce the\ntransmission rate or stall.\nASAP allows this on the theory that, if there is enough work to do, there is no\nsense in looking for trouble.\nAs a consequence, ASAP can interfere with smooth animation.\nIf your task should be tied to the rendering loop, consider using\n<code>requestAnimationFrame</code> instead.\nA long sequence of tasks can also effect the long running script dialog.\nIf this is a problem, you may be able to use ASAP’s cousin <code>setImmediate</code> to\nbreak long processes into shorter intervals and periodically allow the browser\nto breathe.\n<code>setImmediate</code> will yield for IO, reflow, and repaint events.\nIt also returns a handler and can be canceled.\nFor a <code>setImmediate</code> shim, consider <a href=\"https://github.com/YuzuJS/setImmediate\">YuzuJS setImmediate</a>.</p>\n<p>Take care.\nASAP can sustain infinite recursive calls without warning.\nIt will not halt from a stack overflow, and it will not consume unbounded\nmemory.\nThis is behaviorally equivalent to an infinite loop.\nJust as with infinite loops, you can monitor a Node.js process for this behavior\nwith a heart-beat signal.\nAs with infinite loops, a very small amount of caution goes a long way to\navoiding problems.</p>\n<pre><code class=\"lang-javascript\">function loop() {\n    asap(loop);\n}\nloop();\n</code></pre>\n<p>In browsers, if a task throws an exception, it will not interrupt the flushing\nof high-priority tasks.\nThe exception will be postponed to a later, low-priority event to avoid\nslow-downs.\nIn Node.js, if a task throws an exception, ASAP will resume flushing only if—and\nonly after—the error is handled by <code>domain.on(&quot;error&quot;)</code> or\n<code>process.on(&quot;uncaughtException&quot;)</code>.</p>\n<h2 id=\"tasks\">Tasks</h2>\n<p>A task may be any object that implements <code>call()</code>.\nA function will suffice, but closures tend not to be reusable and can cause\ngarbage collector churn.\nBoth <code>asap</code> and <code>rawAsap</code> accept task objects to give you the option of\nrecycling task objects or using higher callable object abstractions.\nSee the <code>asap</code> source for an illustration.</p>\n<h2 id=\"heritage\">Heritage</h2>\n<p>ASAP has been factored out of the <a href=\"https://github.com/kriskowal/q\">Q</a> asynchronous promise library.\nIt originally had a naïve implementation in terms of <code>setTimeout</code>, but\n<a href=\"http://www.nonblocking.io/2011/06/windownexttick.html\">Malte Ubl</a> provided an insight that <code>postMessage</code> might be\nuseful for creating a high-priority, no-delay event dispatch hack.\nSince then, Internet Explorer proposed and implemented <code>setImmediate</code>.\nRobert Katić began contributing to Q by measuring the performance of\nthe internal implementation of <code>asap</code>, paying particular attention to\nerror recovery.\nDomenic, Robert, and Kris Kowal collectively settled on the current strategy of\nunrolling the high-priority event queue internally regardless of what strategy\nwe used to dispatch the potentially lower-priority flush event.\nDomenic went on to make ASAP cooperate with Node.js domains.</p>\n<p>For further reading, Nicholas Zakas provided a thorough article on <a href=\"http://www.nczonline.net/blog/2013/07/09/the-case-for-setimmediate/\">The\nCase for setImmediate</a>.</p>\n<p>Ember’s RSVP promise implementation later <a href=\"https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js\">adopted</a> the name ASAP but\nfurther developed the implentation.\nParticularly, The <code>MessagePort</code> implementation was abandoned due to interaction\n<a href=\"https://github.com/cujojs/when/issues/197\">problems with Mobile Internet Explorer</a> in favor of an\nimplementation backed on the newer and more reliable DOM <code>MutationObserver</code>\ninterface.\nThese changes were back-ported into this library.</p>\n<p>In addition, ASAP factored into <code>asap</code> and <code>asap/raw</code>, such that <code>asap</code> remained\nexception-safe, but <code>asap/raw</code> provided a tight kernel that could be used for\ntasks that guaranteed that they would not throw exceptions.\nThis core is useful for promise implementations that capture thrown errors in\nrejected promises and do not need a second safety net.\nAt the same time, the exception handling in <code>asap</code> was factored into separate\nimplementations for Node.js and browsers, using the the <a href=\"https://gist.github.com/defunctzombie/4339901\">Browserify</a> <code>browser</code> property in <code>package.json</code> to instruct browser module loaders\nand bundlers, including <a href=\"https://github.com/substack/node-browserify\">Browserify</a>, <a href=\"https://github.com/montagejs/mr\">Mr</a>, and <a href=\"https://github.com/montagejs/mop\">Mop</a>,  to use the\nbrowser-only implementation.</p>\n";
var see = []
var slug = "asap";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["attention.js","codi.sh","attention.js",{},function (require, exports, module, __filename, __dirname){

// codi.sh/attention.js
// --------------------

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

}],["bindings.yaml","codi.sh","bindings.yaml",{"./observers.yaml":30,"./system.yaml":36},function (require, exports, module, __filename, __dirname){

// codi.sh/bindings.yaml
// ---------------------

var body = "<h1 id=\"-bindings-frb-\"><a href=\"https://github.com/montagejs/frb\">Bindings</a></h1>\n<p>Within the memory of one process running on an event loop, it is always\npossible to have a consistent model at the end of every event.\nThere is no value in the compromise of eventual consistency unless state is\nspread across multiple processes.\nAs such, bindings should be implemented like a Prolog, guaranteeing consistency\nat the conclusion of every state change.\nThis means effecting changes recursively and synchronously.</p>\n<p>…And leave the DOM out of this.\nThe DOM is slow because it thrashes on reads and writes.\nUsing <a href=\"https://github.com/gutentags/blick\">Blick</a> and similar draw cycle tools, it is possible to batch reads and\nwrites for each animation frame.</p>\n<p>Property and content change observers are the primitive from which we can build\nsynchronous data bindings.\n<a href=\"https://github.com/montagejs/frb\">Functional Reactive Bindings</a> is a language and runtime for effecting one\nand two-way bindings based on stacked change observers.</p>\n<p>FRB is based on Version 1 of <a href=\"https://github.com/montagejs/collections\">Collections</a>, which is tightly\ncoupled to certain global shims and comes with an older change listener\ninterface, from which <a href=\"https://github.com/kriskowal/pop-iterator\">POP Observe</a> improves upon based on observations about\nhow FRB composes them, with a focus on avoiding closures and reusing observer\nobjects.</p>\n<p>Developing FRB for Montage led me to conclude that bindings should be expressed\nin a way similar to CSS.\nThere should be a language that applies blocks of bindings to components based\non their identifier.</p>\n<p>FRB also comes with a complete runtime for all possible expressions and\noperators that the language supports.\nThe next rendition of reactive bindings would benefit from a JavaScript\ntranslator that only links the change operators, like <code>map</code> or <code>filter</code>, that\nan application needs.</p>\n<p>The <a href=\"https://github.com/gutentags/system\">System Modules</a> package provides an opportunity to hook arbitary\nlanguages, load dependencies, and translate them to JavaScript.\nThe next generation of FRB would compile a CSS-alike language to bindings.</p>\n<p>Although bindings apply largely to properties of components, it would also be\npossible to use bindings to manipulate style directly, possibly driving\na CSSOM runtime, scoping style changes to an instance of a component.</p>\n";
var see = []
see.push({label: "Observers", href: "./observers.yaml", value: require("./observers.yaml")});
see.push({label: "Module System", href: "./system.yaml", value: require("./system.yaml")});
var slug = "bindings";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["collections.yaml","codi.sh","collections.yaml",{"./operators.yaml":31},function (require, exports, module, __filename, __dirname){

// codi.sh/collections.yaml
// ------------------------

var body = "<h1 id=\"-collections-collections-version-2-\"><a href=\"https://github.com/kriskowal/collections\">Collections</a></h1>\n<!--\nThere is a cafeteria of operators that collections should pick from to form\ntheir interface.\nThe contract is intrinsic to the operator, not the collection.\nA collection should implement every applicable operator.\nMany of these operators have generic implementations that can be implemented in\nterms of a small kernel from the whole body of operators.\n\nCollections should also be observable.\nEach collection supports the applicable change observer functions for\nproperty changes (including length), splice-like changes (range changes), and\nkey value changes (map changes).\n-->\n<p>Array was only the beginning.\nThe collections library provides lists, sets, and maps of various kinds.\nThese are available in npm with <code>npm install collections</code> and useful both in\nbrowsers and Node.js.</p>\n<p>See <a href=\"http://www.collectionsjs.com/\">collectionsjs.com</a> for thorough\ndocumentation of <a href=\"https://github.com/montagejs/collections\">Collections, Version 1</a>.</p>\n<p>Version 1 is at the heart of <a href=\"http://montagestudio.com/montagejs/\">MontageJS</a>, providing extensions to the Array\nand Object prototypes, as well as change listeners that are the foundation of\nMontage MVC bindings with <a href=\"https://github.com/montagejs/frb/\">FRB</a>.</p>\n<p><a href=\"https://github.com/kriskowal/collections\">Collections, Version 2</a> removes all of these shims in favor of polymorphic operators, each\npackaged separately, including <a href=\"https://github.com/kriskowal/pop-swap/\">pop-swap</a> for high performance array\nchanges, and <a href=\"https://github.com/kriskowal/pop-observe/\">pop-observe</a> for change observers on most collections.</p>\n";
var see = []
see.push({label: "Polymorphic Operators", href: "./operators.yaml", value: require("./operators.yaml")});
var slug = "collections";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["columns.html","codi.sh","columns.html",{"./columns":6,"gutentag/repeat.html":40},function (require, exports, module, __filename, __dirname){

// codi.sh/columns.html
// --------------------

"use strict";
var $SUPER = require("./columns");
var $REPEAT = require("gutentag/repeat.html");
var $THIS = function CodishColumns(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("columnsViewport", component);
    if (component.setAttribute) {
        component.setAttribute("id", "columnsViewport_lemdb3");
    }
    if (scope.componentsFor["columnsViewport"]) {
       scope.componentsFor["columnsViewport"].setAttribute("for", "columnsViewport_lemdb3")
    }
    if (component.setAttribute) {
    component.setAttribute("class", "columnsViewport");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "columnsBacking");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "columns";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("columns", component);
        if (component.setAttribute) {
            component.setAttribute("id", "columns_ws681j");
        }
        if (scope.componentsFor["columns"]) {
           scope.componentsFor["columns"].setAttribute("for", "columns_ws681j")
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {"columns:iteration":"iteration"};
module.exports = $THIS;
var $THIS$0 = function CodishColumns$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("container", component);
    if (component.setAttribute) {
        component.setAttribute("id", "container_mwzhcy");
    }
    if (scope.componentsFor["container"]) {
       scope.componentsFor["container"].setAttribute("for", "container_mwzhcy")
    }
    if (component.setAttribute) {
    component.setAttribute("class", "column");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // COLUMN
            node = {tagName: "column"};
            node.component = $THIS$0$1;
            callee = scope.caller.nest();
            if (callee.argument) {
                callee.id = "column";
                component = new callee.argument.component(parent, callee);
            } else {
                component = new node.component(parent, scope);
            }
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("column", component);
        if (component.setAttribute) {
            component.setAttribute("id", "column_1c2iqu");
        }
        if (scope.componentsFor["column"]) {
           scope.componentsFor["column"].setAttribute("for", "column_1c2iqu")
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1 = function CodishColumns$0$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["columns.js","codi.sh","columns.js",{"./direction-event-translator":7,"./scroll-animator":35},function (require, exports, module, __filename, __dirname){

// codi.sh/columns.js
// ------------------

"use strict";

var DirectionEventTranslator = require("./direction-event-translator");
var ScrollAnimator = require("./scroll-animator");

module.exports = Columns;

function Columns(body, scope) {
    this.attention = scope.attention;
    this.history = scope.history;
    this.columns = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.activeIteration = null;
    this.scrollAnimator = null;
    this.activeIndex = -1;
    this.animator = scope.animator;
}

Columns.prototype.transitionDuration = 200;

Columns.prototype.hookup = function hookup(id, component, scope) {
    if (id === "this") {
        this.columns = scope.components.columns;
        this.columns.value = [];
        this.scrollAnimator = new ScrollAnimator(
            scope.components.columnsViewport,
            this.animator
        );
    } else if (id === "columns:iteration") {
        component.container = scope.components.container;
        component.container.style.left = component.index * 600 + "px";
        component.scrollAnimator = new ScrollAnimator(
            component.container,
            this.animator
        );
        component.parent = this;
        component.container.addEventListener("click", component);
        component.handleEvent = handleEventIteration;
        component.destroy = destroyIteration;
    }
};

function destroyIteration() {
    this.container.removeEventListener("click", this);
    this.scrollAnimator.destroy();
}

function handleEventIteration(event) {
    this.parent.activateIteration(this);
}

Columns.prototype.navigate = function navigate(value, index) {
    index = index || 0;
    var pos = this.columns.value.indexOf(value);
    if (pos < 0) {
        this.columns.value.swap(index, this.columns.value.length - index, [value]);
        this.activateIteration(this.columns.iterations[index]);
        this.activeIndex = index;
    } else {
        this.columns.value.swap(pos + 1, this.columns.value.length - pos);
        this.activateIteration(this.columns.iterations[pos]);
        this.activeIndex = pos;
    }
    this.scrollAnimator.scrollTo(600 * this.activeIndex, 0, this.transitionDuration);
    this.pushHistory();
};

Columns.prototype.pushHistory = function pushHistory() {
    var path = "";
    for (var index = 0; index <= this.activeIndex; index++) {
        path += encodeURIComponent(this.columns.iterations[index].value || "");
        if (index < this.activeIndex) {
            path += "/";
        }
    }
    this.history.push(path);
};

Columns.prototype.setPath = function setPath(path) {
    var parts = path.split("/");
    for (var index = 0; index < parts.length; index++) {
        var part = decodeURIComponent(parts[index]);
        this.navigate(part, index);
    }
};

Columns.prototype.activate = function activate(value, index) {
    index = index || 0;
    var pos = this.columns.value.indexOf(value);
    if (pos < 0) {
        this.columns.value.swap(index + 1, this.columns.value.length - index - 1, [value]);
        this.scrollAnimator.scrollTo(600 * this.activeIndex, 0, this.transitionDuration);
    }
};

Columns.prototype.deactivate = function activate(value, index) {
};

Columns.prototype.activateIteration = function activateIteration(iteration) {
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
    this.activeIteration = iteration;
    iteration.container.classList.add("columnActive");
    iteration.focus();
};

Columns.prototype.deactivateIteration = function deactivateIteration(iteration) {
    iteration.container.classList.remove("columnActive");
    if (iteration.blur) {
        iteration.blur();
    }
    this.activeIteration = null;
};

Columns.prototype.handleLeft = function handleLeft() {
    if (this.activeIndex > 0) {
        this.activeIndex--;
        this.activateIteration(this.columns.iterations[this.activeIndex]);
        this.scrollAnimator.scrollTo(600 * this.activeIndex, 0, this.transitionDuration);
    }
    this.pushHistory();
};

Columns.prototype.handleRight = function handleRight() {
    var iteration = this.activeIteration;
    if (iteration && iteration.handleEnter) {
        iteration.handleEnter();
        this.scrollAnimator.scrollTo(600 * this.activeIndex, 0, this.transitionDuration);
    }
    this.pushHistory();
};

Columns.prototype.handleTop = function handleTop() {
    if (this.activeIteration) {
        this.activeIteration.scrollAnimator.scrollTo(0, 0, this.transitionDuration);
    }
};

Columns.prototype.handleBottom = function handleBottom() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        this.activeIteration.scrollAnimator.scrollTo(
            0,
            container.scrollHeight,
            this.transitionDuration
        );
    }
};

Columns.prototype.handleScrollUp = function handleScrollUp() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        this.activeIteration.scrollAnimator.scrollTo(
            0,
            container.scrollTop - container.clientHeight / 2,
            this.transitionDuration
        );
    }
};

Columns.prototype.handleScrollDown = function handleScrollDown() {
    if (this.activeIteration) {
        var container = this.activeIteration.container;
        this.activeIteration.scrollAnimator.scrollTo(
            0,
            container.scrollTop + container.clientHeight / 2,
            this.transitionDuration
        );
    }
};

Columns.prototype.handleEscape = function handleEscape() {
    this.handleLeft();
};

Columns.prototype.focus = function focus() {
    this.directionEventTranslator.focus();
};

Columns.prototype.blur = function blur() {
    this.directionEventTranslator.blur();
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
};

}],["direction-event-translator.js","codi.sh","direction-event-translator.js",{},function (require, exports, module, __filename, __dirname){

// codi.sh/direction-event-translator.js
// -------------------------------------

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

}],["gutentag.yaml","codi.sh","gutentag.yaml",{"./gutentag/examples.yaml":14,"./gutentag/features.yaml":15,"./gutentag/boot.yaml":10,"./gutentag/builtins.yaml":11,"./gutentag/custom.yaml":13,"./gutentag/args-and-scopes.yaml":9,"./gutentag/xml.yaml":22,"./system.yaml":36},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag.yaml
// ---------------------

var body = "<h1 id=\"-guten-tag-\"><a href=\"https://github.com/gutentags/gutentag\">Guten Tag</a>!</h1>\n<blockquote>\n<p><em>Guten Tag</em>, pronounced <em>goo&#39;tn tock</em>, German for <em>Good day</em>, or in the\nhacker idiom, <em>Hello, World!</em></p>\n</blockquote>\n<p>The missing piece of the web component story is declarative modularity.\nWeb components currently have encapsulation through the shadow DOM, and a form\nof modularity through script tags and register functions, but no inherent means\nfor declarative dependency.</p>\n<p>Tags should be expressed as modules, written in HTML, with declarations for\ndependency on other tags, and declarations for how they will receive argument\ntags.\nThese declarations should be flexible enough to express all existing HTML5\ntags.\nThe tag module should export a component constructor, and send and receive\ncomponent constructors as arguments.</p>\n<p>Each tag should have a lexical scope, so one can trace a component by its\nidentifier by following parent tags until you encounter a scope that contains\nthat identifier.\nThe instance of a tag should never be in another file, except in the limited\nsense of dynamic scoping through components <em>introduced</em> by other components,\nlike <code>repetition:iteration</code>, where <code>repetition</code> is the identifier of a\ncomponent in scope, and <code>iteration</code> is a component introduced into your scope\nby that component.</p>\n<p>A <a href=\"https://github.com/gutentags/gutentag\">guten tag</a> is a module written in a variant of HTML that exports such a\nconstructor and can depend on other guten tags.\nGuten Tag provides a <code>gutentag/translate-html</code> module that can translate\nan HTML module to JavaScript, either on the fly during development in a\nbrowser, or in Node.js to produce a script bundle.\nTranslator modules are supported by the <a href=\"https://github.com/gutentags/system\">System module loader</a>.</p>\n<p>Guten tags rely upon a very thin, nearly transparent, virtual document that\nserves to manipulate virtual &quot;body&quot; nodes to encapsulate components, without\nnecessarily introducing a container element.\nBody nodes make it possible to give a component ownership over a region\nof the actual document and make it easy for Guten Tag to add and remove these\nregions.\nA body&#39;s actual children are either captured in an orphan <code>&lt;body&gt;</code> element when\nthey are not on the actual document, or inserted before an empty text node when\nthey are on the actual document.\nThis is a service provided by the <a href=\"https://github.com/gutentags/koerper\">Koerper</a> module.</p>\n";
var see = []
see.push({label: "Examples", href: "./gutentag/examples.yaml", value: require("./gutentag/examples.yaml")});
see.push({label: "Features of Tags", href: "./gutentag/features.yaml", value: require("./gutentag/features.yaml")});
see.push({label: "Booting up Guten Tags", href: "./gutentag/boot.yaml", value: require("./gutentag/boot.yaml")});
see.push({label: "Built-in Tags", href: "./gutentag/builtins.yaml", value: require("./gutentag/builtins.yaml")});
see.push({label: "Custom Tags", href: "./gutentag/custom.yaml", value: require("./gutentag/custom.yaml")});
see.push({label: "Arguments and Scopes", href: "./gutentag/args-and-scopes.yaml", value: require("./gutentag/args-and-scopes.yaml")});
see.push({label: "XML", href: "./gutentag/xml.yaml", value: require("./gutentag/xml.yaml")});
see.push({label: "Module System", href: "./system.yaml", value: require("./system.yaml")});
var slug = "gutentag";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/args-and-scopes.yaml","codi.sh/gutentag","args-and-scopes.yaml",{"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/args-and-scopes.yaml
// -------------------------------------

var body = "<h1 id=\"arguments-and-scopes\">Arguments and Scopes</h1>\n<p>The building block components, <code>&lt;repeat&gt;</code>, <code>&lt;reveal&gt;</code>, and <code>&lt;choose&gt;</code> all create\na child scope for the components instantiated by their inner template.\nThis has interesting implications for arguments instantiated within that scope.\nConsider a <code>&lt;list&gt;</code> tag that contains a repetition and accepts an argument\ncomponent for each row.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./list&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/repeat.html&quot;&gt;\n        &lt;meta accepts=&quot;[body]&quot; as=&quot;row&quot;&gt;\n        &lt;meta exports=&quot;rows:iteration&quot; as=&quot;row&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;ul&gt;&lt;repeat id=&quot;rows&quot;&gt;\n            &lt;li&gt;&lt;row&gt;&lt;/row&gt;&lt;/li&gt;\n        &lt;/repeat&gt;&lt;/ul&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>Another component instantiates the list with a text component in each row.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./essay&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;./list.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;list id=&quot;items&quot;&gt;\n            &lt;text id=&quot;item&quot;&gt;&lt;/text&gt;\n        &lt;/list&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>In the list component, each row is known as &quot;rows:iteration&quot;.\nHowever, the repetition also cuts through the transitive caller scopes\ncreating a new scope for instantiated arguments.\nIn this case, the list component creates an &quot;items:row&quot; iteration\nbased on the name of the caller (&quot;items&quot;) and name exported by the list\n(&quot;rows:iteration&quot; gets exported as &quot;row&quot;).</p>\n<p>Thus, from within this essay, we observe the instantiation of &quot;items:row&quot; and\ncan see the value of the iteration.</p>\n<pre><code class=\"lang-js\">module.exports = Essay;\nfunction Essay() {}\nEssay.prototype.add = function (child, id, scope) {\n    var components = scope.components;\n    if (id === &quot;items:row&quot;) {\n        components.item.value = child.value;\n    } else if (id === &quot;this&quot;) {\n        components.items.value = [&quot;Guten Tag, Welt!&quot;, &quot;Auf Widerseh&#39;n, Welt!&quot;];\n    }\n};\n</code></pre>\n";
var see = []
see.push({label: "Guten Tag!", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/args-and-scopes";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/boot.yaml","codi.sh/gutentag","boot.yaml",{"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/boot.yaml
// --------------------------

var body = "<h2 id=\"bootstrapping\">Bootstrapping</h2>\n<p>Every Gutentag application starts with an npm package.\nYou will need a <code>package.json</code>.\nUse <code>npm init</code> to create one.</p>\n<p>You will also need copies of the module system and Gutentag installed locally.\nTags require a module system that can load these HTML modules.\nThe <a href=\"https://github.com/gutentags/system\">System</a> loader supports to-JavaScript translator modules.\nDuring development, System supports loading modules installed by npm without a\nbuild step, provided that the packages are compatible (no support for\ndirectories with an implicit <code>index.js</code>) and that the modules have not been\ndeduped (with <code>npm dedupe</code>).</p>\n<pre><code>$ npm init\n$ npm install --save system\n$ npm install --save koerper\n$ npm install --save gutentag\n</code></pre><p>To enable Mr to load Gutentag HTML or XML files, add a &quot;translators&quot; annotation\nto <code>package.json</code>.</p>\n<pre><code class=\"lang-json\">{\n  &quot;translators&quot;: {\n    &quot;html&quot;: &quot;gutentag/translate-html&quot;,\n    &quot;xml&quot;: &quot;gutentag/translate-xml&quot;\n  }\n}\n</code></pre>\n<p>A Gutentag application starts with a boilerplate <code>index.html</code>.\nThis HTML is suitable for debugging locally with your favorite web server.\nRefreshing the page reloads all modules without incurring a build step.\nYou have the option of using this page as a loading screen if your application\ntakes a significant amount of time to load.\nIt also would host all of your metadata and assets like icons and CSS themes.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;script\n            src=&quot;node_modules/system/boot.js&quot;\n            data-import=&quot;./index&quot;&gt;\n        &lt;/script&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>The HTML calls into the Mr bootstrapping script which in turn loads the entry\nmodule, <code>index.js</code>.\nThis boilerplate module just creates a virtual document, a root scope, and the\nroot component.</p>\n<pre><code class=\"lang-js\">var Document = require(&quot;koerper&quot;);\nvar Scope = require(&quot;gutentag/scope&quot;);\nvar App = require(&quot;app.html&quot;);\n\nvar scope = new Scope();\nvar document = new Document(window.document.body);\nvar app = new App(document.documentElement, scope);\n</code></pre>\n<p>To bundle up your modules for production, System also provides a tool called\nBundle, that operates like Browserify and generates a bundle.\nBundle translates all of the HTML modules into JavaScript and bundles a very\nminimal module system.\nYou can add a build step to your package.json and run it with <code>npm run build</code>.</p>\n<pre><code>{\n  &quot;scripts&quot;: {\n    &quot;build&quot;: &quot;bundle index.js | uglifyjs &gt; bundle.js&quot;\n  }\n}\n</code></pre><p>For my debut Gutentag application, there is a <a href=\"https://github.com/gutentags/tengwar.html/blob/master/build-gh-pages.sh\">build script</a>\nthat rolls up the bundled HTML and CSS directly to a <code>gh-pages</code> branch, suitable\nfor pushing to Github.</p>\n";
var see = []
see.push({label: "Guten Tag!", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/boot";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/builtins.yaml","codi.sh/gutentag","builtins.yaml",{"./text.yaml":20,"./html.yaml":16,"./repeat.yaml":17,"./reveal.yaml":18,"./choose.yaml":12,"./this.yaml":21,"./sp.yaml":19,"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/builtins.yaml
// ------------------------------

var body = "<h2 id=\"tags\">Tags</h2>\n<p>The gutentags project provides the following building block tags, all of which\nhave very simple implementations that you can copy and modify for your needs.\nThey all have a mutable <code>value</code> property.</p>\n<ul>\n<li><code>text.html</code> controls inline text</li>\n<li><code>html.html</code> controls an inline block of HTML</li>\n<li><code>repeat.html</code> repeats its argument</li>\n<li><code>reveal.html</code> shows or hides its argument</li>\n<li><code>choose.html</code> shows one of its argument tags</li>\n</ul>\n<p>There is also a <code>&lt;this&gt;</code> tag for self recursion, and <code>&lt;sp&gt;</code> for explicit space\nsensitivity.</p>\n";
var see = []
see.push({label: "<text>", href: "./text.yaml", value: require("./text.yaml")});
see.push({label: "<html>", href: "./html.yaml", value: require("./html.yaml")});
see.push({label: "<repeat>", href: "./repeat.yaml", value: require("./repeat.yaml")});
see.push({label: "<reveal>", href: "./reveal.yaml", value: require("./reveal.yaml")});
see.push({label: "<choose>", href: "./choose.yaml", value: require("./choose.yaml")});
see.push({label: "<this>", href: "./this.yaml", value: require("./this.yaml")});
see.push({label: "<sp>", href: "./sp.yaml", value: require("./sp.yaml")});
see.push({label: "Guten Tag!", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/builtins";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/choose.yaml","codi.sh/gutentag","choose.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/choose.yaml
// ----------------------------

var body = "<h1 id=\"choose-html\">choose.html</h1>\n<p>Reveals one of its options, as expressed by named child tags, based on its\n<code>value</code>.\nConstructs the children on demand.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./essay&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;../../choose.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;../../repeat.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;../../text.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;repeat id=&quot;buttons&quot;&gt;\n            &lt;button id=&quot;button&quot;&gt;\n                &lt;text id=&quot;buttonLabel&quot;&gt;—&lt;/text&gt;\n            &lt;/button&gt;\n        &lt;/repeat&gt;\n        &lt;choose id=&quot;options&quot;&gt;\n            &lt;a&gt;Police&lt;/a&gt;\n            &lt;b&gt;Officer&lt;/b&gt;\n            &lt;c&gt;Wolves&lt;/c&gt;\n            &lt;d&gt;Old Witch&lt;/d&gt;\n            &lt;e&gt;Going to Sleep&lt;/e&gt;\n        &lt;/choose&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<pre><code class=\"lang-js\">choose.value = &quot;e&quot;;\n</code></pre>\n<p>A <code>&lt;choose id=&quot;options&quot;&gt;</code> tag instantiates one of its choices in a fresh scope\neach time its value changes.\nThe name of that scope comes from the identifier of the component and the given\nvalue, so the iteration would be called &quot;options:e&quot; in this case.</p>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/choose";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/custom.yaml","codi.sh/gutentag","custom.yaml",{"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/custom.yaml
// ----------------------------

var body = "<h1 id=\"custom-tags\">Custom tags</h1>\n<p>The gutentags project provides only the minimum building blocks to get your\nproject started, and establishes a convention for packaging your own tags.</p>\n<p>If your package defines a single tag like <code>autocomplete.html</code>, name your package\n<code>autocomplete.html</code> and define your main module as <code>index.html</code>.</p>\n<pre><code class=\"lang-json\">{\n    &quot;name&quot;: &quot;autocomplete.html&quot;,\n    &quot;description&quot;: &quot;An autocomplete guten tag&quot;,\n    &quot;version&quot;: &quot;1.0.0&quot;,\n    &quot;main&quot;: &quot;./index.html&quot;\n}\n</code></pre>\n<h3 id=\"argument\">Argument</h3>\n<p>Invoking a tag in another tag may use the content between the start and end tag\nin various ways to pass an argument into the called tag.\nTags must express how they receive their argument.</p>\n<ul>\n<li><p><code>&lt;meta accepts=&quot;[body]&quot;&gt;</code> receive the entire argument as a component.\nThe argument is instantiable in HTML tag definitions as the <code>&lt;argument&gt;</code>\ntag.</p>\n<p>Use <code>caller.argument.component</code>, which is a component constructor.</p>\n</li>\n<li><p><code>&lt;meta accepts=&quot;[entries]&quot;&gt;</code> receive each of the child nodes as a named\nargument component. The component constructor will receive an object with\nnamed properties for each component.</p>\n<p>Use <code>caller.argument.children</code>, which is an object mapping the name of the\nchild tag to a component constructor.</p>\n</li>\n<li><p><code>&lt;meta accepts=&quot;[text]&quot;&gt;</code> receives the entire argument as a string\nfrom its <code>innerText</code>.</p>\n<p>Use <code>caller.argument.innerText</code> to access the caller template&#39;s inner text.</p>\n</li>\n<li><p><code>&lt;meta accepts=&quot;[html]&quot;&gt;</code> receives the entire argument as a string\nfrom its <code>innerHTML</code>.</p>\n<p>Use <code>caller.argument.innerHTML</code> to access the caller templates inner HTML.</p>\n</li>\n</ul>\n<p>For example, this tag parenthesizes its argument.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;meta accepts=&quot;[body]&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;(&lt;argument&gt;&lt;/argument&gt;)&lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>The <code>caller.argument</code> object will also have a <code>tagName</code>.\nIn a future version, it may also support attributes and a language for matching\nother DOM patterns.</p>\n";
var see = []
see.push({label: "Guten Tag", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/custom";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/examples.yaml","codi.sh/gutentag","examples.yaml",{"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/examples.yaml
// ------------------------------

var body = "<h1 id=\"examples\">Examples</h1>\n<ul>\n<li><p><a href=\"http://gutentags.github.io/accrete.html/\">Accrete</a> is a clone of the popular 2048 game. The\n<a href=\"https://github.com/gutentags/accrete.html\">source</a> is on Github.</p>\n</li>\n<li><p><a href=\"http://color.codi.sh/\">Colorim</a> is a full page color picker with vim-like keybindings.\n<a href=\"https://github.com/gutentags/colorim.html\">source</a> is on Github,\nand this component can be installed from npm to incorporate in\nyour source.</p>\n</li>\n<li><p><a href=\"https://gutentags.github.io/tengwar.html/\">Tengwar Transcriber</a> is a tool for transcribing into the Elvish alphabet\nusing various web fonts.\n<a href=\"https://github.com/gutentags/tengwar.html\">source</a> is on Github.</p>\n</li>\n<li><p><code>codi.sh</code> is a Guten Tag application.\n<a href=\"https://github.com/kriskowal/codi.sh\">source</a> is on Github.</p>\n</li>\n</ul>\n";
var see = []
see.push({label: "Guten Tag!", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/examples";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/features.yaml","codi.sh/gutentag","features.yaml",{"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/features.yaml
// ------------------------------

var body = "<h1 id=\"features-of-guten-tags\">Features of Guten Tags</h1>\n<p>Guten tags express their dependencies on other tags using links with the &quot;tag&quot;\nrelationship in their <code>&lt;head&gt;</code>.\nIn this examle, we import the <code>&lt;repeat&gt;</code> and <code>&lt;text&gt;</code> tags from Guten Tag\nmodules.</p>\n<pre><code class=\"lang-html\">&lt;head&gt;\n    &lt;link rel=&quot;extends&quot; href=&quot;./list&quot;&gt;\n    &lt;link rel=&quot;tag&quot; href=&quot;gutentag/repeat.html&quot;&gt;\n    &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n&lt;/head&gt;\n</code></pre>\n<p>Guten tags have a lexical scope for component and element identifiers, and can\nintroduce components into caller scopes under the identifier of the caller.\nIn this example, there is a repetition with an id of &quot;items&quot; that introduces\n&quot;items:iteration&quot; in the iteration scopes from the body of the repetition.</p>\n<pre><code class=\"lang-html\">&lt;ul&gt;&lt;repeat id=&quot;items&quot;&gt;\n    &lt;li id=&quot;item&quot; type=&quot;a&quot;&gt;&lt;text id=&quot;text&quot;&gt;&lt;/text&gt;&lt;/li&gt;\n&lt;/repeat&gt;&lt;/ul&gt;\n</code></pre>\n<p>Guten tag only provides the <code>&lt;text&gt;</code>, <code>&lt;html&gt;</code>, <code>&lt;repeat&gt;</code>, <code>&lt;reveal&gt;</code>, and\n<code>&lt;choose&gt;</code> tags and the system for loading tags.\nBring your own bindings, shims, data, animation, or virtual document if you need\nthem.\nThe &quot;Guten Tag, Welt!&quot; application is about 15K and 3K after uglify and gzip.</p>\n<p>A tag is defined in HTML or XML and can import tags from other HTML modules.\nThis <code>list.html</code> tag produces a list at whatever point in a document you\nincorporate it.\nAn instance of a tag is a component.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./list&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/repeat.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;ul&gt;&lt;repeat id=&quot;items&quot;&gt;\n            &lt;li id=&quot;item&quot; type=&quot;a&quot;&gt;&lt;text id=&quot;text&quot;&gt;&lt;/text&gt;&lt;/li&gt;\n        &lt;/repeat&gt;&lt;/ul&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>A JavaScript module, <code>list.js</code>, connects the components of the list.\nThe HTML module exports a constructor for the module and calls into the <code>add</code>\nmethod of the underlying JavaScript implementation, if it exists.</p>\n<pre><code class=\"lang-js\">&#39;use strict&#39;;\nmodule.exports = List;\nfunction List() {}\nList.prototype.add = function (child, id, scope) {\n    if (id === &quot;items:iteration&quot;) {\n        scope.text.value = child.value;\n    } else if (id === &quot;this&quot;) {\n        this.items = scope.items;\n    }\n};\n</code></pre>\n<p>Trivial tags can live without an underlying JavaScript implementation.</p>\n<p>Tags modules compile to JavaScript that export a component constructor..\nThe constructor accepts a <code>body</code> and a <code>caller</code> scope.</p>\n<pre><code>&quot;use strict&quot;;\nmodule.exports = Component;\nfunction Component(body, caller) {\n    this.scope = caller.root.nestComponents();\n    body.appendChild(document.createTextNode(&quot;Guten Tag, Welt!\\n&quot;));\n}\n</code></pre><p>The <code>body</code> is a special kind of node in a virtual document.\nIt represents a point in the actual document that the given tag will control.\nBodies can be added and removed from the virtual document, and all of their\ncontent will be (synchronously) added or removed from the actual document.\nHowever, bodies do not introduce a container element, like a <code>&lt;div&gt;</code>.\nThis is critical for the Gutenttag structural tags, <code>&lt;repeat&gt;</code>, <code>&lt;reveal&gt;</code>, and\n<code>&lt;choose&gt;</code>, since you may or may not need a container element around them or\ninside them, and you may want one or more of these inline.</p>\n<pre><code class=\"lang-html\">&lt;table&gt;\n    &lt;tr&gt;\n        &lt;th&gt;&lt;!-- corner --&gt;&lt;/th&gt;\n        &lt;th id=&quot;groupOneHeader&quot; colspan=&quot;&quot;&gt;&lt;/th&gt;\n        &lt;th id=&quot;groupTwoHeader&quot; colspan=&quot;&quot;&gt;&lt;/th&gt;\n    &lt;/tr&gt;\n    &lt;tr&gt;\n        &lt;th&gt;&lt;text id=&quot;rowHeader&quot;&gt;&lt;/text&gt;&lt;/th&gt;\n        &lt;repeat id=&quot;groupOne&quot;&gt;\n            &lt;td&gt;&lt;text id=&quot;cell&quot;&gt;&lt;/text&gt;&lt;/td&gt;\n        &lt;/repeat&gt;\n        &lt;repeat id=&quot;groupTwo&quot;&gt;\n            &lt;td&gt;&lt;text id=&quot;cell&quot;&gt;&lt;/text&gt;&lt;/td&gt;\n        &lt;/repeat&gt;\n    &lt;/tr&gt;\n&lt;/table&gt;\n</code></pre>\n<p>In other cases, having a wrapper element would interfere with CSS selectors,\nparticularly for the flex model, or would interfere with semantic markup.</p>\n<pre><code class=\"lang-html\">&lt;repeat id=&quot;stanzas&quot;&gt;&lt;p class=&quot;stanza&quot;&gt;\n    &lt;repeat id=&quot;lines&quot;&gt;\n        &lt;text id=&quot;line&quot;&gt;&lt;/text&gt;\n        &lt;reveal id=&quot;medial&quot;&gt;&lt;br&gt;&lt;/reveal&gt;\n    &lt;/repeat&gt;\n&lt;/p&gt;&lt;/repeat&gt;\n</code></pre>\n<p>Sometimes it is useful to compose text without container elements at all.</p>\n<pre><code class=\"lang-html\">&lt;sp&gt;&lt;text id=&quot;hello&quot;&gt;, &lt;text id=&quot;person&quot;&gt;!&lt;/sp&gt;\n</code></pre>\n<p>The <code>caller</code> object is a scope container that inherits properties along its\nprototype chain up to the root scope.\nThis makes the root scope object an ideal container for dependency injection.\nThe <code>scope.root</code> refers to that root scope from any descendant scope.\nEach scope also has a direct reference to its <code>scope.parent</code>.</p>\n<p>In a component, <code>scope.this</code> will always refer to the component instantiated by\ncontaining tag document.\nSo, in <code>foo.html</code>, <code>scope.this</code> is the containing instance of the <code>Foo</code>\ncomponent.\nThe <code>scope.components</code> object maps component identifiers in that scope to their\ncorresponding component instance.</p>\n<p>Every subcomponent has a scope, but many scopes share the same\n<code>scope.components</code>.\nThe body of an HTML tag is the root of a lexical scope and introduces an empty\n<code>scope.components</code> object to which each child component adds itslef.\nIn this example, the <code>scope.components</code> object will have <code>hello</code> and <code>person</code>\ncomponents.\nNote that Gutentags trim implied white space between tags and the <code>&lt;sp&gt;</code> special\ntag notes explicit template text.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;text id=&quot;hello&quot;&gt;&lt;/text&gt;&lt;sp&gt;, &lt;/sp&gt;\n        &lt;text id=&quot;person&quot;&gt;!\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>The Gutentag building blocks, <code>&lt;repeat&gt;</code>, <code>&lt;reveal&gt;</code>, and <code>&lt;choose&gt;</code> create\nchild scopes that introduce a new <code>scope.components</code> object that inherits\nprototypically from the containing scope&#39;s components,\n<code>scope.parent.components</code>.\nIn this example, the &quot;hello&quot; and &quot;person&quot; components are each within a\n&quot;greetings:iteration&quot; component and have access to <code>scope.components.header</code>,\nbut from the perspective of the &quot;header&quot;, it is in a scope by itself.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/repeat.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;h1&gt;&lt;text id=&quot;header&quot;&gt;&lt;/h1&gt;\n        &lt;repeat id=&quot;greetings&quot;&gt;\n            &lt;text id=&quot;hello&quot;&gt;&lt;/text&gt;&lt;sp&gt;, &lt;/sp&gt;\n            &lt;text id=&quot;person&quot;&gt;!\n        &lt;/repeat&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>Each scope may also have a <code>scope.caller</code> property, referring to the lexical\nscope of the tag that instantiated this component, and a <code>scope.argument</code>\nreferring to a template for the content of the instantiating tag.</p>\n<p>Instantiating a tag from within a tag also passes its inner content as a\ntemplate in the form requested by that tag through its <code>&lt;meta accepts&gt;</code> header.\nFor example, <code>text.html</code> has <code>&lt;meta accepts=&quot;[text]&quot;&gt;</code>, <code>repeat.html</code> has <code>&lt;meta\naccepts=&quot;[body]&quot;&gt;</code>, and <code>choose.html</code> has <code>&lt;meta accepts=&quot;[entries]&quot;&gt;</code>.\nEach of these packs the content into <code>caller.argument</code> in the fashion expected\nby the component.</p>\n";
var see = []
see.push({label: "Guten Tag!", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/features";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/html.yaml","codi.sh/gutentag","html.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/html.yaml
// --------------------------

var body = "<h3 id=\"html-html\">html.html</h3>\n<p>An HTML tag controls the HTML that appears at its position based on its <code>value</code>\nproperty.\nLike a text tag, the HTML tag does not introduce a wrapper element.\nNote that <code>html</code> is a special tag in the HTML5 vocabulary, so this tag has to be\nlinked by an alternate tag name or used in XML.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/html.html&quot; as=&quot;x-html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;x-html id=&quot;description&quot;&gt;&lt;/x-html&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<pre><code class=\"lang-js\">html.value = &quot;&lt;b&gt;Bold &lt;i&gt;and&lt;/b&gt; italic&lt;/b&gt;&lt;/i&gt;&quot;;\n</code></pre>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/html";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/repeat.yaml","codi.sh/gutentag","repeat.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/repeat.yaml
// ----------------------------

var body = "<h1 id=\"repeat-html\">repeat.html</h1>\n<p>Repeats its content based on the values in the given <code>value</code> array.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./list&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/repeat.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;ul&gt;&lt;repeat id=&quot;items&quot;&gt;\n            &lt;li id=&quot;item&quot; type=&quot;a&quot;&gt;&lt;text id=&quot;text&quot;&gt;&lt;/text&gt;&lt;/li&gt;\n        &lt;/repeat&gt;&lt;/ul&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>The repetition creates a scope for each of its iterations.\nIn that scope, the iteration object is accessible by a name constructed from the\nid of the iteration, plus &quot;:iteration&quot;.\nThe iteration object has an <code>index</code> and a <code>value</code> property.</p>\n<pre><code class=\"lang-js\">&#39;use strict&#39;;\nmodule.exports = List;\nfunction List() {}\nList.prototype.add = function (component, id, scope) {\n    var components = scope.components;\n    if (id === &quot;items:iteration&quot;) {\n        components.text.value = component.value;\n    }\n};\n</code></pre>\n<p>The repetition creates new iterations on demand and reacts to changes to the\ngiven values array.</p>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/repeat";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/reveal.yaml","codi.sh/gutentag","reveal.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/reveal.yaml
// ----------------------------

var body = "<h1 id=\"reveal-html\">reveal.html</h1>\n<p>Reveals its content based on whether <code>value</code> is truthy.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./blink&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/reveal.html&quot;&gt;\n        &lt;meta accepts=&quot;[body]&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;reveal id=&quot;content&quot;&gt;&lt;argument&gt;&lt;/argument&gt;&lt;/reveal&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n```html\n\n```js\n&#39;use strict&#39;;\nmodule.exports = Blink;\nfunction Blink() {}\nBlink.prototype.add = function (component, id) {\n    if (id === &quot;content&quot;) {\n        setInterval(function () {\n            component.value = !component.value;\n        }, 1000);\n    }\n}\n</code></pre>\n<p>A <code>&lt;reveal id=&quot;content&quot;&gt;</code> tag instantiates its inner content in a\n<code>content:revelation</code> scope each time it reveals that content.</p>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/reveal";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/sp.yaml","codi.sh/gutentag","sp.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/sp.yaml
// ------------------------

var body = "<h1 id=\"space\">Space</h1>\n<p>Unlike normal HTML, by default, white space is treated as insignificant.\nAll text nodes are trimmed and thrown away if they only contain spaces.\nHowever, there is a built in <code>&lt;sp&gt;</code> tag that explicitly marks parts of the\ndocument where white space is significant.\nIn these regions, sequences of space are preserved.\nIn the following example, the string &quot;Guten Tag, Welt!&quot; is repeated for every\nvalue of the greetings iteration.\nThe <code>&lt;sp&gt;</code> tag ensures that these greetings are delimited by space.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;../../repeat.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;repeat id=&quot;greetings&quot;&gt;&lt;sp&gt;Guten Tag, Welt! &lt;/sp&gt;&lt;/repeat&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/sp";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/text.yaml","codi.sh/gutentag","text.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/text.yaml
// --------------------------

var body = "<h1 id=\"text-html\">text.html</h1>\n<p>A text tag controls a text node based on its <code>value</code> property.\nThe default text, if its value property is <code>null</code> or <code>undefined</code>, is the\ninnerText of the argument.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;text id=&quot;description&quot;&gt;Beschreibung bevorstehende.&lt;/text&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<pre><code class=\"lang-js\">text.value = &quot;Guten Tag, Welt!&quot;;\n</code></pre>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/text";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/this.yaml","codi.sh/gutentag","this.yaml",{"./builtins.yaml":11},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/this.yaml
// --------------------------

var body = "<h3 id=\"this\">This</h3>\n<p>Components support self recursion. This is useful for creating trees.\nThe <code>&lt;this&gt;&lt;/this&gt;</code> tag stands for this component.</p>\n<pre><code class=\"lang-html\">&lt;!doctype html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./tree&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;../../text.html&quot;&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;../../repeat.html&quot;&gt;\n        &lt;meta accepts=&quot;[body]&quot;&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;argument&gt;&lt;/argument&gt;\n        &lt;ul&gt;\n            &lt;repeat id=&quot;children&quot;&gt;\n                &lt;li&gt;&lt;this id=&quot;child&quot;&gt;&lt;argument&gt;&lt;/argument&gt;&lt;/this&gt;&lt;/li&gt;\n            &lt;/repeat&gt;\n        &lt;/ul&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n";
var see = []
see.push({label: "Built in Tags", href: "./builtins.yaml", value: require("./builtins.yaml")});
var slug = "gutentag/this";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["gutentag/xml.yaml","codi.sh/gutentag","xml.yaml",{"../gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/gutentag/xml.yaml
// -------------------------

var body = "<h1 id=\"xml\">XML</h1>\n<p>Gutentag supports XML for cases where the HTML5 parser gets in your way.\nFor example, the HTML5 parser does not allow a <code>&lt;repeat&gt;</code> tag to exist within\na <code>&lt;table&gt;</code>. XML does.</p>\n<pre><code class=\"lang-xml\">&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=&quot;extends&quot; href=&quot;./grid&quot;/&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/repeat.html&quot;/&gt;\n        &lt;link rel=&quot;tag&quot; href=&quot;gutentag/text.html&quot;/&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n        &lt;table&gt;\n            &lt;thead&gt;\n                &lt;tr id=&quot;columnRow&quot;&gt;\n                    &lt;th&gt;&lt;/th&gt;\n                    &lt;repeat id=&quot;columns&quot;&gt;\n                        &lt;th&gt;&lt;text id=&quot;ch&quot;/&gt;&lt;/th&gt;\n                    &lt;/repeat&gt;\n                &lt;/tr&gt;\n            &lt;/thead&gt;\n            &lt;tbody&gt;\n                &lt;repeat id=&quot;rows&quot;&gt;\n                    &lt;th&gt;&lt;text id=&quot;rh&quot;/&gt;&lt;/th&gt;\n                    &lt;repeat id=&quot;cells&quot;&gt;\n                        &lt;td&gt;&lt;text id=&quot;cd&quot;/&gt;&lt;/td&gt;\n                    &lt;/repeat&gt;\n                &lt;/repeat&gt;\n            &lt;/tbody&gt;\n        &lt;/table&gt;\n    &lt;/body&gt;\n&lt;/html&gt;\n</code></pre>\n<p>Guten Tag uses the <a href=\"https://github.com/montagejs/domenic\">Domenic</a> module for XML and HTML parsing both in Node.js\nand in the browser.\nThis provides a thin abstraction for document parsing provided by the native\nDOM parser on the client side or one of two modules for XML and HTML parsing in\nNode.js.</p>\n<p>It would be good to replace both HTML and XML parsing with an SGML parser tuned\nfor the needs of Guten Tag.\nSpecifically, none of these DOM parsers bring source locations to the surface,\nwhich would be necessary for generating HTML to JavaScript <a href=\"http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/\">Source Maps</a>.\nWith guten tags, it would also be possible for each component to declare how it\nwishes to be handled, with regard to auto-closing tags.\nFor these, I am looking to possibly build on <a href=\"[https://github.com/fb55/htmlparser2\">htmlparser2</a>.</p>\n";
var see = []
see.push({label: "Guten Tag!", href: "../gutentag.yaml", value: require("../gutentag.yaml")});
var slug = "gutentag/xml";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["history.js","codi.sh","history.js",{},function (require, exports, module, __filename, __dirname){

// codi.sh/history.js
// ------------------

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

}],["index.js","codi.sh","index.js",{"url":64,"blick":0,"./history":23,"gutentag/document":37,"gutentag/scope":44,"./main.html":28,"./attention.js":2,"./index.yaml":25},function (require, exports, module, __filename, __dirname){

// codi.sh/index.js
// ----------------

"use strict";

var URL = require("url");
var Animator = require("blick");
var History = require("./history");

var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Main = require("./main.html");
var Attention = require("./attention.js");
var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.attention = new Attention();
scope.history = new History(window);
scope.main = new Main(document.documentElement, scope);
scope.history.handler = scope.main;

var documents = {};
function collect(document, documents) {
    if (!document.head.slug) {
        return;
    }
    if (documents[document.head.slug]) {
        return;
    }
    documents[document.head.slug] = document;
    document.head.see.forEach(function (link) {
        collect(link.value, documents);
    });
}
collect(require("./index.yaml"), documents);

scope.main.documents = documents;
scope.history.update();
scope.main.focus();


}],["index.yaml","codi.sh","index.yaml",{"./q.yaml":34,"./collections.yaml":4,"./operators.yaml":31,"./observers.yaml":30,"./bindings.yaml":3,"./system.yaml":36,"./gutentag.yaml":8},function (require, exports, module, __filename, __dirname){

// codi.sh/index.yaml
// ------------------

var body = "<h1 id=\"a-cohort-of-packages\">A Cohort of Packages</h1>\n<p>Long ago, I set out with my friend, <a href=\"https://twitter.com/segphault\">Ryan Paul</a>, on a quest to create a text\nadventure for a new generation.\nRyan used to run a MUD called <em>Magic of Middle-earth</em>, based on the <a href=\"https://en.wikipedia.org/wiki/SMAUG\">SMAUG</a>\nengine.\nI was attracted to the richenss of potential in the creactive medium of\ndescription, narrative, and interaction.\nRyan went on to write the open source column for <a href=\"http://arstechnica.com/\">Ars Technica</a> for many\nyears and has since done technical evangelism for <a href=\"http://xamarin.com/\">Xamarin</a>, <a href=\"http://montagestudio.com/montagejs/\">MontageJS</a>,\nand <a href=\"http://rethinkdb.com/\">RethinkDB</a>.</p>\n<p>Imagining and reimagining this project has been the braid that connects nearly\nevery project I have worked on since.</p>\n<p>As an artist, this journey led me to learn Inkscape and how to pen calligraphy.\nAs a Tolkienist, it led me to learn how to transcribe Elvish, make a <a href=\"http://3rin.gs\">map of\nMiddle-earth</a>, and build <a href=\"http://3rin.gs/tengwar/\">tengwar</a>\n<a href=\"http://gutentags.github.io/tengwar.html/\">transcribers</a>.\nAs a young programmer, I learned <a href=\"https://en.wikipedia.org/wiki/XUL\">XUL</a> and how to make Firefox extensions, so\nI could take advantage of XPConnect&#39;s TCP socket.\nI learned Perl to hack out CGI essays.\nIt led me to learn how to images with text server side using the <a href=\"http://www.pythonware.com/products/pil/\">Python\nImaging Library</a>.</p>\n<p>I learned C++, template metaprogramming, and BSD socket server programming in\nan ill-fated attempt to rebuild the game engine with a more modular design.\nI learned Python and Twisted in another <a href=\"https://github.com/kriskowal/planes\">ill-fated\nattempt</a> to rebuild the engine.\nThrough this project, another friend, <a href=\"https://twitter.com/onecreativenerd\">Ryan Witt</a>, introduced me to\n<a href=\"https://en.wikipedia.org/wiki/Chord_(peer-to-peer)\">Chord</a>, a peer to peer distributed hash table algorithm, and <a href=\"https://en.wikipedia.org/wiki/Quadtree\">Quadtrees</a>,\nwhich seemed like the obvious way to shard a massive MUD engine.</p>\n<p>And when I decided to reimagine the game as a web client, web sockets were on\nthe horizon and it became quickly obvious that JavaScript did not have a\nmodule system.\nSo I studied the problem and ultimately wrote the <a href=\"http://wiki.commonjs.org/wiki/Modules\">CommonJS</a> module system,\npopularized by <a href=\"https://nodejs.org/\">Node.js</a>.\nIn turn, searching for allies to make JavaScript modules a reality led me to\nmeet <a href=\"https://en.wikipedia.org/wiki/Mark_S._Miller\">Mark S. Miller</a> who in turn introduced me to both <a href=\"https://esdiscuss.org/\">TC39</a> and\n<a href=\"http://www.erights.org/talks/thesis/\">Promises</a>.\nMark introduced me to the work of <a href=\"http://www.waterken.com/about/\">Tyler Close</a>, who had created the\nprimordial Q library from which I wrought <a href=\"https://github.com/kriskowal/q\">Q</a> for <a href=\"https://www.npmjs.com/\">npm</a>.\n<a href=\"https://blog.domenic.me/\">Domenic Denicola</a> eventually joined me and became instrumental not only in\nevolving and maintaining Q, but carrying Mark’s and my designs into ECMAScript\n2015.</p>\n<p>My mission to further the JavaScript module system led to a collaboration with\n<a href=\"https://twitter.com/tlrobinson\">Tom Robinson</a> of <a href=\"https://en.wikipedia.org/wiki/280_North,_Inc.\">280 North</a> on <a href=\"https://github.com/280north/narwhal\">NarwhalJS</a> and eventually that led me\nto join Motorola to work on <a href=\"http://montagestudio.com/montagejs/\">MontageJS</a>, another MVC framework for the web\ninspired by <a href=\"https://en.wikipedia.org/wiki/Cocoa_(API)\">Cocoa</a>.\nWorking on Montage, I eventually also took over the maintenance of its\nsynchronous data bindings system and wrote <a href=\"https://github.com/kriskowal/collections\">Collections</a> and <a href=\"https://github.com/montagejs/frb\">FRB</a>,\nadapting parts of what was already there written by <a href=\"https://twitter.com/aadsm\">Antonio Afonso</a>, <a href=\"https://twitter.com/mczepiel\">Mike\nCzepiel</a>, and <a href=\"https://twitter.com/francoisfrisch\">Francois Frisch</a> under he direction of <a href=\"https://twitter.com/benoitmarchant\">Benoît Marchant</a>\nand <a href=\"https://www.linkedin.com/in/pierrefrisch\">Pierre Frisch</a>.\n<a href=\"https://twitter.com/stuk\">Stuart Knightly</a> has since been instrumental in the collections effort,\nparticularly the initiative to create the documentation on\n<a href=\"http://www.collectionsjs.com/\">collectionsjs.com</a>.</p>\n<p>I now work at Uber on a distributed system that incorporates a Chord-like\nring called <a href=\"https://github.com/uber/ringpop\">Ringpop</a>, a robust connection pooling and RPC multiplexing\nsystem called <a href=\"https://github.com/uber/tchannel\">TChannel</a>, and an elastic service index and network overlay\nthat combines them.\nThis has given me a chance to get my hands on a real distributed system\nthat so closely resembles some of those nascent designs for a distributed MUD\nand work with fantastic engineers including <a href=\"https://twitter.com/raynos\">Jake Verbaten</a> (known by most as\nRaynos), <a href=\"https://twitter.com/JoshuaTCorbin\">Joshua Corbin</a>, <a href=\"https://github.com/jwolski\">Jeff Wolski</a>, and our architect <a href=\"https://twitter.com/mranney\">Matt Ranney</a>.</p>\n<p>Fundamental programming concepts, including modules, asynchronous IO and event\nloops, promises and actors, synchronous and asynchronous bindings, operational\ntransforms, collections, streams, and RPC it seems to me are all part of a\ncoherent story, a story that starts for me with a deceptively low-fidelity\nsimulation game.\nTo that end, I have published upward of 60 carefully designed, loosely coupled,\nbut coherent JavaScript modules to <a href=\"https://github.com/kriskowal\">Github</a> and <a href=\"https://www.npmjs.com/\">npm</a>, and have intentions\nand designs to, hopefully with your help, expand this territory.</p>\n<p>This is a catalog of those JavaScript packages and the ongoing effort to expand\nupon them.</p>\n<p>— Kris Kowal, 2015</p>\n";
var see = []
see.push({label: "Q Promises", href: "./q.yaml", value: require("./q.yaml")});
see.push({label: "Collections", href: "./collections.yaml", value: require("./collections.yaml")});
see.push({label: "Operators", href: "./operators.yaml", value: require("./operators.yaml")});
see.push({label: "Change Observers", href: "./observers.yaml", value: require("./observers.yaml")});
see.push({label: "Bindings", href: "./bindings.yaml", value: require("./bindings.yaml")});
see.push({label: "Module System", href: "./system.yaml", value: require("./system.yaml")});
see.push({label: "Guten Tag, HTML Modules!", href: "./gutentag.yaml", value: require("./gutentag.yaml")});
var slug = "index";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["list.html","codi.sh","list.html",{"./list":27,"gutentag/repeat.html":40},function (require, exports, module, __filename, __dirname){

// codi.sh/list.html
// -----------------

"use strict";
var $SUPER = require("./list");
var $REPEAT = require("gutentag/repeat.html");
var $THIS = function CodishList(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("UL");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("optionsList", component);
    if (component.setAttribute) {
        component.setAttribute("id", "optionsList_fu9im");
    }
    if (scope.componentsFor["optionsList"]) {
       scope.componentsFor["optionsList"].setAttribute("for", "optionsList_fu9im")
    }
    if (component.setAttribute) {
    component.setAttribute("class", "options");
    }
    parents[parents.length] = parent; parent = node;
    // UL
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "options";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("options", component);
        if (component.setAttribute) {
            component.setAttribute("id", "options_tyrndn");
        }
        if (scope.componentsFor["options"]) {
           scope.componentsFor["options"].setAttribute("for", "options_tyrndn")
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {"options:iteration":"iteration"};
module.exports = $THIS;
var $THIS$0 = function CodishList$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("LI");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
    component.setAttribute("class", "optionItem");
    }
    parents[parents.length] = parent; parent = node;
    // LI
        node = document.createElement("A");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("optionLink", component);
        if (component.setAttribute) {
            component.setAttribute("id", "optionLink_8o5i7k");
        }
        if (scope.componentsFor["optionLink"]) {
           scope.componentsFor["optionLink"].setAttribute("for", "optionLink_8o5i7k")
        }
        if (component.setAttribute) {
        component.setAttribute("class", "option");
        }
        parents[parents.length] = parent; parent = node;
        // A
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // OPTION
                node = {tagName: "option"};
                node.component = $THIS$0$1;
                callee = scope.caller.nest();
                if (callee.argument) {
                    callee.id = "option";
                    component = new callee.argument.component(parent, callee);
                } else {
                    component = new node.component(parent, scope);
                }
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("option", component);
            if (component.setAttribute) {
                component.setAttribute("id", "option_euvux7");
            }
            if (scope.componentsFor["option"]) {
               scope.componentsFor["option"].setAttribute("for", "option_euvux7")
            }
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1 = function CodishList$0$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["list.js","codi.sh","list.js",{"./direction-event-translator":7},function (require, exports, module, __filename, __dirname){

// codi.sh/list.js
// ---------------

"use strict";

var DirectionEventTranslator = require("./direction-event-translator");

module.exports = List;

function List(body, scope) {
    this.navigator = null;
    this.optionsComponent = null;
    this.optionsElement = null;
    this.activeIndex = null;
    this.activeIteration = null;
    this.directionEventTranslator = new DirectionEventTranslator(this);
    this.attention = scope.attention;
}

Object.defineProperty(List.prototype, "options", {
    set: function set(options) {
        this.optionsComponent.value = options;
    },
    get: function get() {
        return this.optionsComponent.value;
    }
});

List.prototype.hookup = function hookup(id, component, scope) {
    if (id === "this") {
        this.optionsComponent = scope.components.options;
        this.optionsElement = scope.components.optionsList;
    } else if (id === "options:iteration") {
        scope.components.optionLink.addEventListener("click", this);
        scope.components.optionLink.setAttribute("href", "");
        scope.components.optionLink.component = component;
    }
};

List.prototype.handleEvent = function handleEvent(event) {
    if (event.type === "click") {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.component) {
            this.activateIteration(event.target.component);
            return this.navigator.navigate(event.target.component.value);
        }
    }
};

List.prototype.handleEscape = function handleEscape(event) {
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
};

List.prototype.handleEnter = function handleEnter(event) {
    if (this.activeIteration) {
        this.navigator.navigate(this.activeIteration.value);
    }
};

List.prototype.handleRight = function handleRight(event) {
    this.handleEnter(event);
};

List.prototype.activateIteration = function activateIteration(iteration) {
    if (!iteration) {
        throw new Error("Can't activate null iteration");
    }
    if (this.activeIteration) {
        this.deactivateIteration(this.activeIteration);
    }
    var optionLink = iteration.scope.components.optionLink;
    optionLink.classList.add("optionActive");
    this.activeIteration = iteration;
    this.navigator.activate(this.activeIteration.value);
};

List.prototype.deactivateIteration = function deactivateIteration(iteration) {
    this.navigator.deactivate(iteration.value);
    var optionLink = iteration.scope.components.optionLink;
    optionLink.classList.remove("optionActive");
    this.activeIteration = null;
};

List.prototype.handleDown = function handleDown(event) {
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index + 1) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.handleUp = function handleUp(event) {
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        var index = this.activeIteration.index;
        index = (index - 1 + iterations.length) % iterations.length;
        this.activateIteration(iterations[index]);
    } else if (iterations.length) {
        this.activateIteration(iterations[0]);
    }
};

List.prototype.scrollIntoView = function scollIntoView() {
    this.optionsElement.scrollIntoView();
};

List.prototype.focus = function focus() {
    this.attention.take(this);
    this.directionEventTranslator.focus();
    var iterations = this.optionsComponent.iterations;
    if (this.activeIteration) {
        this.activeIteration.scope.components.optionLink.classList.add("optionActive");
    }
};

List.prototype.blur = function blur() {
    this.directionEventTranslator.blur();
    if (this.activeIteration) {
        this.activeIteration.scope.components.optionLink.classList.remove("optionActive");
    }
};

}],["main.html","codi.sh","main.html",{"./main":29,"./columns.html":5,"./page.html":32},function (require, exports, module, __filename, __dirname){

// codi.sh/main.html
// -----------------

"use strict";
var $SUPER = require("./main");
var $COLUMNS = require("./columns.html");
var $PAGE = require("./page.html");
var $THIS = function CodishMain(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("document", component);
    if (component.setAttribute) {
        component.setAttribute("id", "document_oz70yc");
    }
    if (scope.componentsFor["document"]) {
       scope.componentsFor["document"].setAttribute("for", "document_oz70yc")
    }
    if (component.setAttribute) {
    component.setAttribute("class", "document");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // COLUMNS
            node = {tagName: "columns"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "pages";
            component = new $COLUMNS(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("pages", component);
        if (component.setAttribute) {
            component.setAttribute("id", "pages_6zp0u");
        }
        if (scope.componentsFor["pages"]) {
           scope.componentsFor["pages"].setAttribute("for", "pages_6zp0u")
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("help", component);
    if (component.setAttribute) {
        component.setAttribute("id", "help_qg98op");
    }
    if (scope.componentsFor["help"]) {
       scope.componentsFor["help"].setAttribute("for", "help_qg98op")
    }
    if (component.setAttribute) {
    component.setAttribute("class", "help");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "helpOption");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            parent.appendChild(document.createTextNode("u/d/space: scroll up/down"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "helpOption");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            parent.appendChild(document.createTextNode("g: top"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "helpOption");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            parent.appendChild(document.createTextNode("G: bottom"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "helpOption");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            parent.appendChild(document.createTextNode("j/k: next/prev option"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "helpOption");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            parent.appendChild(document.createTextNode("l/h: next/prev column"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function CodishMain$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // PAGE
        node = {tagName: "page"};
        node.component = $THIS$0$1;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "page";
        component = new $PAGE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("page", component);
    if (component.setAttribute) {
        component.setAttribute("id", "page_h6y4fh");
    }
    if (scope.componentsFor["page"]) {
       scope.componentsFor["page"].setAttribute("for", "page_h6y4fh")
    }
};
var $THIS$0$1 = function CodishMain$0$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["main.js","codi.sh","main.js",{},function (require, exports, module, __filename, __dirname){

// codi.sh/main.js
// ---------------

'use strict';

module.exports = Main;

function Main() {
}

Object.defineProperty(Main.prototype, "documents", {
    get: function get() {
    },
    set: function set(_documents) {
        this._documents = _documents;
    }
});

Main.prototype.setPath = function setPath(path) {
    this.pages.setPath(path);
};

Main.prototype.hookup = function (id, component, scope) {
    if (id === "this") {
        this.pages = scope.components.pages;
    } else if (id === "pages:iteration") {
        var document = this._documents[component.value];
        scope.components.page.value = document;
        scope.components.page.navigationIndex = component.index;
        scope.components.page.navigator = scope.components.pages;
        component.path = document.head.slug;
        component.focus = focusIteration;
        component.handleEnter = handleEnterIteration;
        component.focusDelegate = scope.components.page;
    }
};

function focusIteration() {
    this.focusDelegate.focus();
}

function handleEnterIteration() {
    this.focusDelegate.handleEnter();
}

Main.prototype.focus = function focus() {
    this.pages.focus();
};

}],["observers.yaml","codi.sh","observers.yaml",{"./collections.yaml":4,"./operators.yaml":31},function (require, exports, module, __filename, __dirname){

// codi.sh/observers.yaml
// ----------------------

var body = "<h1 id=\"-observers-pop-observe-\"><a href=\"https://github.com/kriskowal/pop-observe\">Observers</a></h1>\n<p>The <a href=\"https://github.com/kriskowal/pop-observe\">pop-observe</a> package makes it possible to observe changes to arrays and\nother collections.\nChanges come in three kinds, all of which are meaningful for arrays, some of\nwhich are applicable to other collections and can be implemented by others.</p>\n<ul>\n<li>property changes, including the length of an array</li>\n<li>range changes, from swapping some values at an index for some other values</li>\n<li>map changes, from changing the value at a key or index</li>\n</ul>\n<p>Change observer functions, like <code>observeRangeChange</code>, accept the object to\nobserve and a change handler function, or change handler object with a\ndistinguished method like <code>handleRangeChange</code>.</p>\n<p>Change observer functions can be stacked.\nCalling such a funcion returns an observer object with a <code>cancel()</code> method.\nThat observer object can be returned by a change handler function.\nSo, if <code>handleRangeChange</code> were to return an observer, the parent observer\nwould cancel it before calling <code>handleRangeChange</code> again.</p>\n<p>Change observers are the primitive from which we can build synchronous data\nbindings.</p>\n<p>For example, stacking observers is the heart of the design of MontageJS’s\n<a href=\"https://github.com/montagejs/frb\">FRB</a>, though FRB has not been updated to use this library.\nIt uses the change listeners provided in <a href=\"https://github.com/montagejs/collections\">Version 1 of\nCollections</a>.\nThe intent is to rebuild FRB, or something very much like FRB, using POP\nObservers.</p>\n";
var see = []
see.push({label: "Collections", href: "./collections.yaml", value: require("./collections.yaml")});
see.push({label: "Polymorphic Operators", href: "./operators.yaml", value: require("./operators.yaml")});
var slug = "observers";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["operators.yaml","codi.sh","operators.yaml",{"./observers.yaml":30},function (require, exports, module, __filename, __dirname){

// codi.sh/operators.yaml
// ----------------------

var body = "<h1 id=\"operators-and-polymorphism\">Operators and Polymorphism</h1>\n<p>Within a corhort of modules, any pair of functions with the same symbol or name\nshould fulfill a common contract, regardless of what type they operate on,\nwhether they are free standing functions that accept objects, or objects that\nimplement methods.</p>\n<p>New operators should be able to extend the behavior of older types, and new\ntypes should be able to extend older operators.</p>\n<p>A well-planned system of objects is beautiful: a system where every meaningful\nmethod for an object has been anticipated in the design.\nInevitably, another layer of architecture introduces a new concept and with it\nthe temptation to monkey-patch, dunk-punch, or otherwise cover-up the omission.\nBut reaching backward in time, up through the layers of architecture doesn&#39;t\nalways compose well, when different levels introduce concepts of the same name\nbut distinct behavior.</p>\n<p>A polymorphic operator is a function that accepts as its first argument an\nobject and varies its behavior depending on its type.\nSuch an operator has the benefit of covering for the types from higher layers of\narchitecture, but defers to the eponymous method name of types yet to be\ndefined.\nSuch functions make it possible for a single interface to extend earlier layers\nof architecture and be extended by later layers of architecture.</p>\n<ul>\n<li><a href=\"https://github.com/kriskowal/pop-clear\">pop-clear</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-zip\">pop-zip</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-has\">pop-has</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-iterate\">pop-iterate</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-clone\">pop-clone</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-compare\">pop-compare</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-swap\">pop-swap</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-hash\">pop-hash</a></li>\n<li><a href=\"https://github.com/kriskowal/pop-observe\">pop-observe</a></li>\n</ul>\n";
var see = []
see.push({label: "Observers", href: "./observers.yaml", value: require("./observers.yaml")});
var slug = "operators";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["page.html","codi.sh","page.html",{"./page":33,"gutentag/text.html":45,"gutentag/html.html":38,"gutentag/repeat.html":40,"gutentag/reveal.html":42,"./list.html":26},function (require, exports, module, __filename, __dirname){

// codi.sh/page.html
// -----------------

"use strict";
var $SUPER = require("./page");
var $TEXT = require("gutentag/text.html");
var $CONTENT = require("gutentag/html.html");
var $REPEAT = require("gutentag/repeat.html");
var $REVEAL = require("gutentag/reveal.html");
var $LIST = require("./list.html");
var $THIS = function CodishPage(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // LIST
        node = {tagName: "list"};
        node.component = $THIS$0;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "see";
        component = new $LIST(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("see", component);
    if (component.setAttribute) {
        component.setAttribute("id", "see_oowang");
    }
    if (scope.componentsFor["see"]) {
       scope.componentsFor["see"].setAttribute("for", "see_oowang")
    }
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // CONTENT
        node = {tagName: "content"};
        node.innerHTML = "";
        callee = scope.nest();
        callee.argument = node;
        callee.id = "body";
        component = new $CONTENT(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("body", component);
    if (component.setAttribute) {
        component.setAttribute("id", "body_gtsl2u");
    }
    if (scope.componentsFor["body"]) {
       scope.componentsFor["body"].setAttribute("for", "body_gtsl2u")
    }
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function CodishPage$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // TEXT
        node = {tagName: "text"};
        node.innerText = "";
        callee = scope.nest();
        callee.argument = node;
        callee.id = "label";
        component = new $TEXT(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("label", component);
    if (component.setAttribute) {
        component.setAttribute("id", "label_vgu3ib");
    }
    if (scope.componentsFor["label"]) {
       scope.componentsFor["label"].setAttribute("for", "label_vgu3ib")
    }
};

}],["page.js","codi.sh","page.js",{"system/identifier":63,"url":64},function (require, exports, module, __filename, __dirname){

// codi.sh/page.js
// ---------------

"use strict";

var Identifier = require("system/identifier");
var URL = require('url');

module.exports = Page;

function Page(body, scope) {
    this.navigator = null;
    this.navigationIndex = null;
    this.index = scope.index;
}

Object.defineProperty(Page.prototype, "value", {
    get: function get() {
    },
    set: function set(document) {
        this.see.options = document.head.see;
        this.body.value = document.body;
    }
});

Page.prototype.hookup = function (id, component, scope) {
    if (id === "this") {
        this.see = scope.components.see;
        this.see.navigator = this;
        this.body = scope.components.body;
    } else if (id === "see:iteration") {
        scope.components.label.value = component.value.label;
    }
};

Page.prototype.navigate = function navigate(document) {
    var slug = document.value.head.slug;
    return this.navigator.navigate(slug, this.navigationIndex);
};

Page.prototype.activate = function (document) {
    var slug = document.value.head.slug;
    return this.navigator.activate(slug, this.navigationIndex);
};

Page.prototype.deactivate = function (document) {
};

Page.prototype.focus = function focus() {
    this.see.focus();
};

Page.prototype.handleEnter = function handleEnter() {
    this.see.handleEnter();
};


}],["q.yaml","codi.sh","q.yaml",{"./asap.yaml":1},function (require, exports, module, __filename, __dirname){

// codi.sh/q.yaml
// --------------

var body = "<h1 id=\"-asynchronous-promises-with-q-q-\"><a href=\"https://github.com/kriskowal/q\">Asynchronous Promises with Q</a></h1>\n<p>If a function cannot return a value or throw an exception without\nblocking, it can return a promise instead.\nA promise is an object that represents the return value or the thrown exception\nthat the function may eventually provide.</p>\n<p><a href=\"https://github.com/kriskowal/q\">The Q Promise Library</a> is the ground-breaking\npromise library for JavaScript, based on the work of <a href=\"https://en.wikipedia.org/wiki/Mark_S._Miller\">Mark Miller</a> and <a href=\"http://waterken.sourceforge.net/web_send/\">Tyler\nClose</a> and built with substantial contributions from <a href=\"https://blog.domenic.me/\">Domenic Denicola</a>.</p>\n<p>Often imitated, Q is still a solitary example of a promise library that\nsupports queueing messages to remote objects, using <a href=\"https://github.com/kriskowal/q-connection\">Q-Connection</a>.</p>\n<p>Version 1 is a stand-alone library that can be used without modification in\nNode.js and browsers.\n<a href=\"https://github.com/kriskowal/q/tree/v2\">Version 2</a> is a work in progress that trims down the interface, breaks it\ninto smaller modules, and adds support for estimated time to completion.\nAt the heart of the new Q is the <a href=\"https://github.com/kriskowal/asap\">ASAP</a> task library.</p>\n<p>Notably absent is support for <a href=\"https://github.com/kriskowal/gtor/blob/master/cancelation.md#canceling-asynchronous-tasks\">cancellation</a>, which in the process of writing\n<a href=\"https://github.com/kriskowal/gtor/blob/master/README.md\">A General Theory of Reactivity</a>, I found to be incompatible with\npromises, but conceivable with something similar, tentatively called Tasks.\nWith A General Theory, there is a prototype for this.</p>\n<p>Version 2 of Q comes with a <a href=\"https://github.com/kriskowal/q-connection/tree/v2#asynchronous-remote-objects\">Version 2 of Q-Connection</a>.\nThe new version has better semantics for methods of remote promises.\nA method of a remote reference will always produce another remote reference,\nand only by calling <code>pull()</code> will a remote object be serialized and transported\nover the wire to a local copy.\nOnly by calling <code>push()</code> will a local object be serialized and transported over\nthe wirte to a remote copy.\nIt is possible to build remote object graphs, complete with cycles.</p>\n<p>Version 2 of Q and Q-Connection should eventually introduce a <code>there</code> method,\nwhich is like <code>then</code>, but accepts code to run where the value is local.</p>\n<p>Eventually, <a href=\"https://github.com/drses/\">Dr. SES</a> (Distributed Robust Secure ECMAScript) will make it\npossible to safely run arbitrary code on behalf of mutually suspicious parties.</p>\n";
var see = []
see.push({label: "ASAP", href: "./asap.yaml", value: require("./asap.yaml")});
var slug = "q";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["scroll-animator.js","codi.sh","scroll-animator.js",{"ndim/point2":49},function (require, exports, module, __filename, __dirname){

// codi.sh/scroll-animator.js
// --------------------------

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

}],["system.yaml","codi.sh","system.yaml",{"./gutentag.yaml":8,"./q.yaml":34},function (require, exports, module, __filename, __dirname){

// codi.sh/system.yaml
// -------------------

var body = "<h1 id=\"-system-\"><a href=\"https://github.com/gutentags/system\">System</a></h1>\n<p><a href=\"https://github.com/gutentags/system\">System</a> is a packaged module loader and bundler for browsers and Node.js.\nFor browsers, it supports refresh-to-reload debugging, as well as a build step\ncompatible with Browserify to produce bundles for production.</p>\n<p>To use, <code>npm install -S system</code> in your package.  Then use the boot script to\nload your entry module.</p>\n<pre><code class=\"lang-html\">&lt;script\n    src=&quot;node_modules/system/boot.js&quot;\n    data-import=&quot;./entry&quot;&gt;\n&lt;/script&gt;\n</code></pre>\n<p>System loads CommonJS modules and JSON by default, just like Node.js and\nBrowserify, including support for <code>index.js</code> files.\nIn addition, each package can translate modules from other languages to\nJavaScript, on-the-fly in the browser during development, and during a build\nstep in Node.js for production.</p>\n<p>Translators are configured per-package in <code>package.json</code>.</p>\n<pre><code class=\"lang-json\">{\n  &quot;translators&quot;: {\n    &quot;text&quot;: &quot;./translate-text&quot;\n  }\n}\n</code></pre>\n<p>A translator module must export a function that modifies a module object,\nspecifically its <code>text</code> property and <code>dependencies</code> array.</p>\n<pre><code class=\"lang-js\">&quot;use strict&quot;;\nmodule.exports = function translateText(module) {\n    module.text = &quot;module.exports = &quot; +\n        JSON.stringify(module.text);\n};\n</code></pre>\n<p>Use the enclosed <code>bundle</code> script to create a <code>bundle.js</code> from your\n<code>entry.js</code> module for deployment.\nTranslator modules need to run both in the browser and in Node.js for this to\nwork properly.</p>\n<pre><code>$ bundle entry.js &gt; bundle.js\n</code></pre><p>The Module System opens the door for many opportunities including HTML modules\nwith <a href=\"https://github.com/gutentags/gutentag\">Guten Tag</a>.</p>\n<p>The Module System also uses <a href=\"https://github.com/kriskowal/q/tree/v2\">Q version 2 promises</a> internally.\nIf you import <code>system</code>, you will get the <code>System</code> object, which in turn has a\n<code>loadSystem(location)</code> method.\nThis returns a promise for a system instance for the package at that location.\nSystem instances have an <code>import(identifier)</code> method, which in turn returns a\npromise for the exports of the entry module.</p>\n";
var see = []
see.push({label: "Guten Tag", href: "./gutentag.yaml", value: require("./gutentag.yaml")});
see.push({label: "Promises", href: "./q.yaml", value: require("./q.yaml")});
var slug = "system";
var head = {see: see, slug: slug};
exports.head = head;
exports.body = body;

}],["document.js","gutentag","document.js",{"koerper":47},function (require, exports, module, __filename, __dirname){

// gutentag/document.js
// --------------------

"use strict";
module.exports = require("koerper");

}],["html.html","gutentag","html.html",{"./html":39},function (require, exports, module, __filename, __dirname){

// gutentag/html.html
// ------------------

"use strict";
module.exports = (require)("./html");

}],["html.js","gutentag","html.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/html.js
// ----------------

"use strict";

module.exports = Html;
function Html(body, scope) {
    var node = body.ownerDocument.createBody();
    body.appendChild(node);
    this.node = node;
    this.defaultHtml = scope.argument.innerHTML;
    this.value = null;
}

Object.defineProperty(Html.prototype, "value", {
    get: function () {
        return this.node.innerHTML;
    },
    set: function (value) {
        if (value == null) {
            value = this.defaultHtml;
        } else if (typeof value !== "string") {
            throw new Error("HTML component only accepts string values");
        }
        this.node.innerHTML = value;
    }
});

}],["repeat.html","gutentag","repeat.html",{"./repeat":41},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.html
// --------------------

"use strict";
module.exports = (require)("./repeat");

}],["repeat.js","gutentag","repeat.js",{"pop-observe":51,"pop-swap":56},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.js
// ------------------


var O = require("pop-observe");
var swap = require("pop-swap");

var empty = [];

module.exports = Repetition;
function Repetition(body, scope) {
    this.body = body;
    this.scope = scope;
    this.iterations = [];
    this.Iteration = scope.argument.component;
    this.id = scope.id;
    this.observer = null;
    this._value = null;
    this.value = [];
}

Object.defineProperty(Repetition.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        if (!Array.isArray(value)) {
            throw new Error('Value of repetition must be an array');
        }
        if (this.observer) {
            this.observer.cancel();
            this.handleValueRangeChange(empty, this._value, 0);
        }
        this._value = value;
        this.handleValueRangeChange(this._value, empty, 0);
        this.observer = O.observeRangeChange(this._value, this, "value");
    }
});

Repetition.prototype.handleValueRangeChange = function (plus, minus, index) {
    var body = this.body;
    var document = this.body.ownerDocument;

    for (var offset = index; offset < index + minus.length; offset++) {
        var iteration = this.iterations[offset];
        body.removeChild(iteration.body);
        iteration.value = null;
        iteration.index = null;
        iteration.body = null;
        if (iteration.destroy) {
            iteration.destroy();
        }
    }

    var nextIteration = this.iterations[index + 1];
    var nextSibling = nextIteration && nextIteration.body;

    var add = [];
    for (var offset = 0; offset < plus.length; offset++) {
        var value = plus[offset];
        var iterationNode = document.createBody();
        var iterationScope = this.scope.nestComponents();

        var iteration = new this.Iteration(iterationNode, iterationScope);

        iteration.value = value;
        iteration.index = index + offset;
        iteration.body = iterationNode;

        iterationScope.hookup(this.scope.id + ":iteration", iteration);

        body.insertBefore(iterationNode, nextSibling);
        add.push(iteration);
    }

    swap(this.iterations, index, minus.length, add);

    // Update indexes
    for (var offset = index; offset < this.iterations.length; offset++) {
        this.iterations[offset].index = offset;
    }
};

Repetition.prototype.redraw = function (region) {
    for (var index = 0; index < this.iterations.length; index++) {
        var iteration = this.iterations[index];
        iteration.redraw(region);
    }
};

Repetition.prototype.destroy = function () {
    this.observer.cancel();
    this.handleValuesRangeChange([], this._value, 0);
};


}],["reveal.html","gutentag","reveal.html",{"./reveal":43},function (require, exports, module, __filename, __dirname){

// gutentag/reveal.html
// --------------------

"use strict";
module.exports = (require)("./reveal");

}],["reveal.js","gutentag","reveal.js",{"pop-observe":51},function (require, exports, module, __filename, __dirname){

// gutentag/reveal.js
// ------------------

"use strict";

// TODO create scope for revealed body and add to owner whenever it is created.
// Destroy when retracted, recreate when revealed.

var O = require("pop-observe");

module.exports = Reveal;
function Reveal(body, scope) {
    this.value = false;
    this.observer = O.observePropertyChange(this, "value", this);
    this.body = body;
    this.scope = scope;
    this.Component = scope.argument.component;
    this.component = null;
    this.componentBody = null;
    this.componentScope = null;
}

Reveal.prototype.handleValuePropertyChange = function (value) {
    this.clear();
    if (value) {
        this.componentScope = this.scope.nestComponents();
        this.componentBody = this.body.ownerDocument.createBody();
        this.component = new this.Component(this.componentBody, this.componentScope);
        this.componentScope.hookup(this.scope.id + ":revelation", this.component);
        this.body.appendChild(this.componentBody);
    }
};

Reveal.prototype.clear = function clear() {
    if (this.component) {
        if (this.component.destroy) {
            this.component.destroy();
        }
        this.body.removeChild(this.componentBody);
        this.component = null;
        this.componentBody = null;
    }
};

Reveal.prototype.destroy = function () {
    this.clear();
    this.observer.cancel();
};

}],["scope.js","gutentag","scope.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/scope.js
// -----------------

"use strict";

module.exports = Scope;
function Scope() {
    this.root = this;
    this.components = Object.create(null);
    this.componentsFor = Object.create(null);
}

Scope.prototype.nest = function () {
    var child = Object.create(this);
    child.parent = this;
    child.caller = this.caller && this.caller.nest();
    return child;
};

Scope.prototype.nestComponents = function () {
    var child = this.nest();
    child.components = Object.create(this.components);
    child.componentsFor = Object.create(this.componentsFor);
    return child;
};

// TODO deprecated
Scope.prototype.set = function (id, component) {
    console.log(new Error().stack);
    this.hookup(id, component);
};

Scope.prototype.hookup = function (id, component) {
    var scope = this;
    scope.components[id] = component;

    if (scope.this.hookup) {
        scope.this.hookup(id, component, scope);
    } else if (scope.this.add) {
        // TODO deprecated
        scope.this.add(component, id, scope);
    }

    var exportId = scope.this.exports && scope.this.exports[id];
    if (exportId) {
        var callerId = scope.caller.id;
        scope.caller.hookup(callerId + ":" + exportId, component);
    }
};

}],["text.html","gutentag","text.html",{"./text":46},function (require, exports, module, __filename, __dirname){

// gutentag/text.html
// ------------------

"use strict";
module.exports = (require)("./text");

}],["text.js","gutentag","text.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/text.js
// ----------------

"use strict";

module.exports = Text;
function Text(body, scope) {
    var node = body.ownerDocument.createTextNode("");
    body.appendChild(node);
    this.node = node;
    this.defaultText = scope.argument.innerText;
    this._value = null;
}

Object.defineProperty(Text.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        this._value = value;
        if (value == null) {
            this.node.data = this.defaultText;
        } else {
            this.node.data = "" + value;
        }
    }
});

}],["koerper.js","koerper","koerper.js",{"wizdom":65},function (require, exports, module, __filename, __dirname){

// koerper/koerper.js
// ------------------

"use strict";

var BaseDocument = require("wizdom");
var BaseNode = BaseDocument.prototype.Node;
var BaseElement = BaseDocument.prototype.Element;
var BaseTextNode = BaseDocument.prototype.TextNode;

module.exports = Document;
function Document(actualNode) {
    Node.call(this, this);
    this.actualNode = actualNode;
    this.actualDocument = actualNode.ownerDocument;

    this.documentElement = this.createBody();
    this.documentElement.parentNode = this;
    actualNode.appendChild(this.documentElement.actualNode);

    this.firstChild = this.documentElement;
    this.lastChild = this.documentElement;
}

Document.prototype = Object.create(BaseDocument.prototype);
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Body = Body;
Document.prototype.OpaqueHtml = OpaqueHtml;

Document.prototype.createBody = function (label) {
    return new this.Body(this, label);
};

Document.prototype.getActualParent = function () {
    return this.actualNode;
};

function Node(document) {
    BaseNode.call(this, document);
    this.actualNode = null;
}

Node.prototype = Object.create(BaseNode.prototype);
Node.prototype.constructor = Node;

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (nextSibling && nextSibling.parentNode !== this) {
        throw new Error("Can't insert before node that is not a child of parent");
    }
    BaseNode.prototype.insertBefore.call(this, childNode, nextSibling);
    var actualParentNode = this.getActualParent();
    var actualNextSibling;
    if (nextSibling) {
        actualNextSibling = nextSibling.getActualFirstChild();
    }
    if (!actualNextSibling) {
        actualNextSibling = this.getActualNextSibling();
    }
    if (actualNextSibling && actualNextSibling.parentNode !== actualParentNode) {
        actualNextSibling = null;
    }
    actualParentNode.insertBefore(childNode.actualNode, actualNextSibling || null);
    childNode.inject();
    return childNode;
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove child " + childNode);
    }
    childNode.extract();
    this.getActualParent().removeChild(childNode.actualNode);
    BaseNode.prototype.removeChild.call(this, childNode);
};

Node.prototype.setAttribute = function setAttribute(key, value) {
    this.actualNode.setAttribute(key, value);
};

Node.prototype.getAttribute = function getAttribute(key) {
    this.actualNode.getAttribute(key);
};

Node.prototype.hasAttribute = function hasAttribute(key) {
    this.actualNode.hasAttribute(key);
};

Node.prototype.removeAttribute = function removeAttribute(key) {
    this.actualNode.removeAttribute(key);
};

Node.prototype.addEventListener = function addEventListener(name, handler, capture) {
    this.actualNode.addEventListener(name, handler, capture);
};

Node.prototype.removeEventListener = function removeEventListener(name, handler, capture) {
    this.actualNode.removeEventListener(name, handler, capture);
};

Node.prototype.inject = function injectNode() { };

Node.prototype.extract = function extractNode() { };

Node.prototype.getActualParent = function () {
    return this.actualNode;
};

Node.prototype.getActualFirstChild = function () {
    return this.actualNode;
};

Node.prototype.getActualNextSibling = function () {
    return null;
};

Object.defineProperty(Node.prototype, "innerHTML", {
    get: function () {
        return this.actualNode.innerHTML;
    }//,
    //set: function (html) {
    //    // TODO invalidate any subcontained child nodes
    //    this.actualNode.innerHTML = html;
    //}
});

function Element(document, type, namespace) {
    BaseNode.call(this, document, namespace);
    if (namespace) {
        this.actualNode = document.actualDocument.createElementNS(namespace, type);
    } else {
        this.actualNode = document.actualDocument.createElement(type);
    }
    this.attributes = this.actualNode.attributes;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

function TextNode(document, text) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode(text);
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

Object.defineProperty(TextNode.prototype, "data", {
    set: function (data) {
        this.actualNode.data = data;
    },
    get: function () {
        return this.actualNode.data;
    }
});

// if parentNode is null, the body is extracted
// if parentNode is non-null, the body is inserted
function Body(document, label) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode("");
    //this.actualNode = document.actualDocument.createComment(label || "");
    this.actualFirstChild = null;
    this.actualBody = document.actualDocument.createElement("BODY");
}

Body.prototype = Object.create(Node.prototype);
Body.prototype.constructor = Body;
Body.prototype.nodeType = 13;

Body.prototype.extract = function extract() {
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = this.getActualFirstChild();
    var next;
    while (at && at !== lastChild) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parentNode.removeChild(at);
        }
        at = next;
    }
};

Body.prototype.inject = function inject() {
    if (!this.parentNode) {
        throw new Error("Can't inject without a parent node");
    }
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = body.firstChild;
    var next;
    while (at) {
        next = at.nextSibling;
        parentNode.insertBefore(at, lastChild);
        at = next;
    }
};

Body.prototype.getActualParent = function () {
    if (this.parentNode) {
        return this.parentNode.getActualParent();
    } else {
        return this.actualBody;
    }
};

Body.prototype.getActualFirstChild = function () {
    if (this.firstChild) {
        return this.firstChild.getActualFirstChild();
    } else {
        return this.actualNode;
    }
};

Body.prototype.getActualNextSibling = function () {
    return this.actualNode;
};

Object.defineProperty(Body.prototype, "innerHTML", {
    get: function () {
        if (this.parentNode) {
            this.extract();
            var html = this.actualBody.innerHTML;
            this.inject();
            return html;
        } else {
            return this.actualBody.innerHTML;
        }
    },
    set: function (html) {
        if (this.parentNode) {
            this.extract();
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
            this.inject();
        } else {
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
        }
        return html;
    }
});

function OpaqueHtml(ownerDocument, body) {
    Node.call(this, ownerDocument);
    this.actualFirstChild = body.firstChild;
}

OpaqueHtml.prototype = Object.create(Node.prototype);
OpaqueHtml.prototype.constructor = OpaqueHtml;

OpaqueHtml.prototype.getActualFirstChild = function getActualFirstChild() {
    return this.actualFirstChild;
};

}],["point.js","ndim","point.js",{},function (require, exports, module, __filename, __dirname){

// ndim/point.js
// -------------

"use strict";

module.exports = Point;
function Point() {
}

Point.prototype.add = function (that) {
    return this.clone().addThis(that);
};

Point.prototype.sub = function (that) {
    return this.clone().addThis(that);
};

// not dot or cross, just elementwise multiplication
Point.prototype.mul = function (that) {
    return this.clone().mulThis(that);
};

Point.prototype.scale = function (n) {
    return this.clone().scaleThis(n);
};

Point.prototype.bitwiseAnd = function (n) {
    return this.clone().bitwiseAndThis(n);
};

Point.prototype.bitwiseOr = function (n) {
    return this.clone().bitwiseOrThis(n);
};

Point.prototype.round = function () {
    return this.clone().roundThis();
};

Point.prototype.floor = function () {
    return this.clone().floorThis();
};

Point.prototype.ceil = function () {
    return this.clone().ceilThis();
};

Point.prototype.abs = function () {
    return this.clone().absThis();
};

Point.prototype.min = function () {
    return this.clone().minThis();
};

Point.prototype.max = function () {
    return this.clone().maxThis();
};


}],["point2.js","ndim","point2.js",{"./point":48},function (require, exports, module, __filename, __dirname){

// ndim/point2.js
// --------------

"use strict";

var Point = require("./point");

module.exports = Point2;
function Point2(x, y) {
    this.x = x;
    this.y = y;
}

Point2.prototype = Object.create(Point.prototype);
Point2.prototype.constructor = Point2;

Point2.zero = new Point2(0, 0);
Point2.one = new Point2(1, 1);

Point2.prototype.addThis = function (that) {
    this.x = this.x + that.x;
    this.y = this.y + that.y;
    return this;
};

Point2.prototype.subThis = function (that) {
    this.x = this.x - that.x;
    this.y = this.y - that.y;
    return this;
};

Point2.prototype.mulThis = function (that) {
    this.x = this.x * that.x;
    this.y = this.y * that.y;
    return this;
};

Point2.prototype.scaleThis = function (n) {
    this.x = this.x * n;
    this.y = this.y * n;
    return this;
};

Point2.prototype.distance = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point2.prototype.bitwiseAndThis = function (n) {
    this.x = this.x & n;
    this.y = this.y & n;
    return this;
};

Point2.prototype.bitwiseOrThis = function (n) {
    this.x = this.x | n;
    this.y = this.y | n;
    return this;
};

Point2.prototype.dot = function (that) {
    return this.x * that.x + this.y * that.y;
};

Point2.prototype.roundThis = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point2.prototype.floorThis = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

Point2.prototype.ceilThis = function () {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};

Point2.prototype.absThis = function () {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
};

Point2.prototype.minThis = function (that) {
    this.x = Math.min(this.x, that.x);
    this.y = Math.min(this.y, that.y);
};

Point2.prototype.maxThis = function (that) {
    this.x = Math.max(this.x, that.x);
    this.y = Math.max(this.y, that.y);
};

Point2.prototype.transpose = function () {
    return this.clone().transposeThis();
};

Point2.prototype.transposeThis = function () {
    var temp = this.x;
    this.x = this.y;
    this.y = temp;
    return this;
};

Point2.prototype.clone = function () {
    return new Point2(this.x, this.y);
};

Point2.prototype.become = function (that) {
    this.x = that.x;
    this.y = that.y;
    return this;
};

Point2.prototype.hash = function () {
    return this.x + "," + this.y;
};

Point2.prototype.equals = function (that) {
    return this.x === that.x && this.y === that.y;
};

Point2.prototype.toString = function () {
    return 'Point2(' + this.x + ', ' + this.y + ')';
};


}],["lib/performance-now.js","performance-now/lib","performance-now.js",{},function (require, exports, module, __filename, __dirname){

// performance-now/lib/performance-now.js
// --------------------------------------

// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}],["index.js","pop-observe","index.js",{"./observable-array":52,"./observable-object":54,"./observable-range":55,"./observable-map":53},function (require, exports, module, __filename, __dirname){

// pop-observe/index.js
// --------------------

"use strict";

require("./observable-array");
var Oa = require("./observable-array");
var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

exports.makeArrayObservable = Oa.makeArrayObservable;

for (var name in Oo) {
    exports[name] = Oo[name];
}
for (var name in Or) {
    exports[name] = Or[name];
}
for (var name in Om) {
    exports[name] = Om[name];
}


}],["observable-array.js","pop-observe","observable-array.js",{"./observable-object":54,"./observable-range":55,"./observable-map":53,"pop-swap/swap":57},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-array.js
// -------------------------------

/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 *
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/**
 * This module is responsible for observing changes to owned properties of
 * objects and changes to the content of arrays caused by method calls. The
 * interface for observing array content changes establishes the methods
 * necessary for any collection with observable content.
 */

var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

var array_swap = require("pop-swap/swap");
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var array_empty = [];

var observableArrayProperties = {

    swap: {
        value: function swap(start, minusLength, plus) {
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = array_empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = array_empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, this.observedLength);

            // dispatch before change events
            if (diff) {
                Oo.dispatchPropertyWillChange(this, "length", newLength, oldLength);
            }
            Or.dispatchRangeWillChange(this, plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyWillChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapWillChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            Oo.dispatchPropertyWillChange(this, i, void 0, this[i]);
                        }
                        Om.dispatchMapWillChange(this, "delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            array_swap(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                                Om.dispatchMapChange(this, "update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                                Om.dispatchMapChange(this, "update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, minus[j]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            Or.dispatchRangeChange(this, plus, minus, start);
            if (diff) {
                Oo.dispatchPropertyChange(this, "length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    reverse: {
        value: function reverse() {
            var reversed = this.slice();
            reversed.reverse();
            this.swap(0, this.length, reversed);
            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var sorted = this.slice();
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
        },
        writable: true,
        configurable: true
    },

    set: {
        value: function set(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            if (this.length) {
                var result = this[0];
                this.swap(0, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                var result = this[this.length - 1];
                this.swap(this.length - 1, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(value) {
            this.swap(this.length, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(value) {
            this.swap(0, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            this.swap(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var hiddenProperty = {
    value: null,
    enumerable: false,
    writable: true,
    configurable: true
};

var observableArrayOwnProperties = {
    observed: hiddenProperty,
    observedLength: hiddenProperty,

    propertyObservers: hiddenProperty,
    wrappedPropertyDescriptors: hiddenProperty,

    rangeChangeObservers: hiddenProperty,
    rangeWillChangeObservers: hiddenProperty,
    dispatchesRangeChanges: hiddenProperty,

    mapChangeObservers: hiddenProperty,
    mapWillChangeObservers: hiddenProperty,
    dispatchesMapChanges: hiddenProperty
};

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var bestowObservableArrayProperties;
if (protoIsSupported) {
    var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
    bestowObservableArrayProperties = function (array) {
        array.__proto__ = observableArrayPrototype;
    };
} else {
    bestowObservableArrayProperties = function (array) {
        Object.defineProperties(array, observableArrayProperties);
    };
}

exports.makeArrayObservable = makeArrayObservable;
function makeArrayObservable(array) {
    if (array.observed) {
        return;
    }
    bestowObservableArrayProperties(array);
    Object.defineProperties(array, observableArrayOwnProperties);
    array.observedLength = 0;
    array.observed = true;
}

// For ObservableObject
exports.makePropertyObservable = makePropertyObservable;
function makePropertyObservable(array, index) {
    makeArrayObservable(array);
    if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
        makeIndexObservable(array, index);
    }
}

// For ObservableRange
exports.makeRangeChangesObservable = makeRangeChangesObservable;
function makeRangeChangesObservable(array) {
    makeArrayObservable(array);
}

// For ObservableMap
exports.makeMapChangesObservable = makeMapChangesObservable;
function makeMapChangesObservable(array) {
    makeArrayObservable(array);
    makeIndexObservable(array, Infinity);
}

function makeIndexObservable(array, index) {
    if (index >= array.observedLength) {
        array.observedLength = index + 1;
    }
}


}],["observable-map.js","pop-observe","observable-map.js",{"./observable-array":52},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-map.js
// -----------------------------

"use strict";

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableMap;
function ObservableMap() {
    throw new Error("Can't construct. ObservableMap is a mixin.");
}

ObservableMap.prototype.observeMapChange = function (handler, name, note, capture) {
    return observeMapChange(this, handler, name, note, capture);
};

ObservableMap.prototype.observeMapWillChange = function (handler, name, note) {
    return observeMapChange(this, handler, name, note, true);
};

ObservableMap.prototype.dispatchMapChange = function (type, key, plus, minus, capture) {
    return dispatchMapChange(this, type, key, plus, minus, capture);
};

ObservableMap.prototype.dispatchMapWillChange = function (type, key, plus, minus) {
    return dispatchMapWillChange(this, type, key, plus, minus, true);
};

ObservableMap.prototype.getMapChangeObservers = function (capture) {
    return getMapChangeObservers(this, capture);
};

ObservableMap.prototype.getMapWillChangeObservers = function () {
    return getMapChangeObservers(this, true);
};

ObservableMap.observeMapChange = observeMapChange;
function observeMapChange(object, handler, name, note, capture) {
    makeMapChangesObservable(object);
    var observers = getMapChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new MapChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "MapChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapChange) {
            observer.handlerMethodName = "handleMapChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    } else {
        var methodName = "handle" + propertyName + "MapWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapWillChange) {
            observer.handlerMethodName = "handleMapWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableMap.observeMapWillChange = observeMapWillChange;
function observeMapWillChange(object, handler, name, note) {
    return observeMapChange(object, handler, name, note, true);
}

ObservableMap.dispatchMapChange = dispatchMapChange;
function dispatchMapChange(object, type, key, plus, minus, capture) {
    if (plus === minus) {
        return;
    }
    if (!dispatching) { // TODO && !debug?
        return startMapChangeDispatchContext(object, type, key, plus, minus, capture);
    }
    var observers = getMapChangeObservers(object, capture);
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(type, key, plus, minus);
    }
}

ObservableMap.dispatchMapWillChange = dispatchMapWillChange;
function dispatchMapWillChange(object, type, key, plus, minus) {
    return dispatchMapChange(object, type, key, plus, minus, true);
}

function startMapChangeDispatchContext(object, type, key, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchMapChange(object, type, key, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Map change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Map change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

function getMapChangeObservers(object, capture) {
    if (capture) {
        if (!object.mapWillChangeObservers) {
            object.mapWillChangeObservers = [];
        }
        return object.mapWillChangeObservers;
    } else {
        if (!object.mapChangeObservers) {
            object.mapChangeObservers = [];
        }
        return object.mapChangeObservers;
    }
}

function getMapWillChangeObservers(object) {
    return getMapChangeObservers(object, true);
}

function makeMapChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeMapChangesObservable(object);
    }
    if (object.makeMapChangesObservable) {
        object.makeMapChangesObservable();
    }
    object.dispatchesMapChanges = true;
}

function MapChangeObserver() {
    this.init();
}

MapChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

MapChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " map changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

MapChangeObserver.prototype.dispatch = function (type, key, plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, key, type, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, key, type, this.object);
    } else {
        throw new Error(
            "Can't dispatch map change for " + JSON.stringify(this.name) + " to " + handler +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

var Oa = require("./observable-array");

}],["observable-object.js","pop-observe","observable-object.js",{"./observable-array":52},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-object.js
// --------------------------------

/*jshint node: true*/
"use strict";

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

var owns = Object.prototype.hasOwnProperty;

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

// Reusable property descriptor
var hiddenValueProperty = {
    value: null,
    writable: true,
    enumerable: false,
    configurable: true
};

module.exports = ObservableObject;
function ObservableObject() {
    throw new Error("Can't construct. ObservableObject is a mixin.");
}

ObservableObject.prototype.observePropertyChange = function (name, handler, note, capture) {
    return observePropertyChange(this, name, handler, note, capture);
};

ObservableObject.prototype.observePropertyWillChange = function (name, handler, note) {
    return observePropertyWillChange(this, name, handler, note);
};

ObservableObject.prototype.dispatchPropertyChange = function (name, plus, minus, capture) {
    return dispatchPropertyChange(this, name, plus, minus, capture);
};

ObservableObject.prototype.dispatchPropertyWillChange = function (name, plus, minus) {
    return dispatchPropertyWillChange(this, name, plus, minus);
};

ObservableObject.prototype.getPropertyChangeObservers = function (name, capture) {
    return getPropertyChangeObservers(this, name, capture);
};

ObservableObject.prototype.getPropertyWillChangeObservers = function (name) {
    return getPropertyWillChangeObservers(this, name);
};

ObservableObject.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable(this, name);
};

ObservableObject.prototype.preventPropertyObserver = function (name) {
    return preventPropertyObserver(this, name);
};

ObservableObject.prototype.PropertyChangeObserver = PropertyChangeObserver;

// Constructor interface with polymorphic delegation if available

ObservableObject.observePropertyChange = function (object, name, handler, note, capture) {
    if (object.observePropertyChange) {
        return object.observePropertyChange(name, handler, note, capture);
    } else {
        return observePropertyChange(object, name, handler, note, capture);
    }
};

ObservableObject.observePropertyWillChange = function (object, name, handler, note) {
    if (object.observePropertyWillChange) {
        return object.observePropertyWillChange(name, handler, note);
    } else {
        return observePropertyWillChange(object, name, handler, note);
    }
};

ObservableObject.dispatchPropertyChange = function (object, name, plus, minus, capture) {
    if (object.dispatchPropertyChange) {
        return object.dispatchPropertyChange(name, plus, minus, capture);
    } else {
        return dispatchPropertyChange(object, name, plus, minus, capture);
    }
};

ObservableObject.dispatchPropertyWillChange = function (object, name, plus, minus) {
    if (object.dispatchPropertyWillChange) {
        return object.dispatchPropertyWillChange(name, plus, minus);
    } else {
        return dispatchPropertyWillChange(object, name, plus, minus);
    }
};

ObservableObject.makePropertyObservable = function (object, name) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(name);
    } else {
        return makePropertyObservable(object, name);
    }
};

ObservableObject.preventPropertyObserver = function (object, name) {
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
};

// Implementation

function observePropertyChange(object, name, handler, note, capture) {
    ObservableObject.makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList.length) { // TODO && !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;
    observer.value = object[name];

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching) { // TODO && !debug?
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.length = 0;
        }
    }
}

function getPropertyChangeObservers(object, name, capture) {
    if (!object.propertyObservers) {
        hiddenValueProperty.value = Object.create(null);
        Object.defineProperty(object, "propertyObservers", hiddenValueProperty);
    }
    var observersByKey = object.propertyObservers;
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.prototype.hasOwnProperty.call(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

function PropertyChangeObserver() {
    this.init();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.init = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    if (minus === void 0) {
        minus = this.value;
    }
    this.value = plus;

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(handlerMethodName) + " property change on " + object +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

function makePropertyObservable(object, name) {
    if (Array.isArray(object)) {
        return Oa.makePropertyObservable(object, name);
    }

    var wrappedDescriptor = wrapPropertyDescriptor(object, name);

    if (!wrappedDescriptor) {
        return;
    }

    var thunk;
    // in both of these new descriptor variants, we reuse the wrapped
    // descriptor to either store the current value or apply getters
    // and setters. this is handy since we can reuse the wrapped
    // descriptor if we uninstall the observer. We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ("value" in wrappedDescriptor) {
        thunk = makeValuePropertyThunk(name, wrappedDescriptor);
    } else { // "get" or "set", but not necessarily both
        thunk = makeGetSetPropertyThunk(name, wrappedDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

/**
 * Prevents a thunk from being installed on a property, assuming that the
 * underlying type will dispatch the change manually, or intends the property
 * to stick on all instances.
 */
function preventPropertyObserver(object, name) {
    var wrappedDescriptor = wrapPropertyDescriptor(object, name);
    Object.defineProperty(object, name, wrappedDescriptor);
}

function wrapPropertyDescriptor(object, name) {
    // Arrays are special. We do not support direct setting of properties
    // on an array. instead, call .set(index, value). This is observable.
    // "length" property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    var wrappedDescriptor = getPropertyDescriptor(object, name);
    var wrappedPrototype = wrappedDescriptor.prototype;

    var existingWrappedDescriptors = wrappedPrototype.wrappedPropertyDescriptors;
    if (existingWrappedDescriptors && owns.call(existingWrappedDescriptors, name)) {
        return;
    }

    var wrappedPropertyDescriptors = object.wrappedPropertyDescriptors;
    if (!wrappedPropertyDescriptors) {
        wrappedPropertyDescriptors = {};
        hiddenValueProperty.value = wrappedPropertyDescriptors;
        Object.defineProperty(object, "wrappedPropertyDescriptors", hiddenValueProperty);
    }

    if (owns.call(wrappedPropertyDescriptors, name)) {
        // If we have already recorded a wrapped property descriptor,
        // we have already installed the observer, so short-here.
        return;
    }

    if (!wrappedDescriptor.configurable) {
        return;
    }

    // Memoize the descriptor so we know not to install another layer. We
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    wrappedPropertyDescriptors[name] = wrappedDescriptor;

    // Give up *after* storing the wrapped property descriptor so it
    // can be restored by uninstall. Unwritable properties are
    // silently not overriden. Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!wrappedDescriptor.writable && !wrappedDescriptor.set) {
        return;
    }

    // If there is no setter, it is not mutable, and observing is moot.
    // Manual dispatch may still apply.
    if (wrappedDescriptor.get && !wrappedDescriptor.set) {
        return;
    }

    return wrappedDescriptor;
}

function getPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for the
    // property name.
    var descriptor;
    var prototype = object;
    do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            break;
        }
        prototype = Object.getPrototypeOf(prototype);
    } while (prototype);
    if (descriptor) {
        descriptor.prototype = prototype;
        return descriptor;
    } else {
        // or default to an undefined value
        return {
            prototype: object,
            value: undefined,
            enumerable: false,
            writable: true,
            configurable: true
        };
    }
}

function makeValuePropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            return state[name];
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            if (plus === state[name]) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            wrappedDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            if (wrappedDescriptor.get) {
                return wrappedDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (state[name] === plus) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            // call through to actual setter
            if (wrappedDescriptor.set) {
                wrappedDescriptor.set.apply(this, arguments);
                state[name] = plus;
            }

            // use getter, if possible, to adjust the plus value if the setter
            // adjusted it, for example a setter for an array property that
            // retains the original array and replaces its content, or a setter
            // that coerces the value to an expected type.
            if (wrappedDescriptor.get) {
                plus = wrappedDescriptor.get.apply(this, arguments);
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function initState(object) {
    Object.defineProperty(object, "__state__", {
        value: {
            __this__: object
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

var Oa = require("./observable-array");

}],["observable-range.js","pop-observe","observable-range.js",{"./observable-array":52},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-range.js
// -------------------------------

/*global -WeakMap*/
"use strict";

// TODO review all error messages for consistency and helpfulness across observables

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    return observeRangeChange(this, handler, name, note, capture);
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return observeRangeChange(this, handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    return dispatchRangeChange(this, plus, minus, index, capture);
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return dispatchRangeChange(this, plus, minus, index, true);
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return getRangeChangeObservers(this, true);
};

ObservableRange.observeRangeChange = observeRangeChange;
function observeRangeChange(object, handler, name, note, capture) {
    makeRangeChangesObservable(object);
    var observers = getRangeChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableRange.observeRangeWillChange = observeRangeWillChange;
function observeRangeWillChange(object, handler, name, note) {
    return observeRangeChange(object, handler, name, note, true);
}

ObservableRange.dispatchRangeChange = dispatchRangeChange;
function dispatchRangeChange(object, plus, minus, index, capture) {
    if (!dispatching) { // TODO && !debug?
        return startRangeChangeDispatchContext(object, plus, minus, index, capture);
    }
    var observers = getRangeChangeObservers(object, capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
}

ObservableRange.dispatchRangeWillChange = dispatchRangeWillChange;
function dispatchRangeWillChange(object, plus, minus, index) {
    return dispatchRangeChange(object, plus, minus, index, true);
}

function startRangeChangeDispatchContext(object, plus, minus, index, capture) {
    dispatching = true;
    try {
        dispatchRangeChange(object, plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            if (observerToFreeList.clear) {
                observerToFreeList.clear();
            } else {
                observerToFreeList.length = 0;
            }
        }
    }
}

function makeRangeChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeRangeChangesObservable(object);
    }
    if (object.makeRangeChangesObservable) {
        object.makeRangeChangesObservable();
    }
    object.dispatchesRangeChanges = true;
}

function getRangeChangeObservers(object, capture) {
    if (capture) {
        if (!object.rangeWillChangeObservers) {
            object.rangeWillChangeObservers = [];
        }
        return object.rangeWillChangeObservers;
    } else {
        if (!object.rangeChangeObservers) {
            object.rangeChangeObservers = [];
        }
        return object.rangeChangeObservers;
    }
}

/*
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
*/

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;

    return this;
};

var Oa = require("./observable-array");

}],["pop-swap.js","pop-swap","pop-swap.js",{"./swap":57},function (require, exports, module, __filename, __dirname){

// pop-swap/pop-swap.js
// --------------------

"use strict";

var swap = require("./swap");

module.exports = polymorphicSwap;
function polymorphicSwap(array, start, minusLength, plus) {
    if (typeof array.swap === "function") {
        array.swap(start, minusLength, plus);
    } else {
        swap(array, start, minusLength, plus);
    }
}


}],["swap.js","pop-swap","swap.js",{},function (require, exports, module, __filename, __dirname){

// pop-swap/swap.js
// ----------------

"use strict";

// Copyright (C) 2014 Montage Studio
// https://github.com/montagejs/collections/blob/7c674d49c04955f01bbd2839f90936e15aceea2f/operators/swap.js

var array_slice = Array.prototype.slice;

module.exports = swap;
function swap(array, start, minusLength, plus) {
    // Unrolled implementation into JavaScript for a couple reasons.
    // Calling splice can cause large stack sizes for large swaps. Also,
    // splice cannot handle array holes.
    if (plus) {
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
    } else {
        plus = Array.empty;
    }

    if (start < 0) {
        start = array.length + start;
    } else if (start > array.length) {
        array.length = start;
    }

    if (start + minusLength > array.length) {
        // Truncate minus length if it extends beyond the length
        minusLength = array.length - start;
    } else if (minusLength < 0) {
        // It is the JavaScript way.
        minusLength = 0;
    }

    var diff = plus.length - minusLength;
    var oldLength = array.length;
    var newLength = array.length + diff;

    if (diff > 0) {
        // Head Tail Plus Minus
        // H H H H M M T T T T
        // H H H H P P P P T T T T
        //         ^ start
        //         ^-^ minus.length
        //           ^ --> diff
        //         ^-----^ plus.length
        //             ^------^ tail before
        //                 ^------^ tail after
        //                   ^ start iteration
        //                       ^ start iteration offset
        //             ^ end iteration
        //                 ^ end iteration offset
        //             ^ start + minus.length
        //                     ^ length
        //                   ^ length - 1
        for (var index = oldLength - 1; index >= start + minusLength; index--) {
            var offset = index + diff;
            if (index in array) {
                array[offset] = array[index];
            } else {
                // Oddly, PhantomJS complains about deleting array
                // properties, unless you assign undefined first.
                array[offset] = void 0;
                delete array[offset];
            }
        }
    }
    for (var index = 0; index < plus.length; index++) {
        if (index in plus) {
            array[start + index] = plus[index];
        } else {
            array[start + index] = void 0;
            delete array[start + index];
        }
    }
    if (diff < 0) {
        // Head Tail Plus Minus
        // H H H H M M M M T T T T
        // H H H H P P T T T T
        //         ^ start
        //         ^-----^ length
        //         ^-^ plus.length
        //             ^ start iteration
        //                 ^ offset start iteration
        //                     ^ end
        //                         ^ offset end
        //             ^ start + minus.length - plus.length
        //             ^ start - diff
        //                 ^------^ tail before
        //             ^------^ tail after
        //                     ^ length - diff
        //                     ^ newLength
        for (var index = start + plus.length; index < oldLength - diff; index++) {
            var offset = index - diff;
            if (offset in array) {
                array[index] = array[offset];
            } else {
                array[index] = void 0;
                delete array[index];
            }
        }
    }
    array.length = newLength;
}


}],["punycode.js","punycode","punycode.js",{},function (require, exports, module, __filename, __dirname){

// punycode/punycode.js
// --------------------

/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}],["decode.js","querystring","decode.js",{},function (require, exports, module, __filename, __dirname){

// querystring/decode.js
// ---------------------

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

}],["encode.js","querystring","encode.js",{},function (require, exports, module, __filename, __dirname){

// querystring/encode.js
// ---------------------

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

}],["index.js","querystring","index.js",{"./decode":59,"./encode":60},function (require, exports, module, __filename, __dirname){

// querystring/index.js
// --------------------

'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

}],["index.js","raf","index.js",{"performance-now":50},function (require, exports, module, __filename, __dirname){

// raf/index.js
// ------------

var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

}],["identifier.js","system","identifier.js",{},function (require, exports, module, __filename, __dirname){

// system/identifier.js
// --------------------

"use strict";

exports.isAbsolute = isAbsolute;
function isAbsolute(path) {
    return (
        path !== "" &&
        path.lastIndexOf("./", 0) < 0 &&
        path.lastIndexOf("../", 0) < 0
    );
}

exports.isBare = isBare;
function isBare(id) {
    var lastSlash = id.lastIndexOf("/");
    return id.indexOf(".", lastSlash) < 0;
}

// TODO @user/name package names

exports.head = head;
function head(id) {
    var firstSlash = id.indexOf("/");
    if (firstSlash < 0) { return id; }
    return id.slice(0, firstSlash);
}

exports.tail = tail;
function tail(id) {
    var firstSlash = id.indexOf("/");
    if (firstSlash < 0) { return ""; }
    return id.slice(firstSlash + 1);
}

exports.extension = extension;
function extension(id) {
    var lastSlash = id.lastIndexOf("/");
    var lastDot = id.lastIndexOf(".");
    if (lastDot <= lastSlash) { return ""; }
    return id.slice(lastDot + 1);
}

exports.dirname = dirname;
function dirname(id) {
    var lastSlash = id.lastIndexOf("/");
    if (lastSlash < 0) {
        return id;
    }
    return id.slice(0, lastSlash);
}

exports.basename = basename;
function basename(id) {
    var lastSlash = id.lastIndexOf("/");
    if (lastSlash < 0) {
        return id;
    }
    return id.slice(lastSlash + 1);
}

exports.resolve = resolve;
function resolve(rel, abs) {
    abs = abs || '';
    var source = rel.split("/");
    var target = [];
    var parts;
    if (source.length && source[0] === "." || source[0] === "..") {
        parts = abs.split("/");
        parts.pop();
        source.unshift.apply(source, parts);
    }
    for (var index = 0; index < source.length; index++) {
        if (source[index] === "..") {
            if (target.length) {
                target.pop();
            }
        } else if (source[index] !== "" && source[index] !== ".") {
            target.push(source[index]);
        }
    }
    return target.join("/");
}

}],["url.js","url","url.js",{"punycode":58,"querystring":61},function (require, exports, module, __filename, __dirname){

// url/url.js
// ----------

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

}],["dom.js","wizdom","dom.js",{},function (require, exports, module, __filename, __dirname){

// wizdom/dom.js
// -------------

"use strict";

module.exports = Document;
function Document(namespace) {
    this.doctype = null;
    this.documentElement = null;
    this.namespaceURI = namespace || "";
}

Document.prototype.nodeType = 9;
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Comment = Comment;
Document.prototype.Attr = Attr;
Document.prototype.NamedNodeMap = NamedNodeMap;

Document.prototype.createTextNode = function (text) {
    return new this.TextNode(this, text);
};

Document.prototype.createComment = function (text) {
    return new this.Comment(this, text);
};

Document.prototype.createElement = function (type, namespace) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createElementNS = function (namespace, type) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createAttribute = function (name, namespace) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

Document.prototype.createAttributeNS = function (namespace, name) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

function Node(document) {
    this.ownerDocument = document;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

Node.prototype.appendChild = function appendChild(childNode) {
    return this.insertBefore(childNode, null);
};

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (!childNode) {
        throw new Error("Can't insert null child");
    }
    if (childNode.ownerDocument !== this.ownerDocument) {
        throw new Error("Can't insert child from foreign document");
    }
    if (childNode.parentNode) {
        childNode.parentNode.removeChild(childNode);
    }
    var previousSibling;
    if (nextSibling) {
        previousSibling = nextSibling.previousSibling;
    } else {
        previousSibling = this.lastChild;
    }
    if (previousSibling) {
        previousSibling.nextSibling = childNode;
    }
    if (nextSibling) {
        nextSibling.previousSibling = childNode;
    }
    childNode.nextSibling = nextSibling;
    childNode.previousSibling = previousSibling;
    childNode.parentNode = this;
    if (!nextSibling) {
        this.lastChild = childNode;
    }
    if (!previousSibling) {
        this.firstChild = childNode;
    }
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove null child");
    }
    var parentNode = childNode.parentNode;
    if (parentNode !== this) {
        throw new Error("Can't remove node that is not a child of parent");
    }
    if (childNode === parentNode.firstChild) {
        parentNode.firstChild = childNode.nextSibling;
    }
    if (childNode === parentNode.lastChild) {
        parentNode.lastChild = childNode.previousSibling;
    }
    if (childNode.previousSibling) {
        childNode.previousSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
        childNode.nextSibling.previousSibling = childNode.previousSibling;
    }
    childNode.previousSibling = null;
    childNode.parentNode = null;
    childNode.nextSibling = null;
    return childNode;
};

function TextNode(document, text) {
    Node.call(this, document);
    this.data = text;
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

function Comment(document, text) {
    Node.call(this, document);
    this.data = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeType = 8;

function Element(document, type, namespace) {
    Node.call(this, document);
    this.tagName = type;
    this.namespaceURI = namespace;
    this.attributes = new this.ownerDocument.NamedNodeMap();
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

Element.prototype.hasAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return !!attr;
};

Element.prototype.getAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return attr ? attr.value : null;
};

Element.prototype.setAttribute = function (name, value, namespace) {
    var attr = this.ownerDocument.createAttribute(name, namespace);
    attr.value = value;
    this.attributes.setNamedItem(attr, namespace);
};

Element.prototype.removeAttribute = function (name, namespace) {
    this.attributes.removeNamedItem(name, namespace);
};

Element.prototype.hasAttributeNS = function (namespace, name) {
    return this.hasAttribute(name, namespace);
};

Element.prototype.getAttributeNS = function (namespace, name) {
    return this.getAttribute(name, namespace);
};

Element.prototype.setAttributeNS = function (namespace, name, value) {
    this.setAttribute(name, value, namespace);
};

Element.prototype.removeAttributeNS = function (namespace, name) {
    this.removeAttribute(name, namespace);
};

function Attr(ownerDocument, name, namespace) {
    this.ownerDocument = ownerDocument;
    this.name = name;
    this.value = null;
    this.namespaceURI = namespace;
}

Attr.prototype.nodeType = 2;

function NamedNodeMap() {
    this.length = 0;
}

NamedNodeMap.prototype.getNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    return this[key];
};

NamedNodeMap.prototype.setNamedItem = function (attr) {
    var namespace = attr.namespaceURI || "";
    var name = attr.name;
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var previousAttr = this[key];
    if (!previousAttr) {
        this[this.length] = attr;
        this.length++;
        previousAttr = null;
    }
    this[key] = attr;
    return previousAttr;
};

NamedNodeMap.prototype.removeNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var attr = this[key];
    if (!attr) {
        throw new Error("Not found");
    }
    var index = Array.prototype.indexOf.call(this, attr);
    delete this[key];
    delete this[index];
    this.length--;
};

NamedNodeMap.prototype.item = function (index) {
    return this[index];
};

NamedNodeMap.prototype.getNamedItemNS = function (namespace, name) {
    return this.getNamedItem(name, namespace);
};

NamedNodeMap.prototype.setNamedItemNS = function (attr) {
    return this.setNamedItem(attr);
};

NamedNodeMap.prototype.removeNamedItemNS = function (namespace, name) {
    return this.removeNamedItem(name, namespace);
};

}]])("codi.sh/index.js")
