// @ts-check

import { DomScope } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";
import { Window } from 'happy-dom';

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name => attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

test("DomScope (root == null)", t => {
    // @ts-ignore
    t.throws(() => new DomScope(null));
});

test("DomScope (root, contains, refs)", t => {

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

    let scope = new DomScope(body, {window: window});
    
    let refs = scope.refs;
    //refs.a

    if (!(scope.root == body)) t.fail();
    // outputs: true

    let output_1 = scope.refs.a.innerText + " " + scope.refs.b.innerText;

    t.is(output_1, "a b");

    let output_2 = Object.entries(scope.scopes).map(item => item[0]).join(",");
    if (output_2 != "my-scope-1,my-scope-2") t.fail(output_1);

    // @ts-ignore
    let output_3 = (scope.scopes["my-scope-2"].root.getAttribute("id"));
    t.is(output_3, "my-block");


    let output_4 = [scope.scopes["my-scope-2"].refs.a.innerText, scope.scopes["my-scope-2"].refs.b.innerText].join(" ")
    t.is(output_4, "a/2 b/2");

    const block_element = /** @type {HTMLElement} */ ( /** @type {unknown} */ (document.getElementById("my-block")));
    
    let another_scope = new DomScope(block_element, {window: window});
    another_scope.config.window = window;

    let another_scope_refs = another_scope.refs;

    another_scope_refs.a.innerHTML = "a/2";
    another_scope_refs.b.innerHTML = "b/2";
    
    let output_5 = [another_scope.refs.a.innerText, another_scope.refs.b.innerText].join(" ")
    t.is(output_5, "a/2 b/2");

    const foo_element = /** @type {HTMLElement} */ ( /** @type {unknown} */ (document.getElementById("foo")));
    t.true(scope.root.contains(foo_element));
    t.false(scope.contains(foo_element));
    t.true(another_scope.contains(foo_element));
    window.close();
});

test("DomScope (scopes)", t => {
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

    let scope = new DomScope(body, {window: window});
    let scopes = scope.scopes;
    let output_1 = Object.entries(scopes).map(item => item[0]).join(",");

    t.is(output_1, "my-scope-1,my-scope-2");

    window.close();
});

test("DomScope (querySelector)", t => {
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

    let scope = new DomScope(body, {window: window});

    t.false(!!scope.querySelector("foo"));
    t.true(!!scope.querySelector("#my-block"));

    window.close();
});

test("DomScope (querySelectorAll)", t => {
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

    let scope = new DomScope(body, {window: window});

    t.is(scope.querySelectorAll("foo").length, 0);
    t.is(scope.querySelectorAll("#my-block").length, 1);

    window.close();
});

test("DomScope (walk)", t => {
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
     * @description Callback function, that will be called for each element in the scope.
     *              It will be called with one argument - the Element, that is currently being processed.
     *              You can use this function to execute some code for each element in the scope.
     */
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    let scope = new DomScope(body, {window: window});
    scope.walk(callback);

    if (foo == 4) {
        t.pass();
    }
    else {
        t.fail();
    }

    window.close();
});

test("DomScope (destroy)", t => {
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

    let scope = new DomScope(body, {window: window});

    let output_1 = (scope.querySelectorAll("#my-block").length).toString();
    if (output_1 != "1") t.fail(output_1);

    t.false(scope.isDestroyed);
    scope.destroy();
    t.true(scope.isDestroyed);

    t.throws(() => {
        scope.querySelector("#my-block");
    });

    t.throws(() => {
        scope.querySelectorAll("*");
    });

    t.throws(() => {
        scope.walk(() => {});
    });

    t.throws(() => {
        scope.checkRefs({});
    });

    t.throws(() => {
        scope.update();
    });

    t.throws(() => {
        scope.contains(body);
    });

    window.close();
});

test("DomScope (dublicate ref and scopes)", t => {
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

    /** @type {DomScope<{a: HTMLSpanElement}>} */
    let scope = new DomScope(body, {window: window});

    body.insertAdjacentHTML("beforeend", /* html */`
        <span ref="a" dublicated></span>
        <div scope-ref="my-scope-1" dublicated>
        </div>
    `);

    let refs = scope.refs;
    let scopes = scope.scopes;
    
    if (refs.a.hasAttribute("dublicate")) {
        t.fail();
        return;
    }

    // @ts-ignore
    if (scopes["my-scope-1"].root.hasAttribute("dublicate")) {
        t.fail();
        return;
    }

    t.pass();
    window.close();
});

test("DomScope (custom scopes)", t => {

    const window = new Window({ url: 'https://localhost:8081' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span ref="a">a</span>
    <span ref="b">b</span>

    <div custom-scope-attribute="custom_scope_name">
        <span ref="a">a in custom_scope_name</span>
        <slot>
            <span ref="a">slot</span>
        </slot>
        <slot name="slot2">
            <span ref="a">a slot2</span>
        </slot>
    </div>
    `;

    let scope = new DomScope(body, {window: window});

    scope.config.is_scope_element = function (element) {
        if (element.tagName == "SLOT") {
            return element.getAttribute("name");
        }

        if (element.hasAttribute("custom-scope-attribute")) {
            return element.getAttribute("custom-scope-attribute");
        }

        return false;
    }

    if (!scope.scopes["custom_scope_name"]) {
        t.fail("custom_scope_name not found");
    }

    let scopes = scope.scopes;

    let scope_1 = scopes["custom_scope_name"];

    if (!scope_1.scopes["slot2"]) {
        t.fail("custom_scope_name.slot2 not found");
    }
    
    t.pass();
    window.close();
});

test("DomScope (isScopeElement)", t => {

    const window = new Window({ url: 'https://localhost:8081' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span ref="a">a</span>
    <span ref="b">b</span>
    
    <div scope-ref="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>
    `;

    let scope = new DomScope(body, {window: window});

    let is_scope_1 = scope.isScopeElement(body);
    let scope_element = /** @type {HTMLElement} */ (body.querySelector(`[scope-ref="my-scope-1"]`));
    let is_scope_2 = scope.isScopeElement(scope_element);

    t.is(is_scope_1, false);
    t.is(is_scope_2, true);

    window.close();
});


test("DomScope (unnamed scopes)", t => {

    const window = new Window({ url: 'https://localhost:8081' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span ref="a">a</span>
    <span ref="b">b</span>
    
    <div scope-ref="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>

    <div scope-ref="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>

    <div scope-ref>
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>

    <div scope-ref>
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>

    `;

    let scope = new DomScope(body, {window: window});

    let scope_names = Object.keys(scope.scopes);
    
    t.is(scope_names.length, 4);

    t.deepEqual(scope_names.sort(), ["my-scope-1", "$0", "$1", "$2"].sort());

    window.close();
});

test("DomScope (checkRefs)", t => {

    const window = new Window({ url: 'https://localhost:8081' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span ref="a">a</span>
    <span ref="b">b</span>
    `;

    let scope = new DomScope(body, {window: window});

    t.notThrows(() => {
        scope.checkRefs({
            // @ts-ignore
            a:window.HTMLSpanElement.prototype,
            // @ts-ignore
            b: window.HTMLSpanElement.prototype,
        });           
    });

    t.throws(() => {
        scope.checkRefs({
            // @ts-ignore
            a: window.HTMLDivElement.prototype,
            // @ts-ignore
            b: window.HTMLSpanElement.prototype,
        });           
    });

    t.throws(() => {
        scope.checkRefs({
            // @ts-ignore
            a: window.HTMLSpanElement.prototype,
            // @ts-ignore
            b: window.HTMLSpanElement.prototype,
            // @ts-ignore
            c: window.HTMLSpanElement.prototype
        });        
    });
    window.close();
});
