// @ts-check

import { createFromHTML, selectRefs } from "../../dist/dom-scope.esm.js";

const root = createFromHTML(/*html*/`
    <span data-ref="a">1</span>
    <span data-ref="b">1</span>

    <div data-scope="another_scope">
        <span data-ref="a">2</span>
        <span data-ref="b">2</span>
        <span data-ref="c">2</span>
    </div>

    <span data-ref="c">1</span>
`);

const wrong_annotation = {
    "a": HTMLElement,
    "b": HTMLDivElement,
    "c": HTMLSpanElement
};

try {
    // select refs and check if they are correct
    let refs = selectRefs(root, wrong_annotation);
}
catch (e) {
    if (!(e instanceof Error)) throw e;
    console.log(e.message);
    // occures: The data-ref "b" must be an instance of HTMLDivElement (actual: HTMLSpanElement)
}

const annotation = {
    "a": HTMLSpanElement,
    "b": HTMLSpanElement,
    "c": HTMLSpanElement
};

let refs = selectRefs(root, annotation);
const { a, b, c } = refs;

console.log(a.textContent, b.textContent, c.textContent);
// outputs: 1 1 1

document.body.appendChild(root);