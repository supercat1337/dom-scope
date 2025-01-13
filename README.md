<h1 align="center">
    dom-scope
</h1>

dom-scope is a tiny javascript library that allows you to work with HTML document scopes. 

## What are scopes inside the DOM for?

When you work with a large HTML document, you often need to get references to specific DOM elements. 

To do this, as a rule, developers use identifiers in the attributes of the necessary elements. However, there remains the possibility that the document may contain several elements with the same identifier. 

To solve this problem, this library was invented.


## scope and ref attributes

To create a scope, you need to create a special scope attribute on the parent element. 

You can assign local identifiers to child elements using the ref attribute.

### basic example

```html
<body>
    <span ref="a">a</span>
    <span ref="b">b</span>
    <div scope="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>
    <div scope="my-scope-2" id="my-block">    
        <span ref="a">a/2</span>
        <span ref="b">b/2</span>
        <span id="foo">foo</span>
        <div scope="my-scope">    
            <span ref="a">a/2/1</span>
            <span ref="b">b/2/1</span>
        </div>
        <div scope="my-scope-2">    
            <span ref="a">a/2/2</span>
            <span ref="b">b/2/2</span>
        </div>
    </div>
    <script src="index.js" type="module"></script>
</body>
```

#### scope.refs

```js
// @ts-check
import { DomScope } from "dom-scope";

/**
 * @param {DomScope} scope 
 */
function showRefsText(scope) {
    let { a, b } = scope.refs;
    console.log(a.innerText, b.innerText);
}

let scope = new DomScope(document.body);
showRefsText(scope);
// outputs: a b

let my_block = /** @type {HTMLElement} */ (document.querySelector("#my-block"));
let scope_2 = new DomScope(my_block);
showRefsText(scope_2);
// outputs: a/2 b/2
```


#### scope.querySelectorAll

```js
// @ts-check
import { DomScope } from "dom-scope";

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name=>attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

let scope = new DomScope(document.body);

let refs_array = scope.querySelectorAll("[ref],[scope]");

refs_array.forEach((element)=>{
    console.log(outputElementInfo(element));
});

/*
outputs:
SPAN ref=a
SPAN ref=b
DIV scope=my-scope-1
DIV scope=my-scope-2 id=my-block
*/
```

#### Working with scopes

```js
// @ts-check
import { DomScope } from "dom-scope";

let scope = new DomScope(document.body);
console.log(scope.root == document.body);
// outputs: true

console.log(scope.refs.a.innerText, scope.refs.b.innerText);
// outputs: a b
console.log(scope.scopes);
// outputs: {"my-scope-1": DomScope, "my-scope-2": DomScope}
console.log(scope.scopes["my-scope-2"].refs.a.innerText, scope.scopes["my-scope-2"].refs.b.innerText);
// outputs: a/2 b/2

console.log(scope.scopes["my-scope-2"].root.getAttribute("id"));
// outputs: my-block

const block_element = /** @type {HTMLElement} */ (document.getElementById("my-block"));
let another_scope = new DomScope(block_element);
console.log(another_scope.refs.a.innerText, another_scope.refs.b.innerText);
// outputs: a/2 b/2

const foo_element = /** @type {HTMLElement} */ (document.getElementById("foo"));
console.log(scope.root.contains(foo_element));
// outputs: true. document.body constains foo_element
console.log(scope.contains(foo_element));
// outputs: false. foo_element is out of #scope
console.log(another_scope.contains(foo_element));
// outputs: true. foo_element is inside of #another_scope
```

Also you can walk through all elements in the scope 
```js
// @ts-check
import { DomScope } from "dom-scope";

/**
 * @param {HTMLElement} element 
 */
function outputElementInfo(element) {
    let attrs = element.getAttributeNames().map(attr_name=>attr_name + "=" + element.getAttribute(attr_name)).join(" ");
    return `${element.tagName} ${attrs}`
}

let scope = new DomScope(document.body);
scope.walk((element)=>{
    console.log(outputElementInfo(element));
});
/*
outputs:
SPAN ref=a
SPAN ref=b
DIV scope=my-scope-1
DIV scope=my-scope-2 id=my-block
SCRIPT src=index.js type=module
*/

const block_element = /** @type {HTMLElement} */ (document.getElementById("my-block"));
let another_scope = new DomScope(block_element);
console.log("----------------");
another_scope.walk((element)=>{
    console.log(outputElementInfo(element));
});
/*
outputs:
SPAN ref=a
SPAN ref=b
SPAN id=foo
DIV scope=my-scope
DIV scope=my-scope-2
*/
```

#### Custom scopes

```html
<body>
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

    <script src="index.js" type="module"></script>
</body>
```

```js
// @ts-check
import { DomScope } from "dom-scope";

let scope = new DomScope(document.body);

scope.options.is_scope_element = function (element) {
    if (element.tagName == "SLOT") {
        return element.getAttribute("name") || "";
    }

    if (element.hasAttribute("custom-scope-attribute")) {
        return element.getAttribute("custom-scope-attribute") || "";
    }

    return false;
}

if (!scope.scopes["custom_scope_name"]) {
    console.error("custom_scope_name not found");
}

let scopes = scope.scopes;

let scope_1 = scopes["custom_scope_name"];

if (!scope_1.scopes["default"]) {
    console.error("custom_scope_name.default not found");
}

if (!scope_1.scopes["slot2"]) {
    console.error("custom_scope_name.slot2 not found");
}
```