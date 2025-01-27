// @ts-check
/** @module DomScope */

import { checkRefs, selectRefsExtended, walkDomScope } from "./api.js";
import { getOptions, isScopeElement } from "./tools.js";

/**
 * @typedef {Element|HTMLElement|DocumentFragment|ShadowRoot} RootType
 */


/**
 * @template {{[key:string]:HTMLElement}} T
 */
export class DomScope {

    #is_destroyed = false;

    /** @type {RootType} */
    #root_element

    /** @type {Boolean} */
    #first_time_call = true

    /** @type {T} */
    #refs

    /** @type {{[key:string]:DomScope}} */
    #scopes

    /** @type {import("./tools.js").TypeAllDomScopeOptions} */
    options 


    /**
     * Creates an instance of DomScope.
     * @param {RootType} root_element the root element
     * @param {import("./tools.js").TypeDomScopeOptions} [options] 
     */
    constructor(root_element, options) {
        if (root_element == null) throw new Error("root_element is null");

        this.#root_element = root_element;
        this.options = getOptions(options);
    }

    /**
     * Returns the root element
     * @type {RootType}
     */
    get root() {
        return this.#root_element;
    }

    /** 
     * Returns the object containing html elements with ref attribute
     * @type {T} 
     * */
    get refs() {
        if (this.#first_time_call) {
            this.update();
        }

        return this.#refs;
    }

    /**
     * Returns the object containing children DomScopes
     * @type {{[key:string]:DomScope}} 
     * */
    get scopes() {
        if (this.#first_time_call) {
            this.update();
        }

        return this.#scopes;
    }

    /**
     * Updates refs and scopes objects
     * @param {(currentElement:Element|HTMLElement)=>void} [callback]
    */
    update(callback) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");

        let { refs, scope_refs } = selectRefsExtended(this.#root_element, callback, this.options);

        this.#refs = /** @type {T} */ (refs);

        /** @type {{[key:string]:DomScope}} */
        let dom_scopes = {};

        for (let scope_name in scope_refs) {
            dom_scopes[scope_name] = new DomScope(scope_refs[scope_name], this.options);
        }

        this.#scopes = dom_scopes;
        this.#first_time_call = false;
    }

    /**
     * Searches an element with css selector in current DomScope
     * @param {string} query 
     * @returns {null|Element}
     */
    querySelector(query) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");

        let result = this.querySelectorAll(query);
        if (result.length == 0) return null;

        return result[0];
    }

    /**
     * Searches elements with css selector in current DomScope
     * @param {string} query 
     * @returns {HTMLElement[]}
     */
    querySelectorAll(query) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");

        var found_results = this.#root_element.querySelectorAll(query);
        if (found_results.length == 0) return [];

        /** @type {HTMLElement[]} */
        var result = [];

        for (let i = 0; i < found_results.length; i++) {
            if (this.contains(found_results[i], true)) result.push( /** @type {HTMLElement} */(found_results[i]));
        }

        return result;
    }

    /**
     * Check if current DomScope constains the element
     * @param {Node} element 
     * @param {boolean} [check_only_child_scopes=false] 
     * @returns {Boolean}
     */
    contains(element, check_only_child_scopes = false) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");

        if (check_only_child_scopes === false) {
            if (!this.#root_element.contains(element)) return false;
        }

        var scopes = this.scopes;

        for (let scope_name in scopes) {
            let child_scope = scopes[scope_name];
            if (child_scope.#root_element == element) return true;
            if (child_scope.#root_element.contains(element)) return false;
        }

        return true;
    }

    /**
     * Walks through all elements in the scope
     * @param {(currentElement:HTMLElement)=>void} callback 
     */
    walk(callback) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");

        walkDomScope(this.#root_element, callback, this.options);
    }

    /**
     * Destroys the instance 
     */
    destroy() {
        this.#is_destroyed = true;

        // @ts-ignore
        this.#root_element = null;

        this.#first_time_call = false;

        // @ts-expect-error
        this.#refs = {};

        this.#scopes = {};

        // @ts-expect-error
        this.options = {};
    }

    /**
     * Checks if element is scope
     * @param {Element|HTMLElement} element 
     * @returns {boolean}
     */
    isScopeElement(element) {
        return !!isScopeElement(element, this.options);
    }

    /**
     * Checks if the instance was destroyed
     * @returns {boolean} true if the instance was destroyed
     */
    get isDestroyed() {
        return this.#is_destroyed;
    }


    /**
     * Checks if all references in the scope are correct. If not, throws an error
     * @param {{[key:string]: import("./tools.js").HTMLElementInterface|HTMLElement}} annotation Object with property names as keys and function constructors as values
     * @example
     * const scope = new DomScope(my_element);
     * scope.checkRefs({
     *     my_button: HTMLButtonElement,
     *     my_input: HTMLInputElement
     * });
     */
    checkRefs(annotation) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");

        let refs = this.refs;
        checkRefs(refs, annotation, this.options);
    }
}

