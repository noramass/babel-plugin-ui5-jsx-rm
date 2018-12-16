import "mocha";
import { expect } from "chai";
import { compile, MockRenderer, compileAndRender, fnContent } from "../testsetup";


describe("Normal Attributes", () => {
  it("should render a basic attribute", () => {
    let result = compileAndRender(`<div width="10"></div>`);
    expect(result).to.equal(`<div width="10"></div>`);
  });
  it("should render multiple basic attributes", () => {
    let result = compileAndRender(`<div width="10" height="10"></div>`);
    expect(result).to.equal(`<div width="10" height="10"></div>`);
  });
  it("should render attributes with jsx values", () => {
    let result = compileAndRender(`<div width={10}></div>`);
    expect(result).to.equal(`<div width="10"></div>`);
  });
  it("should escape attributes with jsx values", () => {
    let result = compileAndRender(`<img alt={"<Foobar>"}/>`);
    expect(result).to.equal(`<img alt="&lt;Foobar&gt;"/>`);
  });
  it("should unpack spread attribute maps", () => {
    let result = compileAndRender(`<div {...{width:10,height:10}}></div>`);
    expect(result).to.equal(`<div width="10" height="10"></div>`);
  });
  it("should prefix id attributes", () => {
    let result = compileAndRender(`var control = {getId(){return "__control0"}};
    <div id="test"></div>`);
    expect(result).to.equal(`<div id="__control0-test"></div>`);
  });
  it("should render class attributes", () => {
    let result = compileAndRender(`<div class="some class"></div>`);
    expect(result).to.equal(`<div class="some class"></div>`);
  });
  it("should render class jsx arrays", () => {
    let result = compileAndRender(`<div class={["some","class"]}></div>`);
    expect(result).to.equal(`<div class="some class"></div>`);
  });
  it("should render class jsx maps", () => {
    let result = compileAndRender(`<div class={{foo:true,bar:true,baz:false}}></div>`);
    expect(result).to.equal(`<div class="foo bar"></div>`);
  });
  it("should render style attributes", () => {
    let result = compileAndRender(`<div style="width:10px;height:20px;"></div>`);
    expect(result).to.equal(`<div style="width: 10px; height: 20px"></div>`);
  });
  it("should render style jsx maps", () => {
    let result = compileAndRender(`<div style={{width:"12px",height:"14px"}}></div>`);
    expect(result).to.equal(`<div style="width: 12px; height: 14px"></div>`);
  });
  it("should render style jsx arrays", () => {
    let result = compileAndRender(`<div style={[{name:'width',value:'10px'},{name:'height',value:'5px'}]}></div>`);
    expect(result).to.equal(`<div style="width: 10px; height: 5px"></div>`);
  });
});
