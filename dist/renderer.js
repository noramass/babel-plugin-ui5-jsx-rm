"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@babel/types");
var templates_1 = require("./templates");
function nextHandlerId() {
    return '__handler' + nextHandlerId.current++;
}
exports.nextHandlerId = nextHandlerId;
nextHandlerId.current = 0;
var Renderer = /** @class */ (function () {
    function Renderer(path) {
        this.rmcalls = [];
        this.handlerAttachments = [];
        this.path = path;
        this.rm = this.findRenderManager();
        this.control = this.findControl();
        this.controlClass = this.findControlClass() || undefined;
        this.controlObject = this.findControlObject() || undefined;
        this.onAfterRendering = this.findOrCreateOnAfterRendering() || undefined;
        this.buildFromJSX();
    }
    Renderer.prototype._isRenderCall = function (node) {
        return types_1.isCallExpression(node)
            && types_1.isMemberExpression(node.callee)
            && types_1.isIdentifier(node.callee.property, { name: "render" })
            && types_1.isIdentifier(node.callee.object);
    };
    /**
     * find the render manager identifier from render call signature.
     * If it can't find any, it returns a default identifier "rm".
     * @return {Identifier} the render manager name
     * @example oRM.render(<div></div>); // => oRM
     * @example <div></div> // => rm (default)
     */
    Renderer.prototype.findRenderManager = function () {
        var parent = this.path;
        while (parent && !this._isRenderCall(parent.node))
            parent = parent.parentPath;
        return types_1.identifier(parent && parent.node ? parent.node.callee.object.name : "rm");
    };
    /**
     * Finds the control parameter name from the enclosing render function, if it exists.
     * render functions have two parameters by default: the render manager and the control.
     * if it doesn't find it, it returns a default identifier "control".
     * @return {Identifier} the control name
     * @example render(oRM,oControl) { oRM.render(<div></div>); } // => oControl
     * @example rm.render(<div></div>); // => control (default)
     */
    Renderer.prototype.findControl = function () {
        var parent = this.path;
        var defaultVal = types_1.identifier("control");
        while (parent && !this._isRenderCall(parent.node))
            parent = parent.parentPath;
        if (!parent || !parent.parentPath)
            return defaultVal;
        parent = parent.parentPath;
        var params = parent.scope.block.params;
        if (!params || params.length < 2)
            return defaultVal;
        return params[1];
    };
    /**
     * Finds the path for the enclosing control class, if it exists.
     * Else returns undefined.
     * @return {ClassBody|void} the class path
     */
    Renderer.prototype.findControlClass = function () {
        var parent = this.path;
        while (parent) {
            if (parent.node.type === "ClassBody") {
                return parent;
            }
            else if (parent.node.type === "AssignmentExpression") {
                var left = parent.node.left;
                if (left.type === "MemberExpression") {
                    var name_1 = left.object.name;
                    var classPath = parent.scope.bindings[name_1].path;
                    if (classPath.node.type === "ClassDeclaration") {
                        return classPath.get("body");
                    }
                }
            }
            parent = parent.parentPath;
        }
    };
    /**
     * Finds the path for the enclosing control object class definition, if it exists.
     * Else returns undefined.
     * @return {ObjectExpression|undefined} the class path
     */
    Renderer.prototype.findControlObject = function () {
        var parent = this.path;
        while (parent) {
            if (parent.node.type === "ObjectExpression" && parent.parentPath.node.type !== "ObjectProperty") {
                return parent;
            }
            parent = parent.parentPath;
        }
    };
    /**
     * Finds the onAfterRendering method of the enclosing control class / object definition, if it exists.
     * Else returns undefined
     * @return {Function|undefined}
     */
    Renderer.prototype.findOrCreateOnAfterRendering = function () {
        if (this.controlClass) {
            var oar = this.findOnAfterRenderingMethod();
            if (oar)
                return oar;
            return this.createOnAfterRenderingMethod();
        }
        else if (this.controlObject) {
            var oar = this.findOnAfterRenderingProperty();
            if (oar)
                return oar;
            return this.createOnAfterRenderingProperty();
        }
    };
    Renderer.prototype.findOnAfterRenderingMethod = function () {
        var onAfterRendering;
        this.controlClass.traverse({
            ClassMethod: function (path) {
                if (path.node.key.name === "onAfterRendering")
                    onAfterRendering = path;
            }
        });
        return onAfterRendering;
    };
    Renderer.prototype.findOnAfterRenderingProperty = function () {
        var onAfterRendering;
        this.controlObject.traverse({
            ObjectProperty: function (path) {
                if (path.node.key.name === "onAfterRendering")
                    onAfterRendering = path.get('value');
            }
        });
        return onAfterRendering;
    };
    Renderer.prototype.createOnAfterRenderingMethod = function () {
        var node = types_1.classMethod("method", types_1.identifier("onAfterRendering"), [], types_1.blockStatement([]));
        this.controlClass.pushContainer("body", node);
        return this.findOnAfterRenderingMethod();
    };
    Renderer.prototype.createOnAfterRenderingProperty = function () {
        var node = types_1.objectProperty(types_1.identifier("onAfterRendering"), types_1.functionExpression(types_1.identifier("_onAfterRendering"), [], types_1.blockStatement([])));
        this.controlObject.pushContainer("properties", node);
        return this.findOnAfterRenderingProperty();
    };
    Renderer.prototype.buildFromJSX = function () {
        this.renderElement(this.path.node);
    };
    Renderer.prototype._call = function (method) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.rmcalls.push(types_1.expressionStatement(types_1.callExpression(this._member(method), args)));
    };
    Renderer.prototype._member = function (name) {
        return types_1.memberExpression(this.rm, types_1.identifier(name));
    };
    Renderer.prototype.write = function (str) {
        this._call("write", str);
    };
    Renderer.prototype.writeEscaped = function (str) {
        this._call("writeEscaped", str);
    };
    Renderer.prototype.writeAttribute = function (name, value) {
        this._call("writeAttribute", name, value);
    };
    Renderer.prototype.writeAttributeEscaped = function (name, value) {
        this._call("writeAttributeEscaped", name, value);
    };
    Renderer.prototype.addClass = function (cls) {
        this._call("addClass", cls);
    };
    Renderer.prototype.writeClasses = function () {
        this._call("writeClasses");
    };
    Renderer.prototype.addStyle = function (name, value) {
        this._call("addStyle", name, value);
    };
    Renderer.prototype.writeStyles = function () {
        this._call("writeStyles");
    };
    Renderer.prototype.writeControlData = function (control) {
        this._call("writeControlData", control || this.control);
    };
    Renderer.prototype.writeElementData = function (element) {
        this._call("writeElementData", element || this.control);
    };
    Renderer.prototype.writeAccessibilityState = function (control, properties) {
        this._call("writeAccessibilityState", control, properties);
    };
    Renderer.prototype.writeIcon = function (url) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this._call.apply(this, ["writeIcon", url].concat(args));
    };
    Renderer.prototype.renderElement = function (node) {
        var _this = this;
        var open = node.openingElement;
        var tag = open.name.name;
        if (tag.indexOf("ui5") === 0)
            return this.renderSpecialTag(tag, node);
        var single = node.openingElement.selfClosing;
        var attrs = node.openingElement.attributes;
        var children = node.children;
        this.write(types_1.stringLiteral("<" + tag));
        attrs.forEach(this.renderAttribute.bind(this));
        this.writeClasses();
        this.write(types_1.stringLiteral(single ? "/>" : ">"));
        children.forEach(function (child) {
            switch (child.type) {
                case "JSXElement":
                    _this.renderElement(child);
                    break;
                case "JSXText":
                    _this.renderText(child);
                    break;
                case "JSXExpressionContainer":
                    _this.renderExpression(child);
                    break;
                case "JSXFragment":
                case "JSXSpreadChild":
                default:
                    _this.renderExpression(child);
                    break;
            }
        });
        if (!single)
            this.write(types_1.stringLiteral("</" + tag + ">"));
    };
    Renderer.prototype.renderText = function (node) {
        this.writeEscaped(types_1.stringLiteral(node.value));
    };
    Renderer.prototype.renderExpression = function (node) {
        if (node.expression.type !== "JSXEmptyExpression")
            this.writeEscaped(types_1.parenthesizedExpression(types_1.logicalExpression("||", node.expression, types_1.stringLiteral(""))));
    };
    Renderer.prototype.renderAttribute = function (node) {
        if (node.type === "JSXSpreadAttribute")
            return this.renderAttributes(node);
        var nameAttr = node.name, name;
        var val = node.value;
        if (nameAttr.type === "JSXIdentifier")
            name = nameAttr.name;
        else
            name = nameAttr.name.name;
        if (name.indexOf("ui5") === 0)
            return this.renderSpecialAttribute(name, val);
        if (name.indexOf("on") === 0)
            return this.renderEventHandler(name, val);
        switch (name) {
            case "id":
                this.renderId(val);
                break;
            case "class":
                this.renderClass(val);
                break;
            case "style":
                this.renderStyle(val);
                break;
            default:
                if (val.type !== "JSXExpressionContainer")
                    this.writeAttributeEscaped(types_1.stringLiteral(name), val);
                else if (val.expression.type !== "JSXEmptyExpression")
                    this.writeAttributeEscaped(types_1.stringLiteral(name), val.expression);
        }
    };
    Renderer.prototype.renderId = function (val) {
        this.rmcalls.push(templates_1.tmplId(this.rm, this.control, val.type === "JSXExpressionContainer" ? val.expression : val));
    };
    Renderer.prototype.renderClass = function (val) {
        if (val.type === "StringLiteral")
            return val.value.split(/[\s]/g).map(function (s) { return s.trim(); }).filter(function (s) { return s; }).map(function (s) { return types_1.stringLiteral(s); }).forEach(this.addClass.bind(this));
        this.rmcalls.push(templates_1.tmplClasses(this.rm, val.type === "JSXExpressionContainer" ? val.expression : val));
    };
    Renderer.prototype.renderStyle = function (val) {
        var _this = this;
        if (val.type === "StringLiteral")
            val.value.split(';').map(function (s) { return s.trim(); }).filter(function (s) { return s; }).map(function (style) { return style.split(':'); }).forEach(function (parts) { return _this.addStyle(types_1.stringLiteral(parts[0].trim()), types_1.stringLiteral(parts[1].trim())); });
        else
            this.rmcalls.push(templates_1.tmplStyles(this.rm, val.type === "JSXExpressionContainer" ? val.expression : val));
        this.writeStyles();
    };
    Renderer.prototype.renderAttributes = function (node) {
        this.rmcalls.push(templates_1.tmplAttributes(this.rm, node.argument));
    };
    Renderer.prototype.renderSpecialAttribute = function (name, val) {
        switch (name) {
            case "ui5control":
                this.writeControlData();
                break;
            case "ui5element":
                this.writeElementData();
                break;
            case "ui5aria":
                if (!val)
                    return this.writeAccessibilityState(this.control, types_1.objectExpression([]));
                if (val.type === "JSXExpressionContainer" && val.expression.type !== "JSXEmptyExpression") {
                    if (val.expression.type === "ArrayExpression") {
                        var elements = val.expression.elements;
                        if (elements.length === 2) {
                            return this.writeAccessibilityState(elements[0], elements[1]);
                        }
                    }
                    else if (val.expression.type === "ObjectExpression") {
                        return this.writeAccessibilityState(this.control, val.expression);
                    }
                }
                break;
            default: throw new SyntaxError("Unknown special attribute: " + name);
        }
    };
    Renderer.prototype.renderEventHandler = function (name, val) {
        var clsName = nextHandlerId();
        var handler;
        this.addClass(types_1.stringLiteral(clsName));
        if (val.type === "JSXExpressionContainer" && val.expression.type !== "JSXEmptyExpression")
            handler = val.expression;
        if (val.type === "StringLiteral")
            handler = types_1.callExpression(types_1.memberExpression(types_1.memberExpression(types_1.thisExpression(), types_1.identifier(val.value)), types_1.identifier("bind")), [types_1.thisExpression()]);
        else if (val.type !== "JSXExpressionContainer")
            handler = val;
        this.handlerAttachments.push(templates_1.tmplHandler(types_1.stringLiteral('.' + clsName), types_1.stringLiteral(name.substr(2)), handler));
    };
    Renderer.prototype.renderSpecialTag = function (tag, node) {
        switch (tag) {
            case "ui5ctrl":
            case "ui5control":
                this.renderUI5Control(node);
                break;
            case "ui5aggr":
            case "ui5aggregation":
                this.renderUI5Aggregation(node);
                break;
            case "ui5icon":
                this.renderUI5Icon(node);
                break;
            default: throw new SyntaxError("Unknown special tag: " + tag);
        }
    };
    Renderer.prototype.renderUI5Control = function (node) {
        var child = node.children[0];
        var expr;
        if (!child)
            throw new SyntaxError("Expected child element for ui5control tag.");
        switch (child.type) {
            case "JSXExpressionContainer":
                if (child.expression.type === "JSXEmptyExpression")
                    throw new SyntaxError("Expected child element for ui5control tag to not be empty.");
                expr = child.expression;
                break;
            case "JSXText":
                expr = types_1.callExpression(types_1.memberExpression(this.control, types_1.identifier("getAggregation")), [types_1.stringLiteral(child.value)]);
                break;
            default:
                throw new SyntaxError("Expected child element for ui5control tag to be of type JSXExpressionContainer or JSXText.");
        }
        this.rmcalls.push(templates_1.tmplControl(this.rm, expr));
    };
    Renderer.prototype.renderUI5Aggregation = function (node) {
        var child = node.children[0];
        var expr;
        if (!child)
            throw new SyntaxError("Expected child element for ui5aggregation tag.");
        switch (child.type) {
            case "JSXExpressionContainer":
                if (child.expression.type === "JSXEmptyExpression")
                    throw new SyntaxError("Expected child element for ui5aggregation tag to not be empty.");
                expr = child.expression;
                break;
            case "JSXText":
                expr = types_1.callExpression(types_1.memberExpression(this.control, types_1.identifier("getAggregation")), [types_1.stringLiteral(child.value)]);
                break;
            default:
                throw new SyntaxError("Expected child element for ui5aggregation tag to be of type JSXExpressionContainer or JSXText.");
        }
        this.rmcalls.push(templates_1.tmplAggregation(this.rm, expr));
    };
    Renderer.prototype.renderUI5Icon = function (node) {
        var child = node.children[0];
        if (!child)
            throw new SyntaxError("Expected child element for ui5icon tag.");
        switch (child.type) {
            case "JSXExpressionContainer":
                if (child.expression.type === "JSXEmptyExpression")
                    throw new SyntaxError("Expected child element for ui5icon tag to not be empty.");
                if (child.expression.type === "ArrayExpression") {
                    var elements = child.expression.elements;
                    this.writeIcon(elements[0], elements[1], elements[2]);
                }
                else if (child.expression.type === "StringLiteral") {
                    this.writeIcon(child.expression);
                }
                else {
                    this.writeIcon(child.expression);
                }
                break;
            case "JSXText":
                this.writeIcon(types_1.stringLiteral(child.value));
                break;
            default:
                throw new SyntaxError("Expected child element for ui5icon tag to be of type JSXExpressionContainer or JSXText.");
        }
    };
    Renderer.prototype.transformJSX = function () {
        this.path.parentPath.replaceWithMultiple(this.rmcalls);
    };
    Renderer.prototype.transformOnAfterRendering = function () {
        if (!this.onAfterRendering)
            return;
        this.onAfterRendering.get("body").pushContainer("body", this.handlerAttachments);
    };
    return Renderer;
}());
exports.default = Renderer;
