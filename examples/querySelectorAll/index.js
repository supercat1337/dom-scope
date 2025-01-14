// @ts-check

import { DomScope } from "../../dist/dom-scope.esm.js";
//import { DomScope } from "dom-scope";

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name=>attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

let scope = new DomScope(document.body);

let refs_array = scope.querySelectorAll("[ref],[scope]");

refs_array.forEach((element)=>{
    console.log(outputElementInfo(element));
});

/*
outputs:
SPAN ref=a
SPAN ref=b
DIV scope-ref=my-scope-1
DIV scope-ref=my-scope-2 id=my-block
*/
