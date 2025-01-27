// @ts-check

const SCOPE_ATTR_NAME = "scope-ref";
const SCOPE_AUTO_NAME_PREFIX = "$";
const REF_ATTR_NAME = "ref";


/** 
 * @typedef {(element:Element|HTMLElement, options:TypeAllDomScopeOptions)=>string|null|false} TypeIsScopeElement
 * @typedef {{ref_attr_name?:string, window?: *, is_scope_element?: TypeIsScopeElement, default_scope_name?: string|function():string, include_root?: boolean}} TypeDomScopeOptions
 * @typedef {{ref_attr_name:string, window: *, is_scope_element?: TypeIsScopeElement, default_scope_name?: string|function():string, include_root: boolean}} TypeAllDomScopeOptions
*/

/**
 * @typedef {Object} HTMLElementInterface
 * @prop {string} name
 * @prop {HTMLElement} prototype
 */

/**
 * Checks if the element is a scope
 * @param {Element|HTMLElement} element 
 * @param {TypeAllDomScopeOptions} options 
 * @returns {false|string} returns scope name or false
 */
function isScopeElement(element, options) {

    var value;
    if (options.is_scope_element) {
        value = options.is_scope_element(element, options);
    } else {
        value = element.getAttribute(SCOPE_ATTR_NAME);
    }

    if (value === null) return false;

    return value;
}

/**
 * Creates options
 * @param {TypeDomScopeOptions} [options] 
 * @returns {TypeAllDomScopeOptions}
 */
function getOptions(options) {
    /** @type {TypeAllDomScopeOptions} */
    let init_data = {
        ref_attr_name: REF_ATTR_NAME,
        window: globalThis.window,
        is_scope_element: undefined,
        default_scope_name: undefined,
        include_root: true
    };

    let _options = Object.assign({}, init_data, options);

    if (!_options.window) {
        throw new Error("options.window is not defined");
    }

    return _options;
}

// @ts-check


/**
 * Returns an object of child elements containing the ref attribute and an object of child elements containing the scope-ref attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element 
 * @param {(currentElement:HTMLElement)=>void} [custom_callback] 
 * @param {TypeDomScopeOptions} [options] 
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
function selectRefsExtended(root_element, custom_callback, options = {}) {

    /** @type {{[key:string]:HTMLElement}} */
    var refs = {};

    /** @type {{[key:string]:HTMLElement}} */
    var scope_refs = {};

    /** @type {HTMLElement[]} */
    var unnamed_scopes = [];

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
                    console.warn(`Element has reference #${ref_name} which is already used\n`, `\nelement: `, currentNode, `\nreference #${ref_name}: `, refs[ref_name], `\nscope root: `, root_element);
                }
            }
        }

        if (currentNode != root_element) {
            var ref_scope_name = isScopeElement(currentNode, _options);

            if (typeof ref_scope_name != "string") return;

            if (ref_scope_name != "") {
                if (!scope_refs[ref_scope_name]) {
                    scope_refs[ref_scope_name] = currentNode;
                } else {
                    console.warn(`scope #${ref_scope_name} is already used`, currentNode);
                    unnamed_scopes.push(currentNode);
                }
            } else {
                unnamed_scopes.push(currentNode);
            }


        }

        if (custom_callback) custom_callback(currentNode);

    }

    if (_options.include_root === true) {
        if (root_element instanceof options.window.HTMLElement) {
            refs.root = /** @type {HTMLElement} */ (root_element);

            if (custom_callback) {
                custom_callback(/** @type {HTMLElement} */(root_element));
            }
        }
    }

    walkDomScope(root_element, callback, _options);

    var index = 0;
    unnamed_scopes.forEach((unnamed_scope_element) => {
        while (scope_refs[SCOPE_AUTO_NAME_PREFIX + index.toString()]) {
            index++;
        }

        scope_refs[SCOPE_AUTO_NAME_PREFIX + index.toString()] = unnamed_scope_element;
    });

    return { refs, scope_refs };
}

/**
 * Returns an object of child elements containing the ref attribute
 * @template {{[key:string]:HTMLElement}} T
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element 
 * @param {TypeDomScopeOptions} [options] 
 * @returns {T}
 */
function selectRefs(root_element, options) {
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
    return /** @type {T} */ (refs);
}

/**
 * Walks the DOM tree of the scope and calls the callback for each element
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element 
 * @param {(currentElement:HTMLElement)=>void} callback 
 * @param {TypeDomScopeOptions} [options] the attribute name contains a name of a scope
 */
function walkDomScope(root_element, callback, options) {

    var _options = getOptions(options);

    /**
     * @param {Node} _node 
     * @returns 
     */
    function scope_filter(_node) {
        var node = /** @type {HTMLElement} */ (_node);

        var parentElement = node.parentElement;

        if (parentElement && parentElement != root_element && isScopeElement(parentElement, _options) !== false) {
            return /* NodeFilter.FILTER_REJECT */ 2
        }

        return /* NodeFilter.FILTER_ACCEPT */ 1
    }

    const tw = _options.window.document.createTreeWalker(root_element, /* NodeFilter.SHOW_ELEMENT */ 1, scope_filter);

    var currentNode;

    while (currentNode = /** @type {HTMLElement} */ (tw.nextNode())) {
        callback(currentNode);
    }

}

/**
 * Validates that all references in the provided `refs` object match the types specified in the `annotation` object.
 * Throws an error if any reference is missing or does not match the expected type.
 * 
 * @param {{[key:string]: HTMLElement}} refs - An object containing references with property names as keys.
 * @param {{[key:string]: HTMLElementInterface|HTMLElement}} annotation - An object specifying the expected types for each reference.
 * 
 * @throws Will throw an error if a reference is missing or does not match the expected type specified in the annotation.
 */
function checkRefs(refs, annotation, options) {

    getOptions(options);

    for (let prop in annotation) {
        let ref = refs[prop];

        if (!ref) {
            throw new Error(`Missing ref: ${prop}`);
        }

        /*
        let _type = annotation[prop];
        let type = typeof _type === "function"? Object.getPrototypeOf(_type): _type;

        if (type.isPrototypeOf(ref) === false) {
            throw new Error(`The ref "${prop}" must be an instance of ${type.constructor.name} (actual: ${ref.constructor.name})`);
        } 
        */  

        // if type is interface, return prototype
        // @ts-ignore 
        const type = annotation[prop].constructor.name === "Function"? annotation[prop].prototype: annotation[prop];
        //console.log(type, annotation[prop]);

        if (type.isPrototypeOf(ref) === false) {
            
            throw new Error(`The ref "${prop}" must be an instance of ${type.constructor.name} (actual: ${ref.constructor.name})`);
        }


        /*

        let type = annotation[prop];
        if (type instanceof _options.window.HTMLElement) {
            if (type.isPrototypeOf(ref) === false) {
                throw new Error(`The ref "${prop}" must be an instance of ${type.constructor.name} (actual: ${ref.constructor.name})`);
            }   
        }
        else {
            // @ts-ignore
            if (type.prototype.isPrototypeOf(ref) === false) {
                // @ts-ignore
                throw new Error(`The ref "${prop}" must be an instance of ${type.name} (actual: ${ref.constructor.name})`);
            }   
        }
        //*/
    }

}

// @ts-check
/** @module DomScope */


/**
 * @typedef {Element|HTMLElement|DocumentFragment|ShadowRoot} RootType
 */


/**
 * @template {{[key:string]:HTMLElement}} T
 */
class DomScope {

    #is_destroyed = false;

    /** @type {RootType} */
    #root_element

    /** @type {Boolean} */
    #first_time_call = true

    /** @type {T} */
    #refs

    /** @type {{[key:string]:DomScope}} */
    #scopes

    /** @type {TypeAllDomScopeOptions} */
    options 


    /**
     * Creates an instance of DomScope.
     * @param {RootType} root_element the root element
     * @param {TypeDomScopeOptions} [options] 
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
     * @param {{[key:string]: HTMLElementInterface|HTMLElement}} annotation Object with property names as keys and function constructors as values
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

export { DomScope, checkRefs, selectRefs, selectRefsExtended, walkDomScope };
