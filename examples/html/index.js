// @ts-check

import { createFromHTML, selectRefs } from "../../dist/dom-scope.esm.js";

let element = createFromHTML(/*html*/`
    <button ref="minus"> - </button>
    <span ref="count">0</span>
    <button ref="plus"> + </button>
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
