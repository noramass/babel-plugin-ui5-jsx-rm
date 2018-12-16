import { NodePath } from "@babel/traverse";
import { JSXElement } from "@babel/types";
/**
 * Checks if the current path should be processed. Only the top-most JSXElement
 * of a chain of elements is processed.
 */
export declare function shouldProcess(path: NodePath<JSXElement>): boolean;
export declare function transform(path: NodePath<JSXElement>): void;
declare const Visitor: {
    inherits: any;
    visitor: {
        JSXElement: {
            exit: typeof transform;
        };
    };
};
export default Visitor;
