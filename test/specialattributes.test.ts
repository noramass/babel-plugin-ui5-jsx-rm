import "mocha";
import { expect } from "chai";
import { compile, MockRenderer, compileAndRender, fnContent } from "../testsetup";

describe("Special Attributes",()=>{
  describe("ui5control",()=>{
    it("should render the control data (id, etc).",()=>{
      let result = compileAndRender(`<div ui5control></div>`);
      expect(result).to.equal(`<div id="__control0"></div>`);
    });
  });
  describe("ui5element",()=>{
    it("should render the element data (id, etc).",()=>{
      let result = compileAndRender(`<div ui5element></div>`);
      expect(result).to.equal(`<div id="__element0"></div>`);
    });
  });
  describe("ui5aria",()=>{
    it("should render accessibility state information of the control",()=>{
      let result = compile(`<div ui5aria></div>`);
      expect(result).to.match(/rm\.writeAccessibilityState\(\s*control,\s*{\s*}\s*\)/);
    });
    it("should allow for passing a jsx expression with properties",()=>{
      let result = compile(`<div ui5aria={{enabled:false}}></div>`);
      expect(result).to.match(/rm\.writeAccessibilityState\s*\(\s*control\s*,\s*{\s*enabled\s*:\s*false\s*}\s*\)/)
    });
    it("should allow for passing a jsx array with the control and the properties",()=>{
      let result = compile(`<div ui5aria={[control,{enabled:false}]}></div>`);
      expect(result).to.match(/rm\.writeAccessibilityState\s*\(\s*control\s*,\s*{\s*enabled\s*:\s*false\s*}\s*\)/)
    });
  });
  describe("unknown",()=>{
    it("should throw for unknown attributes starting with 'ui5'",()=>{
      expect(compile.bind(null,`<div ui5foobar></div>`)).to.throw();
    });
  })
})
