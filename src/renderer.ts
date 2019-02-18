import { NodePath } from "@babel/traverse";
import { Function, Node, JSXElement, stringLiteral, memberExpression, Identifier, identifier, callExpression, expressionStatement, Statement, Expression, ClassExpression, ObjectExpression, FunctionExpression, isCallExpression, isMemberExpression, isIdentifier, CallExpression, MemberExpression, AssignmentExpression, ClassBody, ClassMethod, ObjectMethod, JSXIdentifier, JSXAttribute, JSXSpreadAttribute, JSXText, JSXExpressionContainer, parenthesizedExpression, binaryExpression, logicalExpression, StringLiteral, JSXFragment, thisExpression, ObjectProperty, objectProperty, functionExpression, blockStatement, classMethod, objectExpression } from "@babel/types";
import { tmplId, tmplClasses, tmplStyles, tmplAttributes, tmplHandler, tmplAggregation, tmplControl } from "./templates";

export function nextHandlerId() {
  return '__handler' + nextHandlerId.current++;
}
nextHandlerId.current = 0;

export default class Renderer {
  path: NodePath<JSXElement>;
  rmcalls: Statement[] = [];
  handlerAttachments: Statement[] = [];
  rm: Identifier;
  control: Identifier;
  controlClass?: NodePath<ClassBody>;
  controlObject?: NodePath<ObjectExpression>;
  onAfterRendering?: NodePath<Function>;

  constructor(path: NodePath<JSXElement>) {
    this.path = path;
    this.rm = this.findRenderManager();
    this.control = this.findControl();
    this.controlClass = this.findControlClass() || undefined;
    this.controlObject = this.findControlObject() || undefined;
    this.onAfterRendering = this.findOrCreateOnAfterRendering() || undefined;
    this.buildFromJSX();
  }

  _isRenderCall(node: Node): node is CallExpression {
    return isCallExpression(node)
      && isMemberExpression(node.callee)
      && isIdentifier(node.callee.property, { name: "render" })
      && isIdentifier(node.callee.object);
  }

  /**
   * find the render manager identifier from render call signature.
   * If it can't find any, it returns a default identifier "rm".
   * @return {Identifier} the render manager name
   * @example oRM.render(<div></div>); // => oRM
   * @example <div></div> // => rm (default)
   */
  findRenderManager(): Identifier {
    let parent: NodePath = this.path;
    while (parent && !this._isRenderCall(parent.node))
      parent = parent.parentPath;
    return identifier(parent && parent.node ? (<any>parent.node).callee.object.name : "rm");
  }

  /**
   * Finds the control parameter name from the enclosing render function, if it exists.
   * render functions have two parameters by default: the render manager and the control.
   * if it doesn't find it, it returns a default identifier "control".
   * @return {Identifier} the control name
   * @example render(oRM,oControl) { oRM.render(<div></div>); } // => oControl
   * @example rm.render(<div></div>); // => control (default)
   */
  findControl(): Identifier {
    let parent: NodePath = this.path;
    let defaultVal: Identifier = identifier("control");
    while (parent && !this._isRenderCall(parent.node))
      parent = parent.parentPath;
    if (!parent || !parent.parentPath) return defaultVal;
    parent = parent.parentPath;
    let params = (<FunctionExpression>parent.scope.block).params;
    if (!params || params.length < 2) return defaultVal;
    return <Identifier>params[1];
  }


  /**
   * Finds the path for the enclosing control class, if it exists.
   * Else returns undefined.
   * @return {ClassBody|void} the class path
   */
  findControlClass(): NodePath<ClassBody> | void {
    let parent: NodePath = this.path;
    while (parent) {
      if (parent.node.type === "ClassBody") {
        return <NodePath<ClassBody>>parent;
      } else if (parent.node.type === "AssignmentExpression") {
        let left = parent.node.left;
        if (left.type === "MemberExpression") {
          let name = (<Identifier>left.object).name;
          let classPath = parent.scope.bindings[name].path;
          if (classPath.node.type === "ClassDeclaration") {
            return <NodePath<ClassBody>>classPath.get("body");
          }
        }
      }
      parent = parent.parentPath;
    }
  }

  /**
   * Finds the path for the enclosing control object class definition, if it exists.
   * Else returns undefined.
   * @return {ObjectExpression|undefined} the class path
   */
  findControlObject(): NodePath<ObjectExpression> | void {
    let parent: NodePath = this.path;
    while (parent) {
      if (parent.node.type === "ObjectExpression" && parent.parentPath.node.type !== "ObjectProperty") {
        return <NodePath<ObjectExpression>>parent;
      }
      parent = parent.parentPath;
    }
  }

  /**
   * Finds the onAfterRendering method of the enclosing control class / object definition, if it exists.
   * Else returns undefined
   * @return {Function|undefined}
   */
  findOrCreateOnAfterRendering(): NodePath<Function> | void {
    if (this.controlClass) {
      let oar = this.findOnAfterRenderingMethod();
      if (oar) return oar;
      return this.createOnAfterRenderingMethod();
    } else if (this.controlObject) {
      let oar = this.findOnAfterRenderingProperty();
      if (oar) return oar;
      return this.createOnAfterRenderingProperty();
    }
  }

  findOnAfterRenderingMethod(): NodePath<Function> | void {
    let onAfterRendering: NodePath<Function> | void;
    this.controlClass.traverse({
      ClassMethod(path: NodePath<ClassMethod>) {
        if ((<Identifier>path.node.key).name === "onAfterRendering")
          onAfterRendering = path;
      }
    });
    return onAfterRendering;
  }

  findOnAfterRenderingProperty(): NodePath<Function> | void {
    let onAfterRendering: NodePath<Function> | void;
    this.controlObject.traverse({
      ObjectProperty(path: NodePath<ObjectProperty>) {
        if (path.node.key.name === "onAfterRendering")
          onAfterRendering = <NodePath<ObjectMethod>><any>path.get('value');
      }
    });
    return onAfterRendering;
  }

  createOnAfterRenderingMethod(): NodePath<Function> | void {
    let node = classMethod("method",
      identifier("onAfterRendering"),
      [],
      blockStatement([])
    );
    (<any>this.controlClass).pushContainer("body", node);

    return this.findOnAfterRenderingMethod();
  }

  createOnAfterRenderingProperty(): NodePath<Function> | void {
    let node = objectProperty(
      identifier("onAfterRendering"),
      functionExpression(
        identifier("_onAfterRendering"),
        [],
        blockStatement([])
      )
    );
    (<any>this.controlObject).pushContainer("properties", node);
    return this.findOnAfterRenderingProperty();
  }

  buildFromJSX() {
    this.renderElement(this.path.node);
  }

  _call(method: string, ...args: Expression[]) {
    this.rmcalls.push(expressionStatement(callExpression(this._member(method), args)));
  }

  _member(name: string) {
    return memberExpression(this.rm, identifier(name));
  }

  write(str: Expression) {
    if (str.type === "StringLiteral")
      if (/^\s*$/.test(str.value))
        return
    this._call("write", str);
  }

  writeEscaped(str: Expression) {
    if (str.type === "StringLiteral")
      if (/^\s*$/.test(str.value))
        return
    this._call("writeEscaped", str);
  }

  writeAttribute(name: Expression, value: Expression) {
    this._call("writeAttribute", name, value);
  }

  writeAttributeEscaped(name: Expression, value: Expression) {
    this._call("writeAttributeEscaped", name, value)
  }

  addClass(cls: Expression) {
    this._call("addClass", cls);
  }

  writeClasses() {
    this._call("writeClasses");
  }

  addStyle(name: Expression, value: Expression) {
    this._call("addStyle", name, value);
  }

  writeStyles() {
    this._call("writeStyles");
  }

  writeControlData(control?: Expression) {
    this._call("writeControlData", control || this.control);
  }

  writeElementData(element?: Expression) {
    this._call("writeElementData", element || this.control);
  }

  writeAccessibilityState(control?: Expression, properties?: Expression) {
    this._call("writeAccessibilityState", control, properties);
  }

  writeIcon(url: Expression, ...args: Expression[]) {
    this._call("writeIcon", url, ...args);
  }

  renderElement(node: JSXElement) {
    let open = node.openingElement;
    let tag = (<JSXIdentifier>open.name).name;
    if (tag.indexOf("ui5") === 0)
      return this.renderSpecialTag(tag, node);
    let single = node.openingElement.selfClosing;
    let attrs = node.openingElement.attributes;
    let children = node.children;
    this.write(stringLiteral(`<${tag}`));
    attrs.forEach(this.renderAttribute.bind(this));
    this.writeClasses();
    this.write(stringLiteral(single ? `/>` : `>`));
    children.forEach(child => {
      switch (child.type) {
        case "JSXElement": this.renderElement(child); break;
        case "JSXText": this.renderText(child); break;
        case "JSXExpressionContainer": this.renderExpression(child); break;
        case "JSXFragment":
        case "JSXSpreadChild":
        default:
          this.renderExpression(<any>child); break;
      }
    });
    if (!single)
      this.write(stringLiteral(`</${tag}>`));
  }

  renderText(node: JSXText) {
    this.writeEscaped(stringLiteral(node.value));
  }

  renderExpression(node: JSXExpressionContainer) {
    if (node.expression.type !== "JSXEmptyExpression")
      this.writeEscaped(parenthesizedExpression(logicalExpression("||", node.expression, stringLiteral(""))));
  }

  renderAttribute(node: JSXAttribute | JSXSpreadAttribute) {
    if (node.type === "JSXSpreadAttribute")
      return this.renderAttributes(node);
    let nameAttr = node.name, name;
    let val = node.value;
    if (nameAttr.type === "JSXIdentifier") name = nameAttr.name
    else name = nameAttr.name.name
    if (name.indexOf("ui5") === 0) return this.renderSpecialAttribute(name, val);
    if (name.indexOf("on") === 0) return this.renderEventHandler(name, val);
    switch (name) {
      case "id": this.renderId(val); break;
      case "class": this.renderClass(val); break;
      case "style": this.renderStyle(val); break;
      default:
        if (val.type !== "JSXExpressionContainer")
          this.writeAttributeEscaped(stringLiteral(name), val);
        else if (val.expression.type !== "JSXEmptyExpression")
          this.writeAttributeEscaped(stringLiteral(name), val.expression);
    }
  }

  renderId(val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer) {
    this.rmcalls.push(tmplId(this.rm, this.control, val.type === "JSXExpressionContainer" ? val.expression : val));
  }

  renderClass(val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer) {
    if (val.type === "StringLiteral")
      return val.value.split(/[\s]/g).map(s => s.trim()).filter(s => s).map(s => stringLiteral(s)).forEach(this.addClass.bind(this));
    this.rmcalls.push(tmplClasses(this.rm, val.type === "JSXExpressionContainer" ? val.expression : val));
  }

  renderStyle(val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer) {
    if (val.type === "StringLiteral")
      val.value.split(';').map(s => s.trim()).filter(s => s).map(style => style.split(':')).forEach(parts => this.addStyle(stringLiteral(parts[0].trim()), stringLiteral(parts[1].trim())));
    else
      this.rmcalls.push(tmplStyles(this.rm, val.type === "JSXExpressionContainer" ? val.expression : val));
    this.writeStyles();
  }

  renderAttributes(node: JSXSpreadAttribute) {
    this.rmcalls.push(tmplAttributes(this.rm, node.argument));
  }

  renderSpecialAttribute(name: string, val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer) {
    switch (name) {
      case "ui5control": this.writeControlData(); break;
      case "ui5element": this.writeElementData(); break;
      case "ui5aria":
        if (!val)
          return this.writeAccessibilityState(this.control, objectExpression([]));
        if (val.type === "JSXExpressionContainer" && val.expression.type !== "JSXEmptyExpression") {
          if (val.expression.type === "ArrayExpression") {
            let elements = val.expression.elements;
            if (elements.length === 2) {
              return this.writeAccessibilityState(<any>elements[0], <any>elements[1]);
            }
          } else if (val.expression.type === "ObjectExpression") {
            return this.writeAccessibilityState(this.control, val.expression);
          }
        }
        break;
      default: throw new SyntaxError("Unknown special attribute: " + name);
    }
  }

  renderEventHandler(name: string, val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer) {
    let clsName = nextHandlerId();
    let handler: Expression;
    this.addClass(stringLiteral(clsName));
    if (val.type === "JSXExpressionContainer" && val.expression.type !== "JSXEmptyExpression")
      handler = val.expression;
    if (val.type === "StringLiteral")
      handler = callExpression(memberExpression(memberExpression(thisExpression(), identifier(val.value)), identifier("bind")), [thisExpression()]);
    else if (val.type !== "JSXExpressionContainer")
      handler = val;
    this.handlerAttachments.push(tmplHandler(stringLiteral('.' + clsName), stringLiteral(name.substr(2)), handler));
  }

  renderSpecialTag(tag: string, node: JSXElement) {
    switch (tag) {
      case "ui5ctrl":
      case "ui5control": this.renderUI5Control(node); break;
      case "ui5aggr":
      case "ui5aggregation": this.renderUI5Aggregation(node); break;
      case "ui5icon": this.renderUI5Icon(node); break;
      default: throw new SyntaxError("Unknown special tag: " + tag);
    }
  }

  renderUI5Control(node: JSXElement) {
    let child = node.children[0];
    let expr: Expression;
    if (!child) throw new SyntaxError("Expected child element for ui5control tag.");
    switch (child.type) {
      case "JSXExpressionContainer":
        if (child.expression.type === "JSXEmptyExpression")
          throw new SyntaxError("Expected child element for ui5control tag to not be empty.");
        expr = child.expression;
        break;
      case "JSXText":
        expr = callExpression(memberExpression(this.control, identifier("getAggregation")), [stringLiteral(child.value)]);
        break;
      default:
        throw new SyntaxError("Expected child element for ui5control tag to be of type JSXExpressionContainer or JSXText.");
    }
    this.rmcalls.push(tmplControl(this.rm, expr));
  }

  renderUI5Aggregation(node: JSXElement) {
    let child = node.children[0];
    let expr: Expression;
    if (!child) throw new SyntaxError("Expected child element for ui5aggregation tag.");
    switch (child.type) {
      case "JSXExpressionContainer":
        if (child.expression.type === "JSXEmptyExpression")
          throw new SyntaxError("Expected child element for ui5aggregation tag to not be empty.");
        expr = child.expression;
        break;
      case "JSXText":
        expr = callExpression(memberExpression(this.control, identifier("getAggregation")), [stringLiteral(child.value)]);
        break;
      default:
        throw new SyntaxError("Expected child element for ui5aggregation tag to be of type JSXExpressionContainer or JSXText.");
    }
    this.rmcalls.push(tmplAggregation(this.rm, expr));
  }

  renderUI5Icon(node: JSXElement) {
    let child = node.children[0];
    if (!child) throw new SyntaxError("Expected child element for ui5icon tag.");
    switch (child.type) {
      case "JSXExpressionContainer":
        if (child.expression.type === "JSXEmptyExpression")
          throw new SyntaxError("Expected child element for ui5icon tag to not be empty.");
        if (child.expression.type === "ArrayExpression") {
          let elements = child.expression.elements;
          this.writeIcon(<any>elements[0], <any>elements[1], <any>elements[2]);
        } else if (child.expression.type === "StringLiteral") {
          this.writeIcon(child.expression);
        } else {
          this.writeIcon(child.expression);
        }
        break;
      case "JSXText":
        this.writeIcon(stringLiteral(child.value));
        break;
      default:
        throw new SyntaxError("Expected child element for ui5icon tag to be of type JSXExpressionContainer or JSXText.");
    }

  }




  transformJSX(): void {
    this.path.parentPath.replaceWithMultiple(this.rmcalls);
  }
  transformOnAfterRendering(): void {
    if (!this.onAfterRendering) return;
    (<any>this.onAfterRendering.get("body")).pushContainer("body", this.handlerAttachments);
  }

}
