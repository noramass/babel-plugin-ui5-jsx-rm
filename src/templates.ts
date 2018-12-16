import template from "@babel/template";

const tId = template(`RM.writeAttributeEscaped("id",CONTROL.getId() + "-" + ID)`);
export const tmplId = (rm,control,id)=>tId({RM:rm,CONTROL:control,ID:id});

const tClasses = template(`(function(cls){
  cls = cls || [];
  if (typeof cls === "string")
    cls = cls.split(/[\\s\\S]/g);
  if (cls instanceof Array)
    cls.forEach(RM.addClass.bind(RM));
  else if (typeof cls === "object")
    for (var key in cls) if (cls[key])
      RM.addClass(key);
})(CLASSES)`);
export const tmplClasses = (rm,classes)=>tClasses({RM:rm,CLASSES:classes});

const tStyles = template(`(function(styles){
  styles = styles || {};
  if (typeof styles === "string")
    styles.split(';').forEach(function(style){
      var parts = style.split(":");
      RM.addStyle(parts[0].trim(), parts[1].trim());
    });
  else if (styles instanceof Array)
    styles.forEach(function(style){
      RM.addStyle(style.name, style.value);
    });
  else
    for (var key in styles)
      RM.addStyle(key, styles[key]);
  RM.writeStyles();
})(STYLES)`);
export const tmplStyles = (rm,styles)=>tStyles({RM:rm,STYLES:styles});

const tAttributes = template(`(function(attrs){
  attrs = attrs || {};
  for (var k in attrs)
    RM.writeAttributeEscaped(k, attrs[k]);
})(ATTRIBUTES)`);
export const tmplAttributes = (rm,attributes)=>tAttributes({RM:rm,ATTRIBUTES:attributes});

const tHandler = template(`this.DOLLAR().find(ELEMENT).on(EVENT,HANDLER)`);
export const tmplHandler = (element,event,handler)=>tHandler({DOLLAR:'$',ELEMENT:element,EVENT:event,HANDLER:handler});

const tAggregation = template(`(AGGREGATION || []).forEach(RM.renderControl.bind(RM));`);
export const tmplAggregation = (rm,aggregation)=>tAggregation({RM:rm,AGGREGATION:aggregation})

const tControl = template(`if (CONTROL) RM.renderControl(CONTROL);`);
export const tmplControl = (rm,control)=>tControl({RM:rm,CONTROL:control});
