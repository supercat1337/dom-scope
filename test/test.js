// @ts-check

import { DomScope, selectRefs, selectRefsExtended, walkDomScope } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";
import { Window } from 'happy-dom';

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name => attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

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


test("selectRefs", t => {

    let refs = selectRefs(body, { window: window });

    let entries = Object.entries(refs);

    if (entries.length == 2 && entries[0][1].getAttribute("ref") == "a" && entries[1][1].getAttribute("ref") == "b") {
        t.pass();
    }
    else {
        t.fail();
    }

});


test("selectRefs (no window)", t => {

    t.throws(() => {
        let refs = selectRefs(body);       
    });
});

test("walkDomScope", t => {

    var foo = 0;
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    walkDomScope(body, callback, { window: window });

    t.is(foo, 4);

});

test("selectRefsExtended", t => {

    var foo = 0;
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    let result = selectRefsExtended(body, callback, { window: window });

    if (result.refs.a && result.refs.b && result.scope_refs["my-scope-1"] && result.scope_refs["my-scope-2"] && result.scope_refs["my-scope-2"].id == "my-block") {
        t.pass();
    }
    else {
        t.fail();
    }

});

test("DomScope (root, contains, refs)", t => {

    let scope = new DomScope(body, {window: window});
    
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
    another_scope.options.window = window;

    let output_5 = [another_scope.refs.a.innerText, another_scope.refs.b.innerText].join(" ")
    t.is(output_5, "a/2 b/2");

    const foo_element = /** @type {HTMLElement} */ ( /** @type {unknown} */ (document.getElementById("foo")));
    t.true(scope.root.contains(foo_element));
    t.false(scope.contains(foo_element));
    t.true(another_scope.contains(foo_element));
});

test("DomScope (scopes)", t => {

    let scope = new DomScope(body, {window: window});
    let scopes = scope.scopes;
    let output_1 = Object.entries(scopes).map(item => item[0]).join(",");
    if (output_1 != "my-scope-1,my-scope-2") t.fail(output_1);

    t.pass();
});

test("DomScope (querySelector)", t => {

    let scope = new DomScope(body, {window: window});

    let output_1 = (!!scope.querySelector("#foo")).toString();
    if (output_1 != "false") t.fail(output_1);

    let output_2 = (!!scope.querySelector("#my-block")).toString();
    if (output_2 != "true") t.fail(output_2);

    t.pass();
});

test("DomScope (querySelectorAll)", t => {

    let scope = new DomScope(body, {window: window});

    let output_1 = (scope.querySelectorAll("#foo").length).toString();
    if (output_1 != "0") t.fail(output_1);

    let output_2 = (scope.querySelectorAll("#my-block").length).toString();
    if (output_2 != "1") t.fail(output_2);

    t.pass();
});

test("DomScope (walk)", t => {

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

});

test("DomScope (destroy)", t => {

    let scope = new DomScope(body, {window: window});

    let output_1 = (scope.querySelectorAll("#my-block").length).toString();
    if (output_1 != "1") t.fail(output_1);

    t.false(scope.isDestroyed);
    scope.destroy();
    t.true(scope.isDestroyed);

    try {
        let output_2 = (scope.querySelectorAll("#my-block").length).toString();
        t.fail();
    } catch (e) {
        t.pass();
    }
});

test("DomScope (dublicate ref and scopes)", t => {

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

    scope.options.is_scope_element = function (element) {
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


    if (is_scope_1 !== false) {
        t.fail("document.body is not a scope");
    }

    if (is_scope_2!==true) {
        t.fail(`[scope-ref="my-scope-1"] is scope`);
    }
    
    t.pass();
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
    
    if (scope_names.length != 4) {
        t.fail(`scope_names.length = ${scope_names.length}`);
    }

    if (JSON.stringify(scope_names.sort())!=JSON.stringify(["my-scope-1", "$0", "$1", "$2"].sort())) {
        t.fail([JSON.stringify(scope_names.sort())," !=" , JSON.stringify(["my-scope-1", "$0", "$1", "$2"].sort())].join(" "));
    }

    t.pass();
});

test("DomScope (check)", t => {

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
            a:window.HTMLSpanElement,
            // @ts-ignore
            b: window.HTMLSpanElement,
        });           
    });

    /*
    t.throws(() => {
        scope.check({
            // @ts-ignore
            a: window.HTMLDivElement,
            // @ts-ignore
            b: window.HTMLSpanElement,
        });           
    });
    */

    t.throws(() => {
        scope.checkRefs({
            // @ts-ignore
            a: window.HTMLSpanElement,
            // @ts-ignore
            b: window.HTMLSpanElement,
            // @ts-ignore
            c: window.HTMLSpanElement
        });        
    });
    
});
