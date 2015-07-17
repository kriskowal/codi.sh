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

    var text = "";

    text += "var body = " + JSON.stringify(marked(body)) + ";\n";
    text += "var see = []\n";

    head.see.forEach(function (link) {
        if (link.href) {
            module.dependencies.push(link.href);
            text +=
                "see.push({label: " + JSON.stringify(link.label) +
                ", href: " + JSON.stringify(link.href) +
                ", value: require(" + JSON.stringify(link.href) + ")});\n";
        }
    });

    text += "var slug = " + JSON.stringify(head.slug) + ";\n";
    text += "var head = {see: see, slug: slug};\n";
    text += "exports.head = head;\n";
    text += "exports.body = body;\n";

    module.text = text;
}

