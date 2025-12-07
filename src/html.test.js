// @ts-check

import { selectRefs, createFromHTML } from './../src/index.js';
import test from 'ava';
import { Window } from 'happy-dom';

test('createFromHTML', t => {
    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    let element = createFromHTML(
        /*html*/ `
<div>
    <span data-ref="a">a</span>
    <span data-ref="b">b</span>

    <div data-scope="my-scope-1">
        <span data-ref="a">a/1</span>
        <span data-ref="b">b/1</span>
    </div>
</div>
    `,
        { window: window }
    );

    let refs = selectRefs(element, null, {
        window: window,
        includeRoot: false,
    });

    t.deepEqual(refs, {
        a: element.querySelector('[data-ref="a"]'),
        b: element.querySelector('[data-ref="b"]'),
    });

    body.appendChild(element);

    let refs_body = selectRefs(body, null, {
        window: window,
        includeRoot: false,
    });

    t.deepEqual(refs, refs_body);

    window.close();
});

test('createFromHTML errors', t => {
    const window = new Window({ url: 'https://localhost:8080' });

    t.throws(() => {
        // no string
        // @ts-expect-error
        createFromHTML(null, { window: window });
    });

    window.close();
});

