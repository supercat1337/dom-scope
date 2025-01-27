// @ts-check

import { DomScope } from "../../../dist/dom-scope.esm.js";

globalThis.DomScope = DomScope;

const annotation = {
    "a": HTMLSpanElement.prototype,
    "b": HTMLDivElement.prototype
};

/** @type {DomScope<typeof annotation>} */
let scope = new DomScope(document.body);

console.log(scope.root == document.body);
// outputs: true

scope.checkRefs(annotation);

scope.refs.a.innerText = "a";
scope.refs.b.innerText = "b";

console.log(scope.refs.a.innerText, scope.refs.b.innerText);
// outputs: a b
console.log(scope.scopes);
// outputs: {"my-scope-1": DomScope, "my-scope-2": DomScope}
console.log(scope.scopes["my-scope-2"].refs.a.innerText, scope.scopes["my-scope-2"].refs.b.innerText);
// outputs: a/2 b/2

// @ts-ignore
console.log(scope.scopes["my-scope-2"].root.getAttribute("id"));
// outputs: my-block


scope.checkRefs({
    "a": HTMLSpanElement,
    "b": HTMLSpanElement
});

scope.checkRefs({
    "a": HTMLSpanElement.prototype,
    "b": HTMLSpanElement.prototype
});



const block_element = /** @type {HTMLElement} */ (document.getElementById("my-block"));

/** @type {DomScope<{"a": HTMLDivElement, "b": HTMLSpanElement}>} */
let another_scope = new DomScope(block_element);

another_scope.checkRefs({
    "a": HTMLSpanElement,
    "b": HTMLSpanElement
});

console.log(another_scope.refs.a.innerText, another_scope.refs.b.innerText);
// outputs: a/2 b/2

const foo_element = /** @type {HTMLElement} */ (document.getElementById("foo"));
console.log(scope.root.contains(foo_element));
// outputs: true. document.body constains foo_element
console.log(scope.contains(foo_element));
// outputs: false. foo_element is out of #scope
console.log(another_scope.contains(foo_element));
// outputs: true. foo_element is inside of #another_scope


