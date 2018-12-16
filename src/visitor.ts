import jsx from "@babel/plugin-syntax-jsx";
import { NodePath } from "@babel/traverse";
import { JSXElement } from "@babel/types";
import Renderer from "./renderer";

/**
 * Checks if the current path should be processed. Only the top-most JSXElement
 * of a chain of elements is processed.
 */
export function shouldProcess(path: NodePath<JSXElement>) {
  return !!path.parent && path.parent.type !== "JSXElement";
}

export function transform(path: NodePath<JSXElement>) {
  if (!shouldProcess(path)) return;
  const renderer = new Renderer(path);
  renderer.transformJSX();
  renderer.transformOnAfterRendering();
}

const Visitor = {
  inherits: jsx,
  visitor: {
    JSXElement: {
      exit: transform
    }
  }
}

export default Visitor;
