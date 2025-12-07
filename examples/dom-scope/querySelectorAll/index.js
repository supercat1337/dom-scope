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

let refs_array = scope.querySelectorAll("[data-ref],[data-scope]");

refs_array.forEach((element)=>{
    console.log(outputElementInfo(element));
});

/*
outputs:
SPAN data-ref=a
SPAN data-ref=b
DIV data-scope=my-scope-1
DIV data-scope=my-scope-2 id=my-block
*/
