import "mocha";
import { expect } from "chai";
import { compile, MockRenderer, compileAndRender, fnContent } from "../testsetup";

describe("Normal HTML tags", () => {

  it("should convert a single div tag", () => {
    let result = compileAndRender(`<div></div>`);
    expect(result).to.equal(`<div></div>`);
  });
  it("should convert a selfclosing tag", () => {
    let result = compileAndRender(`<hr/>`);
    expect(result).to.equal(`<hr/>`);
  });
  it("should convert a nested tag", () => {
    let result = compileAndRender(`<div><hr/></div>`);
    expect(result).to.equal(`<div><hr/></div>`);
  });
  it("should convert multiple nested tags", () => {
    let result = compileAndRender(`<div><hr/><div><span></span></div></div>`);
    expect(result).to.equal(`<div><hr/><div><span></span></div></div>`);
  });
  it("should convert text nodes", () => {
    let result = compileAndRender(`<span>Foobar</span>`);
    expect(result).to.equal(`<span>Foobar</span>`);
  });
  it("should convert jsx text nodes", () => {
    let result = compileAndRender(`<span>{['foo','bar'].join('')}</span>`);
    expect(result).to.equal(`<span>foobar</span>`);
  });
  it("should escape text nodes", () => {
    let result = compileAndRender(`<span>{'<>'}</span>`);
    expect(result).to.equal(`<span>&lt;&gt;</span>`);
  });
  it("should render embedded jsx nodes", () => {
    let result = compileAndRender(`<div>{<span>Foobar</span>}</div>`);
    expect(result).to.equal(`<div><span>Foobar</span></div>`);
  });
  it("should render content and embedded jsx nodes", () => {
    let result = compileAndRender(`<div>{[1,2,3].map(function(n){ return (<span>{n}</span>) }).length}</div>`);
    expect(result).to.equal(`<div><span>1</span><span>2</span><span>3</span>3</div>`);
  });

});
