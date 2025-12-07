// @ts-check

import { DomScope } from "../../../dist/dom-scope.esm.js";
//import { DomScope } from "dom-scope";

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
SPAN data-ref=a
SPAN data-ref=b
DIV data-scope=my-scope-1
DIV data-scope=my-scope-2 id=my-block
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
SPAN data-ref=a
SPAN data-ref=b
SPAN id=foo
DIV data-scope=my-scope
DIV data-scope=my-scope-2
*/
