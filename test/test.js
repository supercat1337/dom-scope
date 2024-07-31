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
<span data-ref="a">a</span>
<span data-ref="b">b</span>

<div data-scope="my-scope-1">
    <span data-ref="a">a/1</span>
    <span data-ref="b">b/1</span>
</div>

<div data-scope="my-scope-2" id="my-block">    
    <span data-ref="a">a/2</span>
    <span data-ref="b">b/2</span>
    <span id="foo">foo</span>

    <div data-scope="my-scope">    
        <span data-ref="a">a/2/1</span>
        <span data-ref="b">b/2/1</span>
    </div>

    <div data-scope="my-scope-2">    
        <span data-ref="a">a/2/2</span>
        <span data-ref="b">b/2/2</span>
    </div>

</div>
`;


test("selectRefs", t => {

    let refs = selectRefs(body, { document: document });

    let entries = Object.entries(refs);

    if (entries.length == 2 && entries[0][1].getAttribute("data-ref") == "a" && entries[1][1].getAttribute("data-ref") == "b") {
        t.pass();
    }
    else {
        t.fail();
    }

});

test("walkDomScope", t => {

    var foo = 0;
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    walkDomScope(body, callback, { document: document });

    if (foo == 4) {
        t.pass();
    }
    else {
        t.fail();
    }

});

test("selectRefsExtended", t => {

    var foo = 0;
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    let result = selectRefsExtended(body, callback, { document: document });

    if (result.refs.a && result.refs.b && result.scope_refs["my-scope-1"] && result.scope_refs["my-scope-2"] && result.scope_refs["my-scope-2"].id == "my-block") {
        t.pass();
    }
    else {
        t.fail();
    }

});

test("DomScope (root, contains, refs)", t => {

    let scope = new DomScope(body);
    scope.options.document = document;

    if (!(scope.root == body)) t.fail();
    // outputs: true

    let output_1 = scope.refs.a.innerText + " " + scope.refs.b.innerText;

    if (output_1 != "a b") t.fail(output_1);
    // outputs: a b
    let output_2 = Object.entries(scope.scopes).map(item => item[0]).join(",");
    if (output_2 != "my-scope-1,my-scope-2") t.fail(output_1);

    // @ts-ignore
    let output_3 = (scope.scopes["my-scope-2"].root.getAttribute("id"));
    if (output_3 != "my-block") t.fail(output_3 + "");
    // outputs: my-block

    let output_4 = [scope.scopes["my-scope-2"].refs.a.innerText, scope.scopes["my-scope-2"].refs.b.innerText].join(" ")
    if (output_4 != "a/2 b/2") t.fail(output_4 + "");
    // outputs: a/2 b/2

    const block_element = /** @type {HTMLElement} */ ( /** @type {unknown} */ (document.getElementById("my-block")));
    let another_scope = new DomScope(block_element);
    another_scope.options.document = document;

    let output_5 = [another_scope.refs.a.innerText, another_scope.refs.b.innerText].join(" ")
    if (output_5 != "a/2 b/2") t.fail(output_5 + "");
    // outputs: a/2 b/2

    const foo_element = /** @type {HTMLElement} */ ( /** @type {unknown} */ (document.getElementById("foo")));
    let output_6 = (scope.root.contains(foo_element)).toString();
    if (output_6 != "true") t.fail(output_6);
    // outputs: true. document.body constains foo_element

    let output_7 = (scope.contains(foo_element)).toString();
    if (output_7 != "false") t.fail(output_7);
    // outputs: false. foo_element is out of #scope

    let output_8 = (another_scope.contains(foo_element)).toString();
    if (output_8 != "true") t.fail(output_8);
    // outputs: true. foo_element is inside of #another_scope

    t.pass();
});

test("DomScope (scopes)", t => {

    let scope = new DomScope(body);
    scope.options.document = document;
    let scopes = scope.scopes;
    let output_1 = Object.entries(scopes).map(item => item[0]).join(",");
    if (output_1 != "my-scope-1,my-scope-2") t.fail(output_1);

    t.pass();
});

test("DomScope (querySelector)", t => {

    let scope = new DomScope(body);
    scope.options.document = document;

    let output_1 = (!!scope.querySelector("#foo")).toString();
    if (output_1 != "false") t.fail(output_1);

    let output_2 = (!!scope.querySelector("#my-block")).toString();
    if (output_2 != "true") t.fail(output_2);

    t.pass();
});

test("DomScope (querySelectorAll)", t => {

    let scope = new DomScope(body);
    scope.options.document = document;

    let output_1 = (scope.querySelectorAll("#foo").length).toString();
    if (output_1 != "0") t.fail(output_1);

    let output_2 = (scope.querySelectorAll("#my-block").length).toString();
    if (output_2 != "1") t.fail(output_2);

    t.pass();
});

test("DomScope (walk)", t => {

    var foo = 0;
    function callback(element) {
        foo++;
        t.log(outputElementInfo(element));
    }

    let scope = new DomScope(body);
    scope.options.document = document;
    scope.walk(callback);

    if (foo == 4) {
        t.pass();
    }
    else {
        t.fail();
    }

});

test("DomScope (destroy)", t => {

    let scope = new DomScope(body);
    scope.options.document = document;

    let output_1 = (scope.querySelectorAll("#my-block").length).toString();
    if (output_1 != "1") t.fail(output_1);

    scope.destroy();
    try {
        let output_2 = (scope.querySelectorAll("#my-block").length).toString();
        t.fail();
    } catch (e) {
        t.pass();
    }
});

test("DomScope (dublicate data-ref and scopes)", t => {

    let scope = new DomScope(body);
    scope.options.document = document;

    body.insertAdjacentHTML("beforeend", /* html */`
        <span data-ref="a" dublicated></span>
        <div data-scope="my-scope-1" dublicated>
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
    <span data-ref="a">a</span>
    <span data-ref="b">b</span>

    <div custom-scope-attribute="custom_scope_name">
        <span data-ref="a">a in custom_scope_name</span>
        <slot>
            <span data-ref="a">slot</span>
        </slot>
        <slot name="slot2">
            <span data-ref="a">a slot2</span>
        </slot>
    </div>
    `;

    let scope = new DomScope(body);
    scope.options.document = document;

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
    <span data-ref="a">a</span>
    <span data-ref="b">b</span>
    
    <div data-scope="my-scope-1">
        <span data-ref="a">a/1</span>
        <span data-ref="b">b/1</span>
    </div>
    `;

    let scope = new DomScope(body);
    scope.options.document = document;

    let is_scope_1 = scope.isScopeElement(body);
    let scope_element = /** @type {HTMLElement} */ (body.querySelector(`[data-scope="my-scope-1"]`));
    let is_scope_2 = scope.isScopeElement(scope_element);


    if (is_scope_1 !== false) {
        t.fail("document.body is not a scope");
    }

    if (is_scope_2!==true) {
        t.fail(`[data-scope="my-scope-1"] is scope`);
    }
    
    t.pass();
});


test("DomScope (unnamed scopes)", t => {

    const window = new Window({ url: 'https://localhost:8081' });
    const document = window.document;
    const body = /** @type {HTMLElement} */ (/** @type {unknown} */ (document.body));

    body.innerHTML = /* html*/`
    <span data-ref="a">a</span>
    <span data-ref="b">b</span>
    
    <div data-scope="my-scope-1">
        <span data-ref="a">a/1</span>
        <span data-ref="b">b/1</span>
    </div>

    <div data-scope="my-scope-1">
        <span data-ref="a">a/1</span>
        <span data-ref="b">b/1</span>
    </div>

    <div data-scope>
        <span data-ref="a">a/1</span>
        <span data-ref="b">b/1</span>
    </div>

    <div data-scope>
        <span data-ref="a">a/1</span>
        <span data-ref="b">b/1</span>
    </div>

    `;

    let scope = new DomScope(body);
    scope.options.document = document;

    let scope_names = Object.keys(scope.scopes);
    
    if (scope_names.length != 4) {
        t.fail(`scope_names.length = ${scope_names.length}`);
    }

    if (JSON.stringify(scope_names.sort())!=JSON.stringify(["my-scope-1", "$0", "$1", "$2"].sort())) {
        t.fail([JSON.stringify(scope_names.sort())," !=" , JSON.stringify(["my-scope-1", "$0", "$1", "$2"].sort())].join(" "));
    }

    t.pass();
});