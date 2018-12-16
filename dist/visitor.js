"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_syntax_jsx_1 = __importDefault(require("@babel/plugin-syntax-jsx"));
var renderer_1 = __importDefault(require("./renderer"));
/**
 * Checks if the current path should be processed. Only the top-most JSXElement
 * of a chain of elements is processed.
 */
function shouldProcess(path) {
    return !!path.parent && path.parent.type !== "JSXElement";
}
exports.shouldProcess = shouldProcess;
function transform(path) {
    if (!shouldProcess(path))
        return;
    var renderer = new renderer_1.default(path);
    renderer.transformJSX();
    renderer.transformOnAfterRendering();
}
exports.transform = transform;
var Visitor = {
    inherits: plugin_syntax_jsx_1.default,
    visitor: {
        JSXElement: {
            exit: transform
        }
    }
};
exports.default = Visitor;
