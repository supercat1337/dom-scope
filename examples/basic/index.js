// @ts-check

import { DomScope } from "./../../dist/dom-scope.esm.js";
//import { DomScope } from "dom-scope";

let scope = new DomScope(document.body);
console.log(scope.root == document.body);
// outputs: true

console.log(scope.refs.a.innerText, scope.refs.b.innerText);
// outputs: a b
console.log(scope.scopes);
// outputs: {"my-scope-1": DomScope, "my-scope-2": DomScope}
console.log(scope.scopes["my-scope-2"].refs.a.innerText, scope.scopes["my-scope-2"].refs.b.innerText);
// outputs: a/2 b/2

console.log(scope.scopes["my-scope-2"].root.getAttribute("id"));
// outputs: my-block

const block_element = /** @type {HTMLElement} */ (document.getElementById("my-block"));
let another_scope = new DomScope(block_element);
console.log(another_scope.refs.a.innerText, another_scope.refs.b.innerText);
// outputs: a/2 b/2

const foo_element = /** @type {HTMLElement} */ (document.getElementById("foo"));
console.log(scope.root.contains(foo_element));
// outputs: true. document.body constains foo_element
console.log(scope.contains(foo_element));
// outputs: false. foo_element is out of #scope
console.log(another_scope.contains(foo_element));
// outputs: true. foo_element is inside of #another_scope
