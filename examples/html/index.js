// @ts-check

import { createFromHTML, selectRefs } from "../../dist/dom-scope.esm.js";

let element = createFromHTML(/*html*/`
    <button data-ref="minus"> - </button>
    <span data-ref="count">0</span>
    <button data-ref="plus"> + </button>
`);

const annotation = {
    minus: HTMLButtonElement,
    count: HTMLSpanElement,
    plus: HTMLButtonElement
};

let value = 0;

let refs = selectRefs(element, annotation);
const { minus, count, plus } = refs;

minus.addEventListener("click", ()=>{
    if (value > 0) value--;
    count.textContent = value.toString();
});

plus.addEventListener("click", ()=>{
    value++;
    count.textContent = value.toString();
});

document.body.appendChild(element);
