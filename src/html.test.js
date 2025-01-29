// @ts-check

import { selectRefs, createFromHTML } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";
import { Window } from 'happy-dom';

test("createFromHTML", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    let element = createFromHTML(/*html*/`
<div>
    <span ref="a">a</span>
    <span ref="b">b</span>

    <div scope-ref="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>
</div>
    `, {window: window});

    let refs = selectRefs(element, null, { window: window, include_root: false });

    t.deepEqual(refs, {
        a: element.querySelector('[ref="a"]'),
        b: element.querySelector('[ref="b"]')
    });

    body.appendChild(element);

    let refs_body = selectRefs(body, null, { window: window, include_root: false });

    t.deepEqual(refs, refs_body);

    window.close();
});

test("createFromHTML errors", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    t.throws(() => {
        // no string
        // @ts-expect-error
        createFromHTML(null, {window: window}); 
    });

    t.throws(() => {
        // no window
        createFromHTML(/*html*/`
            <span ref="a">a</span>
            <span ref="b">b</span>
        
            <div scope-ref="my-scope-1">
                <span ref="a">a/1</span>
                <span ref="b">b/1</span>
            </div>
            `); 
    });

    window.close();
});