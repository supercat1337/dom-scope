# DomScope

[![npm version](https://img.shields.io/npm/v/dom-scope.svg)](https://www.npmjs.com/package/dom-scope)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**DomScope** is a lightweight JavaScript library for working with isolated DOM scopes. It enables you to create named scopes within the DOM tree, safely reference elements, and provides full TypeScript typing. The library works both in the browser and in SSR (Server-Side Rendering) environments.

## Key Features

- ✅ **Isolated DOM Scopes** - Elements in different scopes can have identical names
- ✅ **Full TypeScript Support** - Autocompletion and type checking
- ✅ **Runtime Type Validation** - Element validation using constructors
- ✅ **Nested Scopes** - Support for hierarchical scope structures
- ✅ **Flexible Configuration** - Custom attributes and scope detection rules
- ✅ **SSR Compatible** - Works on both server and client
- ✅ **Zero Dependencies** - Minimal library footprint

## Installation

```bash
npm install dom-scope
# or
yarn add dom-scope
# or
pnpm add dom-scope
```

## Quick Start

### Basic Example

```html
<div id="app">
    <button data-ref="submit">Submit</button>
    
    <div data-scope="userForm">
        <input data-ref="name" type="text">
        <input data-ref="email" type="email">
    </div>
</div>
```

```javascript
import { DomScope } from 'dom-scope';

// Create a scope on the element
const appScope = new DomScope(document.querySelector('#app'));

// Get references to elements
const { submit } = appScope.refs;
console.log(submit instanceof HTMLButtonElement); // true

// Get nested scope
const userFormScope = appScope.scopes.userForm;
const { name, email } = userFormScope.refs;
console.log(name instanceof HTMLInputElement); // true

// Runtime type checking
appScope.checkRefs({
    submit: HTMLButtonElement
});

userFormScope.checkRefs({
    name: HTMLInputElement,
    email: HTMLInputElement
});
```

### Creating DOM from HTML String

```javascript
import { createFromHTML, selectRefs } from 'dom-scope';

const fragment = createFromHTML(/*html*/ `
    <div data-scope="modal">
        <h2 data-ref="title">Modal Title</h2>
        <p data-ref="content">Modal content...</p>
        <button data-ref="close">Close</button>
    </div>
`);

// Get references with type checking
const annotation = {
    title: HTMLHeadingElement,
    content: HTMLParagraphElement,
    close: HTMLButtonElement
};

const refs = selectRefs(fragment, annotation);
const { title, content, close } = refs;

document.body.appendChild(fragment);
```

## TypeScript Support

DomScope provides full typing for autocompletion and type checking:

```typescript
import { DomScope } from 'dom-scope';

// Explicit typing via generic
const scope = new DomScope<{
    button: HTMLButtonElement;
    input: HTMLInputElement;
    container: HTMLDivElement;
}>(document.querySelector('#app'));

// refs are now fully typed
scope.refs.button.disabled = true;
scope.refs.input.value = 'Hello';
scope.refs.container.classList.add('active');

// Autocompletion works in IDE
scope.refs. // ← IDE will suggest button, input, container

// Runtime type validation
scope.checkRefs({
    button: HTMLButtonElement,
    input: HTMLInputElement,
    container: HTMLDivElement
});
```

### JSDoc Annotations (if not using TypeScript directly)

```javascript
import { DomScope } from 'dom-scope';

/** @type {DomScope<{submit: HTMLButtonElement, cancel: HTMLButtonElement}>} */
const scope = new DomScope(document.querySelector('#app'));

// Now refs are typed with autocompletion
scope.refs.submit.disabled = false;
```

## API Reference

### Core Classes and Functions

#### `DomScope<T extends RefsAnnotation>`

The main class for working with DOM scopes.

**Constructor:**
```typescript
constructor(root_element: RootType, options?: ScopeOptions)
```

**Properties:**
- `root: RootType` — The root element of the scope
- `refs: Refs<T>` — Object with references to elements with `data-ref` attribute
- `scopes: {[key: string]: DomScope<T>}` — Object with child scopes
- `config: ScopeConfig` — Scope configuration
- `isDestroyed: boolean` — Destruction flag

**Methods:**
- `update(callback?: SelectRefsCallback): void` — Updates references and scopes
- `querySelector(query: string): Element | null` — Finds element within scope
- `querySelectorAll(query: string): HTMLElement[]` — Finds all elements within scope
- `contains(element: Node, check_only_child_scopes?: boolean): boolean` — Checks if element belongs to scope
- `walk(callback: (element: HTMLElement) => void): void` — Traverses all elements in scope
- `checkRefs(annotation: RefsAnnotation): void` — Validates element types
- `isScopeElement(element: Element | HTMLElement): boolean` — Checks if element defines a scope
- `destroy(): void` — Destroys the instance

#### Helper Functions

- `selectRefs(root, annotation?, options?): Refs<T>` — Gets element references
- `selectRefsExtended(root, callback?, options?)` — Extended element reference retrieval
- `createFromHTML(html, options?): DocumentFragment` — Creates DOM from HTML string
- `checkRefs(refs, annotation): void` — Validates element types
- `walkDomScope(root, callback, options?)` — Traverses DOM scope
- `generateId(custom_prefix?): string` — Generates unique ID
- `setDefaultConfig(options): ScopeConfig` — Sets default configuration

### Configuration

```typescript
type ScopeOptions = {
    ref_attr_name?: string;           // Attribute for references (default: 'data-ref')
    scope_ref_attr_name?: string;     // Attribute for scopes (default: 'data-scope')
    window?: any;                     // Global window object (for SSR)
    isScopeElement?: TypeIsScopeElement | null; // Custom scope detection function
    includeRoot?: boolean;            // Include root element in traversal
    scope_auto_name_prefix?: string;  // Prefix for auto-named scopes
};
```

### Types

```typescript
type RefsAnnotation = {
    [key: string]: HTMLElement | HTMLElementConstructor;
};

type Refs<T extends RefsAnnotation> = {
    [P in keyof T]: T[P] extends HTMLElementConstructor 
        ? T[P]["prototype"] 
        : T[P] extends HTMLElement 
            ? T[P] 
            : HTMLElement;
};

type RootType = Element | HTMLElement | DocumentFragment | ShadowRoot;
```

## Advanced Usage

### Custom Scope Detection Rules

```javascript
import { DomScope } from 'dom-scope';

const scope = new DomScope(document.body, {
    // Custom scope detection function
    isScopeElement: (element, options) => {
        // Detect scope by class
        if (element.classList.contains('custom-scope')) {
            return element.dataset.scopeName || 'unnamed';
        }
        
        // Or by attribute
        if (element.hasAttribute('scope-id')) {
            return element.getAttribute('scope-id');
        }
        
        return null;
    },
    
    // Change default attributes
    ref_attr_name: 'ref',
    scope_ref_attr_name: 'scope'
});

// Scopes are now detected using custom rules
const customScope = scope.scopes.myScope;
```

### Working with Shadow DOM

```javascript
import { DomScope } from 'dom-scope';

// Create element with Shadow DOM
const element = document.createElement('div');
const shadow = element.attachShadow({ mode: 'open' });
shadow.innerHTML = `
    <button data-ref="shadowButton">Click me</button>
    <div data-scope="innerScope">
        <input data-ref="shadowInput">
    </div>
`;

// Work with Shadow DOM as regular scope
const shadowScope = new DomScope(shadow);
const { shadowButton } = shadowScope.refs;
const innerScope = shadowScope.scopes.innerScope;
```

### SSR (Server-Side Rendering)

```javascript
import { DomScope, createFromHTML } from 'dom-scope';

// On server (Node.js)
if (typeof window === 'undefined') {
    // Create mock window for SSR
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    
    const options = {
        window: window
    };
    
    const fragment = createFromHTML('<div data-ref="content">Hello SSR</div>', options);
    const refs = selectRefs(fragment, null, options);
    
    // Send HTML to client
    const html = fragment.firstElementChild.outerHTML;
}

// On client
const scope = new DomScope(document.querySelector('#app'));
// Work as usual
```

### Dynamic Updates

```javascript
import { DomScope } from 'dom-scope';

const scope = new DomScope(document.querySelector('#app'));

// Add elements dynamically
setTimeout(() => {
    const newElement = document.createElement('div');
    newElement.setAttribute('data-ref', 'dynamic');
    newElement.textContent = 'Dynamic content';
    scope.root.appendChild(newElement);
    
    // Update references
    scope.update();
    
    console.log(scope.refs.dynamic); // Now available
}, 1000);

// Listen for DOM changes
const observer = new MutationObserver(() => {
    scope.update();
});

observer.observe(scope.root, {
    childList: true,
    subtree: true
});
```

## Practical Examples

### Example: Form with Validation

```html
<form data-scope="loginForm">
    <div data-ref="error" class="error" hidden></div>
    
    <input data-ref="email" type="email" placeholder="Email">
    <input data-ref="password" type="password" placeholder="Password">
    
    <button data-ref="submit" type="submit">Login</button>
    <button data-ref="cancel" type="button">Cancel</button>
</form>
```

```javascript
import { DomScope } from 'dom-scope';

class LoginForm {
    constructor(element) {
        this.scope = new DomScope(element, {
            includeRoot: true
        });
        
        this.init();
    }
    
    init() {
        const { email, password, submit, cancel, error } = this.scope.refs;
        
        submit.addEventListener('click', (e) => this.onSubmit(e));
        cancel.addEventListener('click', () => this.onCancel());
        
        // Runtime type validation
        this.scope.checkRefs({
            email: HTMLInputElement,
            password: HTMLInputElement,
            submit: HTMLButtonElement,
            cancel: HTMLButtonElement,
            error: HTMLDivElement
        });
    }
    
    onSubmit(event) {
        event.preventDefault();
        const { email, password, error } = this.scope.refs;
        
        if (!email.value || !password.value) {
            error.textContent = 'Please fill all fields';
            error.hidden = false;
            return;
        }
        
        // Form submission...
    }
    
    onCancel() {
        const { email, password, error } = this.scope.refs;
        email.value = '';
        password.value = '';
        error.hidden = true;
    }
}

// Initialization
const form = new LoginForm(document.querySelector('[data-scope="loginForm"]'));
```

### Example: Component with Nested Scopes

```html
<div data-scope="dashboard">
    <header data-ref="header">
        <h1 data-ref="title">Dashboard</h1>
        <nav data-scope="navigation">
            <button data-ref="home">Home</button>
            <button data-ref="profile">Profile</button>
            <button data-ref="settings">Settings</button>
        </nav>
    </header>
    
    <main data-scope="content">
        <section data-scope="widgets">
            <div data-ref="widget1" class="widget">Widget 1</div>
            <div data-ref="widget2" class="widget">Widget 2</div>
        </section>
    </main>
</div>
```

```javascript
import { DomScope } from 'dom-scope';

class Dashboard {
    constructor(element) {
        this.scope = new DomScope(element);
        this.init();
    }
    
    init() {
        const { header } = this.scope.refs;
        const navigation = this.scope.scopes.navigation;
        const content = this.scope.scopes.content;
        const widgets = content.scopes.widgets;
        
        // Work with navigation
        const { home, profile, settings } = navigation.refs;
        home.addEventListener('click', () => this.showSection('home'));
        
        // Work with widgets
        const { widget1, widget2 } = widgets.refs;
        widget1.addEventListener('click', () => this.onWidgetClick(1));
        
        console.log('Dashboard initialized with scopes:', 
            Object.keys(this.scope.scopes));
    }
    
    // ... component methods
}
```

## Migration from Previous Versions

### v1.x → v2.x

1. **Default Attribute Name Changes**: 
   - `data-ref` instead of `ref`
   - `data-scope` instead of `scope`
   
   Use configuration for backward compatibility:
   ```javascript
   new DomScope(element, {
       ref_attr_name: 'ref',
       scope_ref_attr_name: 'scope'
   });
   ```

2. **TypeScript Type Updates**: 
   - Now uses strict generic types
   - Update type annotations according to new system

## Performance

DomScope is optimized for large DOM trees:

- **Lazy Loading**: Scopes and references are created only on first access
- **Caching**: Search results are cached for reuse
- **Efficient Traversal**: Uses TreeWalker for fast DOM traversal
- **Minimal Reflows**: `update()` method performs minimal changes

## Compatibility

- **Browsers**: Chrome 60+, Firefox 55+, Safari 10.1+, Edge 79+
- **Node.js**: 14+ (with JSDOM for SSR)
- **TypeScript**: 4.0+
- **Frameworks**: React, Vue, Angular, Svelte (via wrappers)

## License

MIT License. 

---

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Usage Examples](https://github.com/yourusername/dom-scope/examples)
- [Report an Issue](https://github.com/yourusername/dom-scope/issues)
- [Contribute](https://github.com/yourusername/dom-scope/pulls)

