// @ts-check

import { checkRefs, selectRefsExtended, walkDomScope } from './api.js';
import { createConfig, isScopeElement } from './config.js';

/**
 * @typedef {Element|HTMLElement|DocumentFragment|ShadowRoot} RootType
 */

/**
 * @template {import("./types.js").RefsAnnotation} T
 */
export class DomScope {
    #isDestroyed = false;
    /** @type {RootType} */
    #rootElement;
    #isInitialized = false;

    /** @type {import("./types.js").Refs<T>} */
    // @ts-ignore
    #refs = {};

    /** @type {Object.<string, DomScope<any>>} */
    #scopes = {};

    /** @type {import("./types.js").ScopeConfig} */
    config;

    /**
     * Creates an instance of DomScope.
     * @param {RootType} rootElement - The root element for this scope.
     * @param {import("./types.js").ScopeOptions} [options]
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

    /** @returns {import("./types.js").Refs<T>} */
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

        this.#refs = /** @type {import("./types.js").Refs<T>} */ (refs);

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
     * @param {import("./types.js").RefsAnnotation} annotation
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