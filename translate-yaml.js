"use strict";

var YAML = require("js-yaml");
var marked = require("marked");

module.exports = translateYaml;

function translateYaml(module) {
    var parts = [];
    YAML.safeLoadAll(module.text, function (part) {
        parts.push(part);
    });
    var head = parts[0] || {};
    head.see = head.see || [];
    var body = parts[1];
    var document = {
        head: head,
        body: body ? marked(body, {
        }) : ""
    };
    if (head.see) {
        head.see.forEach(function (link) {
            if (link.href) {
                module.dependencies.push(link.href);
            }
        });
    }
    module.text = "module.exports = " + JSON.stringify(document) + ";";
}

