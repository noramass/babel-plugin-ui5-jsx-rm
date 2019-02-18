import { transform } from "@babel/core";
import plugin from "./dist";
/// <reference types="@types/babel-core" />
/// <reference types="@types/babel-types" />
/// <reference types="@types/babel-template" />
/// <reference types="@types/babylon" />
/// <reference types="@types/babel-plugin-syntax-jsx" />
/// <reference types="@types/babel-generator" />
/// <reference types="@types/babel-traverse" />

export function fnContent(fn: Function): string {
  return fn.toString().replace(/(?:function[^{]*{([\S\s]*)}|[^=]*=>(?:{([\S\s]*)}|([\S\s]*)))/, "$1$2$3").trim();
}

export function compile(code: string | Function): string {
  if (typeof code === "function") {
    code = fnContent(code);
  }
  let result = transform(code, { plugins: [plugin, "transform-class-properties"] });
  //console.log("\n\nCODE\n", result.code);
  return result.code;
}

export function compileAndRender(code: string | Function, control?: any): string {
  let compiled = compile(code);
  let rm = new MockRenderer();
  let fn = Function("rm", "control", "Control", compiled + "; return typeof MyControl !== 'undefined' ? MyControl : false");
  let result = fn(rm, control, MockControl);
  if (result) {
    // control definition most likely
    let ctrl = new result();
    rm.renderControl(ctrl);
  }
  return rm.getHTML();
}

const htmlesc = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;"
}

const attresc = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;"
}

export class MockControl {
  getId() {
    return "__controlcls1";
  }
  static extend(_: string, definition: object): typeof MockControl & typeof definition {
    let cls = class extends MockControl { };
    for (var k in definition)
      cls.prototype[k] = definition[k];
    return cls;
  }
}

export class MockRenderer {
  content: string = "";
  classes: string[] = [];
  styles: { [key: string]: string } = {};
  controlid: number = 0;
  elementid: number = 0;

  write(str) {
    this.content += str;
  }

  writeEscaped(str) {
    str = "" + str;
    this.content += str.replace(/[<>&]/g, (char: "<" | ">" | "&") => htmlesc[char]);
  }

  writeAttribute(name, value) {
    if (!value) value = name;
    this.write(` ${name}="${value}"`);
  }

  writeAttributeEscaped(name, value) {
    if (!value) value = name;
    value = "" + value;
    this.writeAttribute(
      name.replace(/[<>&'"]/g, (char: "<" | ">" | "&" | "'" | '"') => attresc[char]),
      value.replace(/[<>&'"]/g, (char: "<" | ">" | "&" | "'" | '"') => attresc[char])
    )
  }

  addClass(str) {
    this.classes.push(str);
  }

  writeClasses() {
    if (this.classes.length)
      this.writeAttributeEscaped("class", this.classes.join(" "));
    this.classes = [];
  }

  addStyle(name, value) {
    this.styles[name] = value;
  }

  writeStyles() {
    if (Object.keys(this.styles).length)
      this.writeAttributeEscaped("style", Object.keys(this.styles).map(key => `${key}: ${this.styles[key]}`).join('; '));
    this.styles = {};
  }

  renderControl(control) {
    const rm = new MockRenderer();
    rm.controlid = this.controlid;
    rm.elementid = this.elementid;
    if (control.render)
      control.render(rm, control);
    else if (control.renderer && control.renderer.render)
      control.renderer.render(rm, control);
    else if (control.getRenderer)
      control.getRenderer().render(rm, control);
    else throw new Error("invalid control: " + control.toString());
    this.controlid = rm.controlid;
    this.elementid = rm.elementid;
    this.content += rm.content;
  }

  writeControlData(control) {
    this.writeAttributeEscaped("id", (control && control.getId) ? control.getId() : "__control" + this.controlid++);
  }

  writeElementData(element) {
    this.writeAttributeEscaped("id", (element && element.getId) ? element.getId() : "__element" + this.elementid++);
  }

  writeAccessibilityState(element, properties) {
    this._writeAccessibilityProp("editable", element, properties, false, "aria-readonly");
    this._writeAccessibilityProp("enabled", element, properties, false, "aria-disabled");
    this._writeAccessibilityProp("visible", element, properties, false, "aria-hidden");
    this._writeAccessibilityProp("required", element, properties, true, "aria-required");
    this._writeAccessibilityProp("selected", element, properties, true, "aria-selected");
    this._writeAccessibilityProp("checked", element, properties, true, "aria-checked");
  }

  _writeAccessibilityProp(lookup, element, props, expected, attribute) {
    if (!element.getProperty) props = element;
    let value = element.getProperty ? element.getProperty(lookup) : undefined;
    if (props && (props[lookup] !== undefined))
      value = props[lookup];
    if (value === expected)
      this.writeAttribute(attribute, "true");
  }

  writeIcon(url, classes, attributes) {
    this.renderControl({
      getRenderer: () => ({
        render: (rm) => {
          rm.write("<icon");
          rm.writeAttributeEscaped("src", url);
          (classes || []).forEach(rm.addClass.bind(rm));
          rm.writeClasses();
          for (var k in attributes)
            rm.writeAttributeEscaped(k, attributes[k]);
          rm.write("/>");
        }
      })
    })
  }

  toString() {
    return this.content;
  }

  getHTML() {
    return this.content;
  }
}
