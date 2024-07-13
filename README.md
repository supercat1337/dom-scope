<h1 align="center">
    dom-scope
</h1>

dom-scope is a tiny javascript library that allows you to work with HTML document scopes. 

## What are scopes inside the DOM for?

When you work with a large HTML document, you often need to get references to specific DOM elements. 

To do this, as a rule, developers use identifiers in the attributes of the necessary elements. However, there remains the possibility that the document may contain several elements with the same identifier. 

To solve this problem, this library was invented.


## scope-name and ref attributes

To create a scope, you need to create a special scope-name attribute on the parent element. 

You can assign local identifiers to child elements using the ref attribute.

### basic example

html```
<body>
    <span ref="a">a</span>
    <span ref="b">b</span>
    <div scope-name="my-scope-1">
        <span ref="a">a/1</span>
        <span ref="b">b/1</span>
    </div>
    <div scope-name="my-scope-2" id="my-block">    
        <span ref="a">a/2</span>
        <span ref="b">b/2</span>
        <span id="foo">foo</span>
        <div scope-name="my-scope">    
            <span ref="a">a/2/1</span>
            <span ref="b">b/2/1</span>
        </div>
        <div scope-name="my-scope-2">    
            <span ref="a">a/2/2</span>
            <span ref="b">b/2/2</span>
        </div>
    </div>
    <script src="index.js" type="module"></script>
</body>
```

js```
// @ts-check
import { DomScope } from "@supercat1337/dom-scope";

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
js```
// @ts-check
import { DomScope } from "@supercat1337/dom-scope";

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
DIV scope-name=my-scope-1
DIV scope-name=my-scope-2 id=my-block
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
DIV scope-name=my-scope
DIV scope-name=my-scope-2
*/
```