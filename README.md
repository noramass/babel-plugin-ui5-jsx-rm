# @rdme/babel-plugin-jsx-ui5
```BASH
npm i --save-dev @rdme/babel-plugin-jsx-ui5
```
## Summary
`@rdme/babel-plugin-jsx-ui5` is a babel plugin for transforming JSX expressions to UI5 RenderManager calls.
Embedded controls, aggregations and event handlers are supported.
It works for ES6 Classes, UI5 Control.extend calls and UI5 Renderer files, though event handlers are not supported for UI5 Renderer files, as it modifies the onAfterRendering method.

## Usage
To use this plugin simply install it via `npm i --save-dev @rdme/babel-plugin-jsx-ui5` and add it to your babel configuration like this:
```JSON
{
	"plugins": ["@rdme/jsx-ui5"]
}
```

For event handlers it will generate special handler classes to attach to in the `onAfterRendering` method, creating one if none exist.

## Control Data
To write control data, like control ids, etc. use the `ui5control` attribute. It supports an optional jsx expression containing the control.
Ex1:
```JSX
<div ui5control />
// Becomes
rm.write("<div");
rm.writeControlData(control);
rm.writeClasses();
rm.write("/>");
```
Ex2:
```JSX
<div ui5control={someControl} />
// Becomes
rm.write("<div");
rm.writeControlData(someControl);
rm.writeClasses();
rm.write("/>");
```
## Element Data
Element data functions exactly like control data, just using the `ui5element` attribute instead.
## IDs
ID attributes are automatically prefixed by the control id. It works with text nodes and jsx expressions.
Ex1:
```JSX
<span id="someSpan" />
// Becomes
rm.write("<span");
rm.writeAttributeEscaped(control.getId() + '-' + "someSpan");
rm.writeClasses();
rm.write("/>");
```
Ex2:
```JSX
<span id={control.getSomething()} />
// Becomes
rm.write("<span");
rm.writeAttributeEscaped(control.getId() + '-' + control.getSomething());
rm.writeClasses();
rm.write("/>");
```
## Classes
Classes can be defined using a string with space-sepparated class name or a jsx expression.
If a jsx expression is given, it may contain anything resembling an array, an object or a string.
This does not have to be a literal.
Examples:
```JSX
<div class="some class"></div>
<div class={["some","class"]}></div>
<div class={{some:true,class:true,foo:false}}></div>
// Will all render
<div class="some class"></div>
```
## Styles
Styles can be defined using a string with styles or a jsx expression.
If a jsx expression is given, it may contain anything resembling an array, an object or a string.
This does not have to be a literal.
Examples:
```JSX
<div style="width:10px;height:20px;"></div>
<div style={{width:"10px",height:"20px"}}></div>
<div style={[{name:'width',value:'10px'},{name:'height',value:'20px'}]}></div>
// Will all render
<div style="width: 10px; height: 20px"></div>
```
## Event Handlers
Event handlers are special attributes starting with "on" (e.g. "onclick"). They expect a value in form of a jsx expression or string literal and are only supported inside of classes or UI5 'extend' expressions, as they modify or create the `onAfterRendering` method for the given control.
These attributes will be stripped from the control and a special handler class ('\_\_handler' + incrementing number) is added. Later in the onAfterRendering method the event handlers will be attached to the controls using jQuery.
If a string is given as a value, it is assumed to be a method declared on the current control and will be bound correspondingly. If however a jsx expression is given, it will not be bound or accessed on "this", so it is necessary to bind it yourself. Also take note that since the contents of the expressions are moved to the onAfterRendering method, the this context changes from the renderer to the control.
Ex1:
```JSX
// Renderer
<button onclick="_onButtonClick">Press Me</button>
// Becomes
// Renderer
rm.write("<button");
rm.addClass("__handler0");
rm.writeClasses();
rm.write(">");
rm.writeEscaped("Press Me");
rm.write("</button>");
// onAfterRendering
this.$().find('.__handler0').on('click',this._onButtonClick.bind(this));
```
Ex2:
```JSX
// Renderer
<button onclick={this._onButtonClick.bind(this)}>Press Me</button>
// Becomes
// Renderer
rm.write("<button");
rm.addClass("__handler0");
rm.writeClasses();
rm.write(">");
rm.writeEscaped("Press Me");
rm.write("</button>");
// onAfterRendering
this.$().find('.__handler0').on('click',this._onButtonClick.bind(this));
```
Ex3:
```JSX
// Renderer
<button onclick={alert.bind(window,"Hello World")}>Press Me</button>
// Becomes
// Renderer
rm.write("<button");
rm.addClass("__handler0");
rm.writeClasses();
rm.write(">");
rm.writeEscaped("Press Me");
rm.write("</button>");
// onAfterRendering
this.$().find('.__handler0').on('click',alert.bind(window,"Hello World"));
```
Ex4:
```JSX
// Renderer
<button onclick="fireButtonPress">Press Me</button>
// Becomes
// Renderer
rm.write("<button");
rm.addClass("__handler0");
rm.writeClasses();
rm.write(">");
rm.writeEscaped("Press Me");
rm.write("</button>");
// onAfterRendering
this.$().find('.__handler0').on('click',this.fireButtonPress.bind(this));
```
## Spread Attributes
Spread attributes are supported in the form of arrays or objects.
They will not be interpreted by the special attributes such as "id", "class", "style", "on\*", "ui5\*".

## Aggregations
Aggregations with multiple controls can be embedded with `<ui5aggregation>` tags. They expect either a text node or jsx expression as a child. If a text node is given, it will look up the given text (trimmed) with `control.getAggregation(text)`.
If a jsx expression is given, it will just use it without wrapping it in a `control.getAggregation` call.
Ex1:
```JSX
<ui5aggregation>content</ui5aggregation>
// Becomes
(control.getAggregation("content") || []).forEach(rm.renderControl.bind(rm));
```
Ex2:
```JSX
<ui5aggregation>{control.getContent()}</ui5aggregation>
// Becomes
(control.getContent() || []).forEach(rm.renderControl.bind(rm));
```

## Controls
Single control aggregations can be embedded with `<ui5control>` tags. Similar to aggregations with multiple controls, single control aggregations expect either a text node or jsx expression as a child. If a text node is given, it will look up the given text (trimmed) with `control.getAggregation(text)`.
If a jsx expression is given, it will just use it without wrapping it in a `control.getAggregation` call.
Ex1:
```JSX
<ui5control>content</ui5control>
// Becomes
if(control.getAggregation("content")) rm.renderControl(control.getAggregation("content"));
```
Ex2:
```JSX
<ui5control>{control.getContent()}</ui5control>
// Becomes
if(control.getContent()) rm.renderControl(control.getContent());
```
## Icons
For UI5 Icons there exists a helper tag called `<ui5icon>`. It expects a text node or jsx expression as a child.
If a text node is given, it is assumed to be an icon url or image source. If you need to provide additional classes or attributes, you can pass a jsx expression with an embedded array literal instead. All arguments provided in said array literal are passed to the UI5 RenderManager method `writeIcon`.
Ex1:
```JSX
<ui5icon>sap-icon://accept</ui5icon>
// Becomes
rm.writeIcon("sap-icon://accept");
```
Ex2:
```JSX
<ui5icon>{["sap-icon://value-help",["some-class"],{"aria-hidden":true}]}</ui5icon>
// Becomes
rm.writeIcon("sap-icon://value-help",["some-class"],{"aria-hidden":true});
```


## Examples
### UI5 Control
This will work out of the box without any other plugins
```JSX
sap.ui.define(["sap/ui/core/Control"], function(Control) {
	return Control.extend("my.Control",{
		metadata: {
			properties: {
				title: { type: "string" },
			},
			aggregations: {
				content: { type: "sap.ui.core.Control", multiple: true },
				footer: { type: "sap.m.IBar", multiple: false }
			},
			events: {
				buttonPress: {}
			}
		},
		renderer: {
			render: function(rm, control) {
				rm.render(<div ui5control>
					<h1>{control.getTitle()}</h1>
					<div id="content">
						<ui5aggregation>content</ui5aggregation>
					</div>
					{this.renderFoobar(rm,control)}
					<button onclick="fireButtonPress">
						<ui5icon>sap-icon://accept</ui5icon>
						Press Me!
					</button>
					<ui5control>footer</ui5control>
				</div>);
			},
			renderFoobar: function(rm, control) {
				rm.render(<div id="foobar">
					<span>Foobar</span>
				</div>);
			},
		}
	});
});
```
### ES6 Class
This needs additional plugins for import and exports and class properties (e.g. [babel-plugin-transform-modules-ui5](https://www.npmjs.com/package/babel-plugin-transform-modules-ui5)).
```JSX
import Control from "sap/ui/core/Control";
export default class MyControl extends Control {
	static metadata = {
		properties: {
			title: { type: "string" },
		},
		aggregations: {
			content: { type: "sap.ui.core.Control", multiple: true },
			footer: { type: "sap.m.IBar", multiple: false }
		},
		events: {
			buttonPress: {}
		}
	},
	static renderer: {
		render(rm, control) {
			rm.render(<div ui5control>
				<h1>{control.getTitle()}</h1>
				<div id="content">
					<ui5aggregation>content</ui5aggregation>
				</div>
				{this.renderFoobar(rm,control)}
				<button onclick="fireButtonPress">
					<ui5icon>sap-icon://accept</ui5icon>
					Press Me!
				</button>
				<ui5control>footer</ui5control>
			</div>);
		},
		renderFoobar(rm, control) {
			rm.render(<div id="foobar">
				<span>Foobar</span>
			</div>);
		},
	}
}

```
