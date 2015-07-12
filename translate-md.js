"use strict";

var marked = require("marked");

module.exports = translateMd;

function translateMd(module) {
    var body = module.text;
    var document = {
        head: {},
        body: body ? marked(body, {
        }) : ""
    };
    module.text = "module.exports = " + JSON.stringify(document) + ";";
}
