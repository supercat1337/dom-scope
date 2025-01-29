// @ts-check

import { selectRefs, selectRefsExtended, walkDomScope, checkRefs } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";
import { Window } from 'happy-dom';

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name => attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

test("selectRefs", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
<span ref="a">a</span>
<span ref="b">b</span>

<div scope-ref="my-scope-1">
    <span ref="a">a/1</span>
    <span ref="b">b/1</span>
</div>

<div scope-ref="my-scope-2" id="my-block">    
    <span ref="a">a/2</span>
    <span ref="b">b/2</span>
    <span id="foo">foo</span>

    <div scope-ref="my-scope">    
        <span ref="a">a/2/1</span>
        <span ref="b">b/2/1</span>
    </div>

    <div scope-ref="my-scope-2">    
        <span ref="a">a/2/2</span>
        <span ref="b">b/2/2</span>
    </div>

</div>
`;

    let refs = selectRefs(body, null, { window: window });

    let entries = Object.entries(refs);

    t.is(entries.length, 2);
    t.is(entries[0][1].getAttribute("ref"), "a");
    t.is(entries[1][1].getAttribute("ref"), "b");

    window.close();
});


test("selectRefs (with include_root == true)", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
<span ref="a">a</span>
<span ref="b">b</span>

<div scope-ref="my-scope-1">
    <span ref="a">a/1</span>
    <span ref="b">b/1</span>
</div>

<div scope-ref="my-scope-2" id="my-block">    
    <span ref="a">a/2</span>
    <span ref="b">b/2</span>
    <span id="foo">foo</span>

    <div scope-ref="my-scope">    
        <span ref="a">a/2/1</span>
        <span ref="b">b/2/1</span>
    </div>

    <div scope-ref="my-scope-2">    
        <span ref="a">a/2/2</span>
        <span ref="b">b/2/2</span>
    </div>

</div>
`;

    let refs = selectRefs(body, null, { window: window, include_root: true });
    t.is(refs.root, body);


    window.close();
});


test("selectRefs (with annotation)", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
<span ref="a">a</span>
<span ref="b">b</span>

<div scope-ref="my-scope-1">
    <span ref="a">a/1</span>
    <span ref="b">b/1</span>
</div>

<div scope-ref="my-scope-2" id="my-block">    
    <span ref="a">a/2</span>
    <span ref="b">b/2</span>
    <span id="foo">foo</span>

    <div scope-ref="my-scope">    
        <span ref="a">a/2/1</span>
        <span ref="b">b/2/1</span>
    </div>

    <div scope-ref="my-scope-2">    
        <span ref="a">a/2/2</span>
        <span ref="b">b/2/2</span>
    </div>

</div>
`;

    const annotation = {
        "a": window.HTMLSpanElement.prototype,
        "b": window.HTMLSpanElement.prototype,
    };

    t.notThrows(() => {
        // @ts-ignore
        let refs = selectRefs(body, annotation, { window: window });
    });

    const annotation1 = {
        "a": window.HTMLSpanElement,
        "b": window.HTMLSpanElement,
    };

    t.notThrows(() => {
        // @ts-ignore
        let refs = selectRefs(body, annotation1, { window: window });
    });

    const annotation2 = {
        "a": window.HTMLSpanElement.prototype,
        "b": window.HTMLSpanElement.prototype,
        "c": window.HTMLSpanElement.prototype
    };

    t.throws(() => {
        // @ts-ignore
        let refs = selectRefs(body, annotation2, { window: window });
    });

    window.close();
});


test("selectRefs (no window object for tests)", t => {
    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span ref="a">a</span>
    <span ref="b">b</span>
    
    <div scope-ref="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>
    
    <div scope-ref="my-scope-2" id="my-block">    
        <span ref="a">a/2</span>
        <span ref="b">b/2</span>
        <span id="foo">foo</span>
    
        <div scope-ref="my-scope">    
            <span ref="a">a/2/1</span>
            <span ref="b">b/2/1</span>
        </div>
    
        <div scope-ref="my-scope-2">    
            <span ref="a">a/2/2</span>
            <span ref="b">b/2/2</span>
        </div>
    
    </div>
    `;

    t.throws(() => {
        let refs = selectRefs(body);
    });

    window.close();
});

test("walkDomScope", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span ref="a">a</span>
    <span ref="b">b</span>
    
    <div scope-ref="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>
    
    <div scope-ref="my-scope-2" id="my-block">    
        <span ref="a">a/2</span>
        <span ref="b">b/2</span>
        <span id="foo">foo</span>
    
        <div scope-ref="my-scope">    
            <span ref="a">a/2/1</span>
            <span ref="b">b/2/1</span>
        </div>
    
        <div scope-ref="my-scope-2">    
            <span ref="a">a/2/2</span>
            <span ref="b">b/2/2</span>
        </div>
    
    </div>
    `;

    var foo = 0;
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    walkDomScope(body, callback, { window: window });

    t.is(foo, 4);
    window.close();

});

test("selectRefsExtended", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
<span ref="a">a</span>
<span ref="b">b</span>

<div scope-ref="my-scope-1">
    <span ref="a">a/1</span>
    <span ref="b">b/1</span>
</div>

<div scope-ref="my-scope-2" id="my-block">    
    <span ref="a">a/2</span>
    <span ref="b">b/2</span>
    <span id="foo">foo</span>

    <div scope-ref="my-scope">    
        <span ref="a">a/2/1</span>
        <span ref="b">b/2/1</span>
    </div>

    <div scope-ref="my-scope-2">    
        <span ref="a">a/2/2</span>
        <span ref="b">b/2/2</span>
    </div>

</div>
`;

    var foo = 0;
    /**
     * @param {HTMLElement} element
     */
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    let result = selectRefsExtended(body, callback, { window: window, include_root: true });

    t.is(body, result.refs.root);
    

    if (result.refs.a && result.refs.b && result.scope_refs["my-scope-1"] && result.scope_refs["my-scope-2"] && result.scope_refs["my-scope-2"].id == "my-block") {
        t.pass();
    }
    else {
        t.fail();
    }

    window.close();

});

test("checkRefs", t => {

    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    const settings = { window: window };


    body.innerHTML = /* html*/`
<span ref="a">a</span>
<span ref="b">b</span>

<div scope-ref="my-scope-1">
    <span ref="a">a/1</span>
    <span ref="b">b/1</span>
    <span ref="c">c/1</span>
</div>
`;


    const annotation = {
        a: window.HTMLSpanElement.prototype,
        b: window.HTMLSpanElement.prototype,
        c: window.HTMLSpanElement.prototype
    };

    const body_scope_data = selectRefsExtended(body, undefined, settings);
    const body_refs = body_scope_data.refs;

    t.throws(() => {
        // @ts-ignore
        checkRefs(body_refs, annotation, { window: window });
    });

    t.notThrows(() => {
        checkRefs(body_refs, {
            // @ts-ignore
            a: window.HTMLSpanElement.prototype, b: window.HTMLSpanElement.prototype
        });
    });

    const child_scope_root = body_scope_data.scope_refs["my-scope-1"];
    const child_scope_data = selectRefsExtended(child_scope_root, undefined, settings);

    t.notThrows(() => {
        // @ts-ignore
        checkRefs(child_scope_data.refs, annotation, { window: window });
    });

    window.close();

});