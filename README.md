<h1 align="center">
    dom-scope
</h1>

dom-scope is a tiny javascript library that allows you to create scopes inside the DOM and get references to local html-elements.

## What are scopes inside the DOM for?

When working with a large HTML document, it's often necessary to get references to specific DOM elements.

This can be done by using identifiers in the attributes of the necessary elements. However, there is a risk that the document may contain multiple elements with the same identifier. To avoid confusion, this library was created to help developers create scopes inside the DOM. A scope is an isolated area of the DOM that contains unique identifiers for its elements. Scopes can be nested, allowing you to create a hierarchical structure of unique identifiers. This makes it easier to access specific elements in the DOM.

This library provides a simple way to create scopes inside the DOM and get references to the elements in the scope.

### Example

```js
import { createFromHTML, selectRefs } from "dom-scope";

const root = createFromHTML(/*html*/ `
    <span ref="a">1</span>
    <span ref="b">1</span>

    <div scope-ref="another_scope">
        <span ref="a">2</span>
        <span ref="b">2</span>
        <span ref="c">2</span>
    </div>

    <span ref="c">1</span>
`);

const wrong_annotation = {
    a: HTMLElement,
    b: HTMLDivElement,
    c: HTMLSpanElement,
};

try {
    // select refs and check if they are correct
    let refs = selectRefs(root, wrong_annotation);
} catch (e) {
    console.log(e.message);
    // occures: The ref "b" must be an instance of HTMLDivElement (actual: HTMLSpanElement)
}

const annotation = {
    a: HTMLSpanElement,
    b: HTMLSpanElement,
    c: HTMLSpanElement,
};

let refs = selectRefs(root, annotation);
const { a, b, c } = refs;

console.log(a.textContent, b.textContent, c.textContent);
// outputs: 1 1 1

document.body.appendChild(root);
```

This JavaScript code creates a DOM element from an HTML string using the createFromHTML function, and then attempts to select references to elements within that DOM using the selectRefs function. The selectRefs function takes an optional annotation object that specifies the expected types of the referenced elements. If the actual types do not match the expected types, an error is thrown. The code demonstrates both a failed attempt with incorrect annotations and a successful attempt with correct annotations.

An element with the `scope-ref` attribute defines a new scope within the DOM. A scope acts as an isolated section of the DOM that maintains unique identifiers for its elements.

Consequently, the reference `c` targets an element with the text "1", excluding those with "2".

### Advantages

-   type checking for the refs in static analysis and runtime
-   autocompletion for the refs
-   simple and easy to use
-   avoids naming conflicts
-   allows nested scopes
-   avoids the need for complex CSS selectors

## Advanced Usage

Alternatively, you can use the `DomScope` class to create scopes inside the DOM and get references to the elements in the scope.

### Example with DomScope

```html
<body>
    <span ref="a">a</span>
    <span ref="b">b</span>

    <div scope-ref="my-scope-1">
        <div ref="a">a</div>
        <div ref="b">b</div>
        <div ref="c">c</div>
    </div>
</body>
```

```js
import { DomScope } from "dom-scope";

const domScope = new DomScope(document.body);
const refs = domScope.refs;
console.log(refs.a instanceof HTMLSpanElement); // true
console.log(refs.b instanceof HTMLSpanElement); // true

let scope = domScope.scopes["my-scope-1"];
const { a, b, c } = scope.refs;
console.log(a instanceof HTMLDivElement); // true
console.log(b instanceof HTMLDivElement); // true
console.log(c instanceof HTMLDivElement); // true
```

dom-scope supports full type safety, providing autocompletion and type checking for your refs in TypeScript. Additionally, you can validate the refs at runtime using the "checkRefs" method.

```js
import { DomScope } from "dom-scope";

/** @type {DomScope<{a: HTMLSpanElement, b: HTMLSpanElement}>} */
const domScope = new DomScope(document.body);
// now refs are typed

const refs = domScope.refs;

// throws error if the required refs are not correct
domScope.checkRefs({
    a: HTMLSpanElement,
    b: HTMLSpanElement,
});

// another way to get typed scope is to use annotation object and then call checkRefs on it
const annotation = {
    a: HTMLDivElement,
    b: HTMLDivElement,
    c: HTMLDivElement,
};

let scope = /** @type {DomScope<typeof annotation>} */ (
    domScope.scopes["my-scope-1"]
);
// now refs are typed
const { a, b, c } = scope.refs;

// throws error if the required refs are not correct
scope.checkRefs(annotation);
```

## How does it work?

dom-scope works by traversing the DOM tree and creating a dictionary of all elements that have a `ref` or `scope-ref` attribute. The dictionary is then used to create a scope object that can be used to access the elements in the scope.

The scope object has a `refs` property that contains all the elements in the scope. The `refs` property is an object with the same keys as the `ref` attribute values. The values of the `refs` property are the elements themselves.

The scope object also has a `scopes` property that contains all the scopes that are nested inside the current scope. The `scopes` property is an object with the same keys as the `scope-ref` attribute values. The values of the `scopes` property are scope objects that can be used to access the elements in the nested scopes.

The scope object also has a `querySelectorAll` method that can be used to select elements in the scope. The `querySelectorAll` method takes a CSS selector as an argument and returns an array of elements that match the selector.

The scope object also has a `walk` method that can be used to traverse the DOM tree and execute a callback function for each element in the scope. The `walk` method takes a callback function as an argument and executes it for each element in the scope.

## Custom scopes

dom-scope also supports custom scopes. Custom scopes are scopes that are created using a custom attribute instead of the `scope-ref` attribute. Custom scopes can be used to create scopes that are not based on the `scope-ref` attribute.

To create a custom scope, you need to pass a function that determines whether an element is a scope element or not. The function should take an element as an argument and return a boolean value indicating whether the element is a scope element or not.

The function can also be used to determine the name of the scope. The name of the scope is used as the key in the `scopes` object.

For example, to create a custom scope that is based on a `custom-scope-attribute` attribute, you can pass a function like this:

```html
<body>
    <span ref="a">a</span>
    <span ref="b">b</span>

    <div custom-scope-attribute="custom_scope_name">
        <span ref="c">c</span>
    </div>
</body>
```

```js
import { DomScope } from "dom-scope";

const domScope = new DomScope(document.body);

domScope.config.is_scope_element = function (element) {
    if (element.hasAttribute("custom-scope-attribute")) {
        // determine if the element defines a named scope by checking the custom-scope-attribute value
        return element.getAttribute("custom-scope-attribute") || "";
    }

    return false;
};

const { a, b } = domScope.refs;

let scope = domScope.scopes["custom_scope_name"];
const { c } = scope.refs;
```

## Data attributes

Dom-scope also supports using data attributes instead of custom attributes. To enable this feature, you can call the `useDataAttributes` function. This way you can use dom-scope in a context where custom attributes are not allowed.

## Installation

```bash
npm install dom-scope
```

## License

MIT
