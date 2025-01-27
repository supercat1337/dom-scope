// @ts-check

import { selectRefs } from "../../dist/dom-scope.esm.js";

const wrong_annotation = {
    "a": HTMLSpanElement,
    "b": HTMLDivElement
};

try {
    // select refs and check if they are correct
    let refs = selectRefs(document.body, wrong_annotation);
}
catch (e) {
    // throws error because ref 'b' is HTMLDivElement, not HTMLSpanElement
    console.log(e.message);
    // The ref "b" must be an instance of HTMLDivElement (actual: HTMLSpanElement)
}

const annotation = {
    "a": HTMLSpanElement,
    "b": HTMLSpanElement
};

// select refs and check if they are correct
let refs = selectRefs(document.body, annotation);

// another format of annotation to use types
const annotation_2 = {
    "a": HTMLSpanElement.prototype,
    "b": HTMLSpanElement.prototype
};

// select refs and check if they are correct
/** @type {typeof annotation_2} */
let refs_2 = selectRefs(document.body, annotation_2);

let { a, b } = refs_2;

a.innerText = "a";
b.innerText = "b";

console.log(a.innerText, b.innerText);
// outputs: a b