
This is a catalog of a cohort of software, including libraries I have made,
others I support, many I wish existed, and some I would like to make myself.

These libraries take on several themes.

-   modules
-   versions
-   operators
-   polymorphism
-   collections
-   promises
-   bindings
-   security
-   animation


-   modules: software should be made from small, coherent, loosely coupled,
    interchangeable units with sovereignty over the names in their scope.
    These laws apply equally well to every language, including extensible
    HTML in whatever shape it comes.
-   versions: modules should be bundled in packages that declare their
    relationships to versions of other packages.
    Within a cohort of packages including their transitive dependencies, no two
    modules should duplicate the same behavior.
-   operators: Within a cohort of modules, any pair of functions with the same
    symbol or name should fulfill the same contract, regardless of what type
    they operate on, whether they are free standing functions that accept
    objects, or objects that implement methods.
-   polymorphism: new operators should be able to extend the behavior of older
    types, and new types should be able to extend older operators.
-   collections: There is a cafeteria of operators that collections should pick
    from to form their interface. The contract is intrinsic to the operator,
    not the collection. A collection should implement every applicable
    operator. Many of these operators have generic implementations that can be
    implemented in terms of a small subset of the whole body of operators.
-   promises: A promise represents a value or error from either the past or the
    future. Using a promise allows your code to take a single form regardless
    of whether the result comes from the past, present, or the future.
    Combining the concepts of promises and iterators produces streams that
    solve the fast producer / slow consumer problem.
    Interacting with the result behind a promise requires calling asynchronous
    methods like `then`.
    Since the only way to interact with the result behind a promise is to call
    an asynchronous method, these methods can be implemented in terms of
    message passing, and those messages can be passed across arbitrary
    distances, stretched through streams and serialization.
    A promise can implement asynchronous methods like `get`, `call`, and
    `invoke`, which can be pipelined.
    Since every asynchronous function should return a promise, RPC through
    promises can be pipelined.
-   bindings: Within the memory of one process running on an event loop, it is
    always possible to have a consistent model at the end of every event.
    There is no value in the compromise of eventual consistency unless state is
    spread across multiple processes.
    As such, bindings should be implemented like a Prolog, guaranteeing
    consistency at the conclusion of every state change.
    This means effecting changes recursively and synchronously.
    There is a class of coherent operators for observing changes to the genres
    of collections: objects, sets, maps, and ordered values, and another class
    of coherent generic combinators for those operators.
-   security, safety, robustness: We can break the unfair trade-off between
    security and power by using primitives that let us have a lot if not all of
    both.
-   animation: Web applications do not get slow because they manipulate the
    document. Web applications get slow because they fail to batch reads and
    writes as the number of animate components grows.
    To compose animated components that retain state perpetually, a coordinated
    draw cycle is one great solution.

About modules.

-   modules should have sovereignty of their own name space
-   modules in a package should be versioned together and collectively depend
    on versions of other packages.
-   versions and version ranges establish contracts between library authors.

-   modules should be small and focused on a single feature
-   modules should be loosely coupled
-   modules should be coherent within their cohort
-   incompatible cohorts and chaos are not merely okay but are necessary for
    parallel experimentation and expedite innovation
-   just as divergence is valuable for exploration, convergence is valuable for
    advancing the collective state of the art.

-   a system of modules must cooperate
-   it should be easy to instantiate new systems of modules
-   mutually suspicious systems of modules can communicate without interference



(keyboard / accessibility first)

-   module systems
    -   mr
        -   align with ES6 System loader
        -   align with Node.js internal/external identifier namespaces
    -   for coffeescript: mr-coffee
    -   for web components: gutentag
    -   sourcemaps: ???
-   operators
    -   pop-clear
    -   pop-zip
    -   pop-has
    -   pop-iterate
    -   pop-clone
    -   pop-compare
    -   pop-swap
    -   pop-hash
-   collections
    -   collections
    -   collectionsjs.com
    -   mini-map
-   reactivity
    -   promises: q
    -   io: q-io
    -   event queue: asap
    -   animation coordinator: gutentags/blink
    -   sync change propagation: pop-observe
    -   combining sync change propagation: frb or ???
    -   async change propagation: ??? for operational transforms, crdts
    -   testing with promises: jasminum
    -   gtor: a general theory of reactivity
-   engineering
    -   testing: jasminum
        -   tap output needed
        -   spies: sinon blessed
    - engineering
    -   integration
        -   saucelabs scaffolding
        -   automation for setup

    -   cohort integration
    -   deployment
    -   incremental builds based on js-git
        -   js-git reactive development server
    - 
-   miscelaneous
    -   url2
    -   ndim
    -   tengwarjs
    -   streaming JSON parser: argo
-   properties
    -   delf
    -   codish
    -   3rin.gs
    -   3rin.gs/tengwar
    -   2rin.gs

Backlog

-   argunauts
-   observers / generators for gtor
-   time series combinators for gtor
-   translators for browserify / webpack
-   gutentags logo <‹›>
-   terminal components (gutenacht)
-   mrs to git
-   pop-observe set changes (plus, minus)
-   pop-observe list changes (type, node)
-   <repeat-set>
-   <repeat-list>
-   gutentag svg
-   gutentag chart
-   gutentag graph
-   gutentag fields
-   gutentag json json-schema predicate predicate-field json-field
    inline-json outline-json
-   json-schema for collections


-   source maps
-   columns.html (column view, graph browser)
-   adaptive keyboard
-   

