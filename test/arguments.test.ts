import "mocha";
import { expect } from "chai";
import { compile, MockRenderer, compileAndRender, fnContent } from "../testsetup";

describe("Discover Render Arguments", () => {
  describe("Plain render statements", () => {
    it("should discover the member the 'render' function was called on", () => {
      let result = compile(`name1.render(<div />)`);
      expect(result).to.contain('name1');
      expect(result).to.not.contain('rm');
    });
  });
  describe("Function Statements", () => {
    it("should discover the renderer argument name", () => {
      let result = compile(`function render(name1) {
        <div />
      }`);
      expect(result).to.contain('name1');
      expect(result).to.not.contain('rm');
    });
    it("should discover the control argument name", () => {
      let result = compile(`function render(name1, name2) {
        <div ui5control/>
      }`);
      expect(result).to.contain('name2');
      expect(result).to.not.contain('control');
    });
    it("should add the renderer argument if it doesn't exist", () => {
      let result = compile(`function render() {
        <div />
      }`);
      expect(result).to.contain('render(rm)');
    });
    it("should add the control argument if it doesn't exist", () => {
      let result = compile(`function render() {
        <div ui5control/>
      }`);
      expect(result).to.contain('render(rm, control)');
    });
  });

  describe("Arrow Function Statements", () => {
    it("should discover the renderer argument name", () => {
      let result = compile(`const render = name1 => {
        <div />
      }`);
      expect(result).to.contain('name1');
      expect(result).to.not.contain('rm');
    });
    it("should discover the control argument name", () => {
      let result = compile(`const render = (name1, name2) => {
        <div ui5control/>
      }`);
      expect(result).to.contain('name2');
      expect(result).to.not.contain('control');
    });
    it("should add the renderer argument if it doesn't exist", () => {
      let result = compile(`const render = () => {
        <div />
      }`);
      expect(result).to.contain('rm =>');
    });
    it("should add the control argument if it doesn't exist", () => {
      let result = compile(`const render = () => {
        <div ui5control/>
      }`);
      expect(result).to.contain('(rm, control) =>');
    });
  });

  describe("Object Methods", () => {
    it("should discover the renderer argument name", () => {
      let result = compile(`({render(name1) {
        <div />
      }})`);
      expect(result).to.contain('name1');
      expect(result).to.not.contain('rm');
    });
    it("should discover the control argument name", () => {
      let result = compile(`({render(name1, name2) {
        <div ui5control/>
      }})`);
      expect(result).to.contain('name2');
      expect(result).to.not.contain('control');
    });
    it("should add the renderer argument if it doesn't exist", () => {
      let result = compile(`({render() {
        <div />
      }})`);
      expect(result).to.contain('render(rm)');
    });
    it("should add the control argument if it doesn't exist", () => {
      let result = compile(`({render() {
        <div ui5control/>
      }})`);
      expect(result).to.contain('render(rm, control)');
    });
  });

  describe("Class Methods", () => {
    it("should discover the renderer argument name", () => {
      let result = compile(`(class {render(name1) {
        <div />
      }})`);
      expect(result).to.contain('name1');
      expect(result).to.not.contain('rm');
    });
    it("should discover the control argument name", () => {
      let result = compile(`(class {render(name1, name2) {
        <div ui5control/>
      }})`);
      expect(result).to.contain('name2');
      expect(result).to.not.contain('control');
    });
    it("should add the renderer argument if it doesn't exist", () => {
      let result = compile(`(class {render() {
        <div />
      }})`);
      expect(result).to.contain('render(rm)');
    });
    it("should add the control argument if it doesn't exist", () => {
      let result = compile(`(class {render() {
        <div ui5control/>
      }})`);
      expect(result).to.contain('render(rm, control)');
    });
  });
});
