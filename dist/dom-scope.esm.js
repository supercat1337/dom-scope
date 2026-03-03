// @ts-check

/**
 * @callback IsScopeChecker
 * @param {Element|HTMLElement} element
 * @param {ScopeConfig} config
 * @returns {string|null}
 */


const DEFAULT_SETTINGS = {
    REF_ATTR: 'data-ref',
    SCOPE_ATTR: 'data-scope',
    AUTO_PREFIX: 'unnamed-scope',
};

class ScopeConfig {
    /** @param {import("./dom-scope.esm.d.ts").ScopeOptions} [options] */
    constructor(options = {}) {
        this.refAttribute = options.refAttribute ?? DEFAULT_SETTINGS.REF_ATTR;
        this.scopeAttribute = options.scopeAttribute ?? DEFAULT_SETTINGS.SCOPE_ATTR;
        this.window =
            options.window ?? (typeof globalThis !== 'undefined' ? globalThis.window : undefined);
        this.isScopeElement = options.isScopeElement ?? null;
        this.scopeAutoNamePrefix = options.scopeAutoNamePrefix ?? DEFAULT_SETTINGS.AUTO_PREFIX;
    }
}

/** @type {ScopeConfig} */
let defaultInstance = new ScopeConfig();

/**
 * Checks if the element is a scope and returns its name.
 * @param {Element|HTMLElement} element
 * @param {ScopeConfig} [config]
 * @returns {string|null}
 */
function isScopeElement(element, config = defaultInstance) {
    if (config.isScopeElement) {
        return config.isScopeElement(element, config);
    }

    const attrs = Array.isArray(config.scopeAttribute)
        ? config.scopeAttribute
        : [config.scopeAttribute];

    for (const attr of attrs) {
        const value = element.getAttribute(attr);
        if (value !== null) return value;
    }

    return null;
}

/**
 * Updates global default settings.
 * @param {import("./dom-scope.esm.d.ts").ScopeOptions} options
 * @returns {ScopeConfig}
 */
function setDefaults(options = {}) {
    defaultInstance = new ScopeConfig({ ...defaultInstance, ...options });
    return defaultInstance;
}

/**
 * Ensures we have a valid ScopeConfig instance.
 * @param {import("./dom-scope.esm.d.ts").ScopeOptions | ScopeConfig} [options]
 * @returns {ScopeConfig}
 */
function createConfig(options = {}) {
    if (options instanceof ScopeConfig) return options;
    return new ScopeConfig({ ...defaultInstance, ...options });
}

// @ts-check


/**
 * Enhanced selectRefsExtended to support multiple roots.
 * @param {import("./dom-scope.esm.d.ts").ScopeRoots} roots
 * @param {((el: HTMLElement) => void) | null} [customCallback]
 * @param {import("./dom-scope.esm.d.ts").ScopeOptions} [options]
 * @returns {import("./dom-scope.esm.d.ts").ExtendedResult}
 */
function selectRefsExtended(roots, customCallback = null, options = {}) {
    const config = createConfig(options);
    /** @type {{ [x: string]: HTMLElement; }} */
    const refs = {};
    /** @type {{ [x: string]: HTMLElement; }} */
    const scopeRefs = {};
    /** @type {HTMLElement[]} */
    const unnamedScopes = [];
    const rootList = Array.isArray(roots) ? roots : [roots];

    const callback = (/** @type {HTMLElement} */ currentNode) => {
        // 1. Refs collection
        const refName = currentNode.getAttribute(config.refAttribute);
        if (refName) {
            if (!refs[refName]) {
                refs[refName] = currentNode;
            } else {
                console.warn(`[Scope] Duplicate ref #${refName} found during multi-root scan.`);
            }
        }

        // 2. Scopes collection
        // An element is a sub-scope only if it's NOT one of our roots
        if (!rootList.includes(/** @type {HTMLElement} */ (currentNode))) {
            const scopeName = isScopeElement(currentNode, config);
            if (typeof scopeName === 'string') {
                if (scopeName !== '' && !scopeRefs[scopeName]) {
                    scopeRefs[scopeName] = currentNode;
                } else {
                    unnamedScopes.push(currentNode);
                }
            }
        }

        if (customCallback) customCallback(currentNode);
    };

    walkDomScope(roots, callback, config);

    // 3. Auto-naming unnamed scopes
    let index = 0;
    const prefix = config.scopeAutoNamePrefix;
    for (const unnamedEl of unnamedScopes) {
        while (scopeRefs[prefix + index]) index++;
        scopeRefs[prefix + index] = unnamedEl;
    }

    return { refs, scopeRefs };
}

/**
 * Selects elements marked with ref attributes within the roots.
 * * @template {import("./dom-scope.esm.d.ts").RefsAnnotation} T
 * @param {import("./dom-scope.esm.d.ts").ScopeRoots} roots
 * @param {T|null} [annotation] - The schema to validate and type the refs
 * @param {import("./dom-scope.esm.d.ts").ScopeOptions} [options]
 * @returns {import("./dom-scope.esm.d.ts").Refs<T>}
 */
function selectRefs(roots, annotation = null, options = {}) {
    const config = createConfig(options);
    /** @type {{ [x: string]: HTMLElement; }} */
    const refs = {};

    const callback = (/** @type {HTMLElement} */ currentNode) => {
        const refName = currentNode.getAttribute(config.refAttribute);
        if (refName) refs[refName] = currentNode;
    };

    // Note: refs.root in a multi-root scenario might be ambiguous,
    // but we'll follow the same logic for all elements in the array.
    walkDomScope(roots, callback, config);

    if (annotation) checkRefs(refs, annotation);
    return /** @type {import("./dom-scope.esm.d.ts").Refs<T>} */ (refs);
}

/**
 * Walks one or multiple DOM trees, skipping nested scopes.
 * @param {import("./dom-scope.esm.d.ts").ScopeRoots} roots - Single root or array of roots.
 * @param {(el: HTMLElement) => void} callback
 * @param {import("./dom-scope.esm.d.ts").ScopeOptions | import("./dom-scope.esm.d.ts").ScopeConfig} [options]
 */
function walkDomScope(roots, callback, options) {
    const config = createConfig(options);
    const win = config.window;

    // Normalize roots to an array
    const rootList = Array.isArray(roots) ? roots : [roots];

    for (const root of rootList) {
        /** @param {Node} node */
        const filter = node => {
            const el = /** @type {HTMLElement} */ (node);
            // If the node is one of our roots, we always accept it
            if (rootList.includes(el)) return win.NodeFilter.FILTER_ACCEPT;

            const parent = el.parentElement;
            // Check if we are inside a nested scope within the current root
            if (parent && !rootList.includes(parent) && isScopeElement(parent, config) !== null) {
                return win.NodeFilter.FILTER_REJECT;
            }
            return win.NodeFilter.FILTER_ACCEPT;
        };

        const walker = win.document.createTreeWalker(root, win.NodeFilter.SHOW_ELEMENT, {
            acceptNode: filter,
        });

        let currentNode;
        while ((currentNode = /** @type {HTMLElement} */ (walker.nextNode()))) {
            callback(currentNode);
        }
    }
}

/**
 * Validates that all references match the types specified in the annotation.
 * @param {Object.<string, HTMLElement>} refs
 * @param {import("./dom-scope.esm.d.ts").RefsAnnotation} annotation
 * @throws {Error} If validation fails.
 */
function checkRefs(refs, annotation) {
    for (const [prop, expectedType] of Object.entries(annotation)) {
        const ref = refs[prop];

        if (!ref) {
            throw new Error(`[Scope] Missing required data-ref: "${prop}"`);
        }

        const targetProto =
            typeof expectedType === 'function' ? expectedType.prototype : expectedType;

        if (!targetProto.isPrototypeOf(ref)) {
            const actualName = ref.constructor?.name || 'Unknown';
            const expectedName = targetProto.constructor?.name || 'ExpectedType';

            throw new Error(
                `[Scope] Type mismatch for "${prop}": expected ${expectedName}, got ${actualName}`
            );
        }
    }
}

// @ts-check


/**
 * @typedef {Element|HTMLElement|DocumentFragment|ShadowRoot} RootType
 */

/**
 * @template {import("./dom-scope.esm.d.ts").RefsAnnotation} T
 */
class DomScope {
    #isDestroyed = false;
    /** @type {RootType} */
    #rootElement;
    #isInitialized = false;

    /** @type {import("./dom-scope.esm.d.ts").Refs<T>} */
    // @ts-ignore
    #refs = {};

    /** @type {Object.<string, DomScope<any>>} */
    #scopes = {};

    /** @type {import("./dom-scope.esm.d.ts").ScopeConfig} */
    config;

    /**
     * Creates an instance of DomScope.
     * @param {RootType} rootElement - The root element for this scope.
     * @param {import("./dom-scope.esm.d.ts").ScopeOptions} [options]
     */
    constructor(rootElement, options) {
        if (!rootElement) {
            throw new Error('[DomScope] rootElement is required');
        }

        this.#rootElement = rootElement;
        // Config is created once and reused for all operations in this instance
        this.config = createConfig(options);
    }

    /** @returns {RootType} */
    get root() {
        return this.#rootElement;
    }

    /** @returns {import("./dom-scope.esm.d.ts").Refs<T>} */
    get refs() {
        if (!this.#isInitialized) {
            this.update();
        }
        return this.#refs;
    }

    /** @returns {Object.<string, DomScope<any>>} */
    get scopes() {
        if (!this.#isInitialized) {
            this.update();
        }
        return this.#scopes;
    }

    /**
     * Updates refs and child scopes by re-scanning the DOM.
     * @param {((el: HTMLElement) => void)} [callback]
     */
    update(callback) {
        this.#ensureNotDestroyed();

        const { refs, scopeRefs } = selectRefsExtended(this.#rootElement, callback, this.config);

        this.#refs = /** @type {import("./dom-scope.esm.d.ts").Refs<T>} */ (refs);

        /** @type {Object.<string, DomScope<any>>} */
        const childScopes = {};

        for (const [name, element] of Object.entries(scopeRefs)) {
            // We pass the same config instance to preserve settings down the tree
            childScopes[name] = new DomScope(element, this.config);
        }

        this.#scopes = childScopes;
        this.#isInitialized = true;
    }

    /**
     * Finds the first element matching the selector within the current scope only.
     * @param {string} query
     * @returns {HTMLElement|null}
     */
    querySelector(query) {
        this.#ensureNotDestroyed();
        const results = this.querySelectorAll(query);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Finds all elements matching the selector that belong to the current scope.
     * @param {string} query
     * @returns {HTMLElement[]}
     */
    querySelectorAll(query) {
        this.#ensureNotDestroyed();

        const found = this.#rootElement.querySelectorAll(query);
        if (found.length === 0) return [];

        const results = [];
        // @ts-ignore
        for (const node of found) {
            const el = /** @type {HTMLElement} */ (node);
            if (this.contains(el, true)) {
                results.push(el);
            }
        }

        return results;
    }

    /**
     * Checks if an element belongs to this scope (not nested in child scopes).
     * @param {Node} element
     * @param {boolean} [checkOnlyChildScopes=false]
     * @returns {boolean}
     */
    contains(element, checkOnlyChildScopes = false) {
        this.#ensureNotDestroyed();

        if (!checkOnlyChildScopes) {
            if (!this.#rootElement.contains(element)) return false;
        }

        const childScopes = this.scopes;
        for (const scopeName in childScopes) {
            const childRoot = childScopes[scopeName].root;
            if (childRoot === element) return true;
            if (childRoot.contains(element)) return false;
        }

        return true;
    }

    /**
     * Walks through all elements belonging to this scope.
     * @param {(el: HTMLElement) => void} callback
     */
    walk(callback) {
        this.#ensureNotDestroyed();
        walkDomScope(this.#rootElement, callback, this.config);
    }

    /**
     * Cleans up the instance and breaks references to DOM elements.
     */
    destroy() {
        this.#isDestroyed = true;
        this.#isInitialized = false;
        
        // @ts-ignore
        this.#rootElement = null;
        // @ts-ignore
        this.#refs = {};
        this.#scopes = {};
        // @ts-ignore
        this.config = null;
    }

    /** @returns {boolean} */
    get isDestroyed() {
        return this.#isDestroyed;
    }

    /**
     * Helper to check if an element is a scope according to current config.
     * @param {Element|HTMLElement} element
     * @returns {boolean}
     */
    isScopeElement(element) {
        return isScopeElement(element, this.config) !== null;
    }

    /**
     * Validates refs against an annotation.
     * @param {import("./dom-scope.esm.d.ts").RefsAnnotation} annotation
     */
    checkRefs(annotation) {
        this.#ensureNotDestroyed();
        checkRefs(this.refs, annotation);
    }

    #ensureNotDestroyed() {
        if (this.#isDestroyed) {
            throw new Error('[DomScope] Instance is destroyed');
        }
    }
}

export { DomScope, checkRefs, selectRefs, selectRefsExtended, setDefaults, walkDomScope };
