// @ts-check

import { DomScope } from "../../../dist/dom-scope.esm.js";
//import { DomScope } from "dom-scope";

/**
 * @param {DomScope<any>} scope 
 */
function showRefsText(scope) {
    let { a, b } = scope.refs;
    console.log(a.innerText, b.innerText);
}

let template_element = /** @type {HTMLTemplateElement} */ (document.querySelector("template"));
let document_fragment = template_element.content;

let scope = new DomScope(document_fragment);
showRefsText(scope);
// outputs: a b

let my_block = /** @type {HTMLElement} */ (document_fragment.querySelector("#my-block"));
let scope_2 = new DomScope(my_block);
showRefsText(scope_2);
// outputs: a/2 b/2