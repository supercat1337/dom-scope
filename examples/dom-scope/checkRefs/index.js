// @ts-check

import { DomScope } from "../../../dist/dom-scope.esm.js";
//import { DomScope } from "dom-scope";

/** @type {DomScope<{a: HTMLSpanElement, b: HTMLSpanElement}>} */
const domScope = new DomScope(document.body);
// now refs are typed
const refs = domScope.refs;

console.log(refs.a instanceof HTMLSpanElement); // true
console.log(refs.b instanceof HTMLSpanElement); // true

// throws error if the required refs are not correct
domScope.checkRefs({
    a: HTMLSpanElement,
    b: HTMLSpanElement
});

// another way to get typed scope is to use annotation object and then call checkRefs on it
const annotation = {
    a: HTMLDivElement.prototype,
    b: HTMLDivElement.prototype,
    c: HTMLDivElement.prototype
};

let scope = /** @type {DomScope<typeof annotation>} */ (domScope.scopes["my-scope-1"]);
// now refs are typed
const {a, b, c} = scope.refs;

console.log(a instanceof HTMLDivElement); // true
console.log(b instanceof HTMLDivElement); // true
console.log(c instanceof HTMLDivElement); // true

scope.checkRefs(annotation);