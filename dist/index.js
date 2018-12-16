"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var visitor_1 = __importDefault(require("./visitor"));
/// <reference types="@types/babel-core" />
/// <reference types="@types/babel-types" />
/// <reference types="@types/babel-template" />
/// <reference types="@types/babylon" />
/// <reference types="@types/babel-plugin-syntax-jsx" />
/// <reference types="@types/babel-generator" />
/// <reference types="@types/babel-traverse" />
function default_1() {
    return visitor_1.default;
}
exports.default = default_1;
