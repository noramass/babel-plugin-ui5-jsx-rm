import { NodePath } from "@babel/traverse";
import { Function, Node, JSXElement, Identifier, Statement, Expression, ObjectExpression, CallExpression, MemberExpression, ClassBody, JSXAttribute, JSXSpreadAttribute, JSXText, JSXExpressionContainer, StringLiteral, JSXFragment } from "@babel/types";
export declare function nextHandlerId(): string;
export declare namespace nextHandlerId {
    var current: number;
}
export default class Renderer {
    path: NodePath<JSXElement>;
    rmcalls: Statement[];
    handlerAttachments: Statement[];
    rm: Identifier;
    _control: Identifier;
    controlClass?: NodePath<ClassBody>;
    controlObject?: NodePath<ObjectExpression>;
    onAfterRendering?: NodePath<Function>;
    renderFunction?: NodePath<Function>;
    needsControl: boolean;
    readonly control: Identifier;
    constructor(path: NodePath<JSXElement>);
    _isRenderCall(node: Node): node is CallExpression;
    /**
     * find the render manager identifier from render call signature.
     * If that fails, searches the parent function call for its first argument.
     * If it can't find any, it returns a default identifier "rm".
     * @return {Identifier} the render manager name
     * @example oRM.render(<div></div>); // => oRM
     * @example render(oRM) { <div></div> } // => oRM
     * @example <div></div> // => rm (default)
     */
    findRenderManager(): Identifier;
    /**
     * Finds the control parameter name from the enclosing render function, if it exists.
     * render functions have two parameters by default: the render manager and the control.
     * if it doesn't find it, it returns a default identifier "control".
     * @return {Identifier} the control name
     * @example render(oRM,oControl) { oRM.render(<div></div>); } // => oControl
     * @example rm.render(<div></div>); // => control (default)
     */
    findControl(): Identifier;
    /**
     * Finds the path for the enclosing control class, if it exists.
     * Else returns undefined.
     * @return {ClassBody|void} the class path
     */
    findControlClass(): NodePath<ClassBody> | void;
    /**
     * Finds the path for the enclosing control object class definition, if it exists.
     * Else returns undefined.
     * @return {ObjectExpression|undefined} the class path
     */
    findControlObject(): NodePath<ObjectExpression> | void;
    /**
     * Finds the onAfterRendering method of the enclosing control class / object definition, if it exists.
     * Else returns undefined
     * @return {Function|undefined}
     */
    findOrCreateOnAfterRendering(): NodePath<Function> | void;
    findOnAfterRenderingMethod(): NodePath<Function> | void;
    findOnAfterRenderingProperty(): NodePath<Function> | void;
    createOnAfterRenderingMethod(): NodePath<Function> | void;
    createOnAfterRenderingProperty(): NodePath<Function> | void;
    buildFromJSX(): void;
    _call(method: string, ...args: Expression[]): void;
    _member(name: string): MemberExpression;
    write(str: Expression): void;
    writeEscaped(str: Expression): void;
    writeAttribute(name: Expression, value: Expression): void;
    writeAttributeEscaped(name: Expression, value: Expression): void;
    addClass(cls: Expression): void;
    writeClasses(): void;
    addStyle(name: Expression, value: Expression): void;
    writeStyles(): void;
    writeControlData(control?: Expression): void;
    writeElementData(element?: Expression): void;
    writeAccessibilityState(control?: Expression, properties?: Expression): void;
    writeIcon(url: Expression, ...args: Expression[]): void;
    renderElement(node: JSXElement): void;
    renderText(node: JSXText): void;
    renderExpression(node: JSXExpressionContainer): void;
    renderAttribute(node: JSXAttribute | JSXSpreadAttribute): void;
    renderId(val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer): void;
    renderClass(val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer): void;
    renderStyle(val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer): void;
    renderAttributes(node: JSXSpreadAttribute): void;
    renderSpecialAttribute(name: string, val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer): void;
    renderEventHandler(name: string, val: StringLiteral | JSXElement | JSXFragment | JSXExpressionContainer): void;
    renderSpecialTag(tag: string, node: JSXElement): void;
    renderUI5Control(node: JSXElement): void;
    renderUI5Aggregation(node: JSXElement): void;
    renderUI5Icon(node: JSXElement): void;
    transformJSX(): void;
    transformOnAfterRendering(): void;
}
