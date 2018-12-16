import "mocha";
import { expect } from "chai";
import { compile, MockRenderer, compileAndRender, fnContent } from "../testsetup";

const onAfterRenderingWithOneHandler = /onAfterRendering[^)]*\)[\s\S]*{[^t]*this\.\$\(\)\.find\(\s*"\.__handler[0-9]+"\s*\)\.on\(\s*"click"\s*,\s*this\._onButtonPress\.bind\(\s*this\s*\)\s*\)[^}]*}/;

describe("Event Handlers",()=>{
  describe("renderer",()=>{
    it("remove any attribute starting with 'on' from the rendering process",()=>{
      let result = compileAndRender(`rm.render(<div onclick="_onButtonPress"></div>)`);
      expect(result).to.not.match(/onclick/);
    });
    it("should add a special handler class to the given current element",()=>{
        let result = compileAndRender(`rm.render(<div onclick="_onButtonPress"></div>)`);
        expect(result).to.match(/class="__handler[0-9]+"/);
    });
  });
  describe("control class with renderer object",()=>{
    it("should create a onAfterRendering method if none exist",()=>{
      let result = compile(`class Foobar extends Control {
        static renderer = {
          render(rm,control) {
            rm.render(<div onclick="_onButtonPress"></div>);
          }
        }
      }`);
      expect(result).to.match(/onAfterRendering/);
    });
    it("should add handler attachments for strings to the onAfterRendering method",()=>{
      let result = compile(`class Foobar extends Control {
        static renderer = {
          render(rm,control) {
            rm.render(<div onclick="_onButtonPress"></div>);
          }
        }
      }`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
    it("should add handler attachments for jsx expressions to the onAfterRendering method",()=>{
      let result = compile(`class Foobar extends Control {
        static renderer = {
          render(rm,control) {
            rm.render(<div onclick={this._onButtonPress.bind(this)}></div>);
          }
        }
      }`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
  });

  describe("control class with render method",()=>{
    it("should create a onAfterRendering method if none exist",()=>{
      let result = compile(`class Foobar extends Control {
        render(rm,control) {
          rm.render(<div onclick="_onButtonPress"></div>);
        }
      }`);
      expect(result).to.match(/onAfterRendering/);
    });
    it("should add handler attachments for strings to the onAfterRendering method",()=>{
      let result = compile(`class Foobar extends Control {
        render(rm,control) {
          rm.render(<div onclick="_onButtonPress"></div>);
        }
      }`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
    it("should add handler attachments for jsx expressions to the onAfterRendering method",()=>{
      let result = compile(`class Foobar extends Control {
        render(rm,control) {
          rm.render(<div onclick={this._onButtonPress.bind(this)}></div>);
        }
      }`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
  });

  describe("control object with renderer object",()=>{
    it("should create a onAfterRendering method if none exist",()=>{
      let result = compile(`Control.extend("MyControl",{
        renderer: {
          render: function(rm,control) {
            rm.render(<div onclick="_onButtonPress"></div>);
          }
        }
      })`);
      expect(result).to.match(/onAfterRendering/);
    });
    it("should add handler attachments for strings to the onAfterRendering method", ()=>{
      let result = compile(`Control.extend("MyControl",{
        renderer: {
          render: function(rm,control) {
            rm.render(<div onclick="_onButtonPress"></div>);
          }
        }
      })`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
    it("should add handler attachments for jsx expressions to the onAfterRendering method", ()=>{
      let result = compile(`Control.extend("MyControl",{
        renderer: {
          render: function(rm,control) {
            rm.render(<div onclick={this._onButtonPress.bind(this)}></div>);
          }
        }
      })`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
  });

  describe("control object with render method",()=>{
    it("should create a onAfterRendering method if none exist",()=>{
      let result = compile(`Control.extend("MyControl",{
        render: function(rm,control) {
          rm.render(<div onclick="_onButtonPress"></div>);
        }
      })`);
      expect(result).to.match(/onAfterRendering/);
    });
    it("should add handler attachments for strings to the onAfterRendering method",()=>{
      let result = compile(`Control.extend("MyControl",{
        render: function(rm,control) {
          rm.render(<div onclick="_onButtonPress"></div>);
        }
      })`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
    it("should add handler attachments for jsx expressions to the onAfterRendering method",()=>{
      let result = compile(`Control.extend("MyControl",{
        render: function(rm,control) {
          rm.render(<div onclick={this._onButtonPress.bind(this)}></div>);
        }
      })`);
      expect(result).to.match(onAfterRenderingWithOneHandler);
    });
  });
})
