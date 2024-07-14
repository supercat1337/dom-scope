// @ts-check

/** @module DomScope */

const SCOPE_ATTR_NAME = 'scope-name';
const REF_ATTR_NAME = 'ref';


/** 
 * @typedef {{scope_attr_name?:string, ref_attr_name?:string, document?: *, is_scope_element?: (element:HTMLElement, options:TypeAllDomScopeOptions)=>string|false}} TypeDomScopeOptions
 * @typedef {{scope_attr_name:string, ref_attr_name:string, document: *, is_scope_element: (element:HTMLElement, options:TypeAllDomScopeOptions)=>string|false}} TypeAllDomScopeOptions
*/

/**
 * 
 * @param {HTMLElement} element 
 * @param {TypeAllDomScopeOptions} options 
 * @returns {false|string} returns scope name
 */
function isScopeElement(element, options, default_name = "default") {

    var value;
    if (options.is_scope_element) {
        value = options.is_scope_element(element, options);
    } else {
        value = element.getAttribute(options.scope_attr_name);
    }

    if (value === null) return false;
    if (value === "") return default_name;

    return value;
}

/**
 * 
 * @param {TypeDomScopeOptions} [options] 
 * @returns {TypeAllDomScopeOptions}
 */
function getOptions(options) {
    return Object.assign({}, {
        scope_attr_name: SCOPE_ATTR_NAME,
        ref_attr_name: REF_ATTR_NAME,
        document: null,
        is_scope_element: undefined
    }, options);
}

/**
 * 
 * @param {HTMLElement} root_element 
 * @param {(currentElement:HTMLElement)=>void} [custom_callback] 
 * @param {TypeDomScopeOptions} [options] 
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element, custom_callback, options = {}) {

    /** @type {{[key:string]:HTMLElement}} */
    var refs = {};

    /** @type {{[key:string]:HTMLElement}} */
    var scope_refs = {};

    var _options = getOptions(options);

    /**
     * 
     * @param {HTMLElement} currentNode 
     */
    function callback(currentNode) {

        var ref_name = currentNode.getAttribute(_options.ref_attr_name);

        if (ref_name != null) {
            if (ref_name != "") {
                if (!refs[ref_name]) {
                    refs[ref_name] = currentNode;
                } else {
                    console.warn(`ref #${ref_name} is already used`);
                }
            }
        }

        if (currentNode != root_element) {
            var ref_scope_name = isScopeElement(currentNode, _options);

            if (typeof ref_scope_name == "string") {
                if (ref_scope_name == "") ref_scope_name = "default";

                if (!scope_refs[ref_scope_name]) {
                    scope_refs[ref_scope_name] = currentNode;
                } else {
                    console.warn(`scope #${ref_scope_name} is already used`);
                }

            }
        }

        if (custom_callback) custom_callback(currentNode);

    }

    walkDomScope(root_element, callback, _options);

    return { refs, scope_refs };
}

/**
 * Returns an object of child elements containing the ref attribute
 * @param {HTMLElement} root_element 
 * @param {TypeDomScopeOptions} [options] 
 */
export function selectRefs(root_element, options) {
    /** @type {{[key:string]:HTMLElement}} */
    var refs = {};
    var _options = getOptions(options);

    /**
     * 
     * @param {HTMLElement} currentNode 
     */
    function callback(currentNode) {
        let ref_name = currentNode.getAttribute(_options.ref_attr_name);

        if (ref_name) {
            refs[ref_name] = currentNode;
        }

    }

    walkDomScope(root_element, callback, _options);
    return refs;
}

/**
 * 
 * @param {HTMLElement} root_element 
 * @param {(currentElement:HTMLElement)=>void} callback 
 * @param {TypeDomScopeOptions} [options] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element, callback, options) {

    var _options = getOptions(options);

    /**
     * @param {Node} _node 
     * @returns 
     */
    function scope_filter(_node) {
        var node = /** @type {HTMLElement} */ (_node);

        var parentElement = node.parentElement;

        if (parentElement && parentElement != root_element && isScopeElement(parentElement, _options)) {
            return /* NodeFilter.FILTER_REJECT */ 2
        }

        return /* NodeFilter.FILTER_ACCEPT */ 1
    }

    const tw = (_options.document || root_element.ownerDocument).createTreeWalker(root_element, /* NodeFilter.SHOW_ELEMENT */ 1, scope_filter);

    var currentNode;

    while (currentNode = /** @type {HTMLElement} */ (tw.nextNode())) {
        callback(currentNode);
    }

}

/** @typedef {DomScope} TypeDomScope */

export class DomScope {

    /** @type {HTMLElement} */
    #root_element

    /** @type {Boolean} */
    #first_time_call = true

    /** @type {{[key:string]:HTMLElement}} */
    #refs

    /** @type {{[key:string]:DomScope}} */
    #scopes

    /** @type {TypeDomScopeOptions} */
    options = {}

    /**
     * 
     * @param {HTMLElement} root_element the root element
     */
    constructor(root_element) {
        this.#root_element = root_element;
    }

    /**
     * Get root element
     *
     * @type {HTMLElement}
     */
    get root() {
        return this.#root_element;
    }

    /** 
     * get the object contains html elements with ref attribute  
     * @type {{[key:string]:HTMLElement}} 
     * */
    get refs() {
        if (this.#first_time_call) {
            this.update();
        }

        return this.#refs;
    }

    /**
     * get the object contains children DomScopes 
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
     * @param {(currentElement:HTMLElement)=>void} [callback]
    */
    update(callback) {
        if (this.#root_element === null) throw new Error("Object is already destroyed");

        let { refs, scope_refs } = selectRefsExtended(this.#root_element, callback, this.options);
        this.#refs = refs;

        /** @type {{[key:string]:DomScope}} */
        let dom_scopes = {};

        for (let scope_name in scope_refs) {
            dom_scopes[scope_name] = new DomScope(scope_refs[scope_name]);
            dom_scopes[scope_name].options = this.options;
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
        if (this.#root_element === null) throw new Error("Object is already destroyed");

        let result = this.#root_element.querySelector(query);
        if (!result) return null;

        if (!this.contains(result, true)) return null;

        return result;
    }

    /**
     * Searches elements with css selector in current DomScope
     * @param {string} query 
     * @returns {HTMLElement[]}
     */
    querySelectorAll(query) {
        if (this.#root_element === null) throw new Error("Object is already destroyed");

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
        if (this.#root_element === null) throw new Error("Object is already destroyed");

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
        if (this.#root_element === null) throw new Error("Object is already destroyed");

        walkDomScope(this.#root_element, callback, this.options);
    }

    /**
     * Destroys the instance 
     */
    destroy() {
        // @ts-ignore
        this.#root_element = null;

        this.#first_time_call = false;
        this.#refs = {};
        this.#scopes = {};
        this.options = {};
    }
}
