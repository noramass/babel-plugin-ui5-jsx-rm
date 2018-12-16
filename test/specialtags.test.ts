import "mocha";
import { expect } from "chai";
import { compile, MockRenderer, compileAndRender, fnContent } from "../testsetup";

describe("Special Tags", () => {
  describe("ui5control", () => {
    it("should render a control for the content string using getAggregation", () => {
      let result = compile(`<ui5control>content</ui5control>`);
      expect(result).to.match(/rm\.renderControl\(control\.getAggregation\("content"\)\)/);
    });
    it("should render a control for jsx expressions", () => {
      let result = compile(`<ui5control>{control.getContent()}</ui5control>`);
      expect(result).to.match(/rm\.renderControl\(control\.getContent\(\)\)/);
    });
    it("should throw if no string or jsx expression is given", () => {
      expect(compile.bind(null, `<ui5control></ui5control>`)).to.throw();
    });
  });
  describe("ui5aggregation", () => {
    it("should render multiple controls for the content string using getAggregation", () => {
      let result = compile(`<ui5aggregation>content</ui5aggregation>`);
      expect(result).to.match(/\(\s*control\.getAggregation\(\s*"content"\s*\)\s*||\s*[]\s*\)\.forEach\(\s*rm\.renderControl\.bind\(\s*rm\s*\)\s*\)/);
    });
    it("should render multiple controls for jsx expressions", () => {
      let result = compile(`<ui5aggregation>{control.getContent()}</ui5aggregation>`);
      expect(result).to.match(/\(\s*control\.getContent\(\)\s*||\s*[]\s*\)\.forEach\(\s*rm\.renderControl\.bind\(\s*rm\s*\)\s*\)/);
    });
    it("should throw if no string or jsx expression is given", () => {
      expect(compile.bind(null, `<ui5aggregation></ui5aggregation>`)).to.throw();
    });
  });
  describe("ui5icon", () => {
    it("should render a ui5 icon for the content string", () => {
      let result = compileAndRender(`<ui5icon>sap-icon://edit</ui5icon>`);
      expect(result).to.equal(`<icon src="sap-icon://edit"/>`);
    });
    it("should render a ui5 icon for an embedded jsx expression", () => {
      let result = compileAndRender(`<ui5icon>{"sap-icon://edit"}</ui5icon>`);
      expect(result).to.equal(`<icon src="sap-icon://edit"/>`);
    });
    it("should allow for passing an array with url, classes and attributes",()=>{
      let result = compileAndRender(`<ui5icon>{["sap-icon://edit",["foobar","baz"],{height:10,width:10}]}</ui5icon>`);
      expect(result).to.equal(`<icon src="sap-icon://edit" class="foobar baz" height="10" width="10"/>`);
    });
  });
  describe("unknown", () => {
    it("should throw for any unknown tag starting with 'ui5'",()=>{
      expect(compile.bind(null,`<ui5foobar />`)).to.throw();
    });
  });
})
