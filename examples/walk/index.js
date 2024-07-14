// @ts-check

import { DomScope } from "./../../dist/dom-scope.esm.js";
//import { DomScope } from "@supercat1337/dom-scope";

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name=>attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

let scope = new DomScope(document.body);
scope.walk((element)=>{
    console.log(outputElementInfo(element));
});
/*
outputs:
SPAN ref=a
SPAN ref=b
DIV scope-name=my-scope-1
DIV scope-name=my-scope-2 id=my-block
SCRIPT src=index.js type=module
*/

const block_element = /** @type {HTMLElement} */ (document.getElementById("my-block"));
let another_scope = new DomScope(block_element);
console.log("----------------");
another_scope.walk((element)=>{
    console.log(outputElementInfo(element));
});
/*
outputs:
SPAN ref=a
SPAN ref=b
SPAN id=foo
DIV scope-name=my-scope
DIV scope-name=my-scope-2
*/
