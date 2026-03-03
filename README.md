# DomScope

**DomScope** is a lightweight, zero-dependency JavaScript library for working with isolated DOM sections. It allows you to create named scopes, safely reference elements without global selector collisions, and provides industry-standard TypeScript typing.

## Key Features

* ✅ **Isolated DOM Scopes** — Elements in different scopes can share identical `data-ref` names without conflict.
* ✅ **Multi-Root Support** — Manage "teleported" elements or disconnected DOM nodes as a single logical unit via API.
* ✅ **Full TypeScript Support** — Generic-based autocompletion and strict type checking.
* ✅ **Runtime Validation** — Built-in `checkRefs` to ensure your DOM matches your code expectations.
* ✅ **SSR & Shadow DOM** — Works seamlessly with Server-Side Rendering (JSDOM) and Web Components.
* ✅ **Performance** — Uses `TreeWalker` for high-speed traversal with `FILTER_REJECT` for boundary isolation.

---

## Installation

```bash
npm install dom-scope

```

---

## Quick Start

### Basic Example

```html
<div id="app" data-scope="main">
    <button data-ref="submitBtn">Submit</button>

    <div data-scope="userForm" data-ref="formContainer">
        <input data-ref="name" type="text" />
        <button data-ref="submitBtn">Inner Submit</button> 
    </div>
</div>

```

```javascript
import { DomScope } from 'dom-scope';

const scope = new DomScope(document.querySelector('#app'));

// 1. References are scoped (isolated)
console.log(scope.refs.submitBtn); // The outer button

// 2. Access nested scopes
const form = scope.scopes.userForm;
console.log(form.refs.submitBtn); // The inner button (no collision!)

// 3. Runtime validation
scope.checkRefs({
    submitBtn: HTMLButtonElement,
    formContainer: HTMLDivElement
});

```

---

## Advanced: Multi-Root (Teleports)

If your component has elements in different parts of the DOM (e.g., a Modal body at the end of `<body>`), use the functional API:

```javascript
import { selectRefs } from 'dom-scope';

const header = document.querySelector('#header');
const portal = document.querySelector('#modal-portal');

// Merges multiple roots into one logical set of refs
const refs = selectRefs([header, portal], {
    title: HTMLElement,
    closeBtn: HTMLButtonElement
});

```

---

## TypeScript & JSDoc

### Using Generics

```typescript
import { DomScope } from 'dom-scope';

interface MyRefs {
    saveBtn: HTMLButtonElement;
    title: HTMLHeadingElement;
}

const scope = new DomScope<MyRefs>(element);
scope.refs.saveBtn.disabled = true; // Fully typed!

```

### Using JSDoc

```javascript
/** @type {DomScope<{title: HTMLHeadingElement}>} */
const scope = new DomScope(element);
scope.refs.title.textContent = "Hello";

```

---

## API Reference

### `DomScope<T>` Class

* `root` — The root element/fragment.
* `refs` — Object containing elements marked with `data-ref`.
* `scopes` — Object containing child `DomScope` instances.
* `update(callback?)` — Rescans the DOM for changes.
* `checkRefs(annotation)` — Validates that refs exist and match the provided constructors.
* `querySelectorAll(query)` — Scans elements strictly within the current scope boundaries.
* `contains(element)` — Returns `true` if the element belongs to this scope (and not a sub-scope).
* `destroy()` — Cleans up references.

### Helper Functions

* `selectRefs(roots, annotation?, options?)` — Functional way to collect refs. Supports single or multiple roots.
* `walkDomScope(roots, callback, options?)` — Traverses the DOM until it hits a sub-scope boundary.

---

## Configuration

```typescript
type ScopeOptions = {
    refAttribute?: string;         // default: 'data-ref'
    scopeAttribute?: string | string[]; // default: 'data-scope'
    window?: any;                  // For SSR environments
    isScopeElement?: (el, conf) => string | null; // Custom scope detection
    scopeAutoNamePrefix?: string;  // default: 'unnamed-scope'
};

```

## Performance Note

DomScope uses an optimized `TreeWalker` with `NodeFilter.FILTER_REJECT`. When it encounters an element that defines a new scope, it skips that entire branch during the current scope's scan. This makes it extremely efficient even for very deep and complex DOM trees.

## License

MIT © Albert Bazaleev