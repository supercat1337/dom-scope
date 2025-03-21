// @ts-check

const SCOPE_ATTR_NAME = "scope-ref";
const SCOPE_AUTO_NAME_PREFIX = "$";
const REF_ATTR_NAME = "ref";

/**
 * @typedef {import("./dom-scope.esm.d.ts").RefsAnnotation} RefsAnnotation
 */

/**
 * @template {RefsAnnotation} T
 * @typedef {import("./dom-scope.esm.d.ts").Refs<T>} Refs<T>
 */

/**
 * @typedef {(element:Element|HTMLElement, options:ScopeConfig)=>string|null|false} TypeIsScopeElement
 * @typedef {{ref_attr_name?:string, scope_ref_attr_name?: string, window?: *, is_scope_element?: TypeIsScopeElement, include_root?: boolean, scope_auto_name_prefix?: string}} ScopeOptions
 * @typedef {{ref_attr_name:string, scope_ref_attr_name: string, window: *, is_scope_element: TypeIsScopeElement|undefined, include_root: boolean, scope_auto_name_prefix: string}} ScopeConfig
 */

/**
 * @typedef {(currentElement:HTMLElement)=>void} SelectRefsCallback
 */

/** @type {ScopeConfig} */
const defaultDomScopeConfig = {
    scope_auto_name_prefix: SCOPE_AUTO_NAME_PREFIX,
    scope_ref_attr_name: SCOPE_ATTR_NAME,
    ref_attr_name: REF_ATTR_NAME,
    window: globalThis.window,
    is_scope_element: undefined,
    include_root: false,
};

/** @type {ScopeOptions} */
var customDomScopeOptions = {};

/**
 * Checks if the element is a scope
 * @param {Element|HTMLElement} element
 * @param {ScopeConfig} config
 * @returns {false|string} returns scope name or false
 */
function isScopeElement(element, config) {
    var value;
    if (config.is_scope_element) {
        value = config.is_scope_element(element, config);
    } else {
        value = element.getAttribute(config.scope_ref_attr_name);
    }

    if (value === null) return false;

    return value;
}

/**
 * Returns a configuration object for the scope.
 * Merges custom options with default configuration.
 * Throws an error if 'checkWindow' is true and 'window' is not defined.
 *
 * @param {ScopeOptions} [options={}] - Custom options to override the default configuration.
 * @param {boolean} [checkWindow=true] - If set to true, checks if 'window' is defined in the configuration.
 * @returns {ScopeConfig} The configuration object.
 * @throws {Error} If 'checkWindow' is true and 'window' is not defined.
 */
function getConfig(options = {}, checkWindow = true) {
    /** @type {ScopeConfig} */
    let init_data = {
        scope_auto_name_prefix:
            customDomScopeOptions.scope_auto_name_prefix ||
            defaultDomScopeConfig.scope_auto_name_prefix,
        scope_ref_attr_name:
            customDomScopeOptions.scope_ref_attr_name ||
            defaultDomScopeConfig.scope_ref_attr_name,
        ref_attr_name:
            customDomScopeOptions.ref_attr_name ||
            defaultDomScopeConfig.ref_attr_name,
        window: customDomScopeOptions.window || defaultDomScopeConfig.window,
        is_scope_element:
            customDomScopeOptions.is_scope_element ||
            defaultDomScopeConfig.is_scope_element,
        include_root:
            customDomScopeOptions.include_root ||
            defaultDomScopeConfig.include_root,
    };

    /** @type {ScopeConfig} */
    let config = Object.assign({}, init_data, options);

    if (checkWindow && !config.window) {
        throw new Error("options.window is not defined");
    }

    return config;
}

/**
 * Sets default options for DomScope
 * @param {ScopeOptions} options
 */
function setDomScopeOptions(options) {
    customDomScopeOptions = {};

    if (options.hasOwnProperty("ref_attr_name"))
        customDomScopeOptions.ref_attr_name = options.ref_attr_name;
    if (options.hasOwnProperty("window"))
        customDomScopeOptions.window = options.window;
    if (options.hasOwnProperty("is_scope_element"))
        customDomScopeOptions.is_scope_element = options.is_scope_element;
    if (options.hasOwnProperty("include_root"))
        customDomScopeOptions.include_root = options.include_root;
}

/**
 * Changes the default attribute names to use data attributes instead of custom attributes. This way you can use DomScope in a context where custom attributes are not allowed.
 * @param {boolean} [enabled=true] Set to false to disable using data attributes.
 * @returns {void}
 */
function useDataAttributes(enabled = true) {
    const config = getConfig({}, false);

    if (enabled) {
        customDomScopeOptions.ref_attr_name = !/^data-/.test(
            config.ref_attr_name
        )
            ? `data-${config.ref_attr_name}`
            : config.ref_attr_name;
        customDomScopeOptions.scope_ref_attr_name = !/^data-/.test(
            config.scope_ref_attr_name
        )
            ? `data-${config.scope_ref_attr_name}`
            : config.scope_ref_attr_name;
    } else {
        customDomScopeOptions.ref_attr_name = config.ref_attr_name.replace(
            /^data-/,
            ""
        );
        customDomScopeOptions.scope_ref_attr_name =
            config.scope_ref_attr_name.replace(/^data-/, "");
    }
}

// @ts-check


/**
 * Returns an object of child elements containing the ref attribute and an object of child elements containing the scope-ref attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {SelectRefsCallback|null} [custom_callback]
 * @param {ScopeOptions} [options]
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
function selectRefsExtended(
    root_element,
    custom_callback,
    options = {}
) {
    /** @type {{[key:string]:HTMLElement}} */
    var refs = {};

    /** @type {{[key:string]:HTMLElement}} */
    var scope_refs = {};

    /** @type {HTMLElement[]} */
    var unnamed_scopes = [];

    const config = getConfig(options);

    /**
     *
     * @param {HTMLElement} currentNode
     */
    function callback(currentNode) {
        var ref_name = currentNode.getAttribute(config.ref_attr_name);

        if (ref_name != null) {
            if (ref_name != "") {
                if (!refs[ref_name]) {
                    refs[ref_name] = currentNode;
                } else {
                    // is real browser
                    if (globalThis.window) {
                        console.warn(
                            `Element has reference #${ref_name} which is already used\n`,
                            `\nelement: `,
                            currentNode,
                            `\nreference #${ref_name}: `,
                            refs[ref_name],
                            `\nscope root: `,
                            root_element
                        );
                    } else {
                        console.warn(
                            `Element has reference #${ref_name} which is already used\n`
                        );
                    }
                }
            }
        }

        if (currentNode != root_element) {
            var ref_scope_name = isScopeElement(currentNode, config);

            if (typeof ref_scope_name != "string") return;

            if (ref_scope_name != "") {
                if (!scope_refs[ref_scope_name]) {
                    scope_refs[ref_scope_name] = currentNode;
                } else {
                    // is real browser
                    if (globalThis.window) {
                        console.warn(
                            `scope #${ref_scope_name} is already used`,
                            currentNode
                        );
                    } else {
                        console.warn(
                            `scope #${ref_scope_name} is already used`
                        );
                    }

                    unnamed_scopes.push(currentNode);
                }
            } else {
                unnamed_scopes.push(currentNode);
            }
        }

        if (custom_callback) custom_callback(currentNode);
    }

    if (config.include_root === true) {
        if (root_element instanceof config.window.HTMLElement) {
            refs.root = /** @type {HTMLElement} */ (root_element);

            if (custom_callback) {
                custom_callback(/** @type {HTMLElement} */ (root_element));
            }
        }
    }

    walkDomScope(root_element, callback, config);

    var index = 0;
    const SCOPE_AUTO_NAME_PREFIX = config.scope_auto_name_prefix;

    unnamed_scopes.forEach((unnamed_scope_element) => {
        while (scope_refs[SCOPE_AUTO_NAME_PREFIX + index.toString()]) {
            index++;
        }

        scope_refs[SCOPE_AUTO_NAME_PREFIX + index.toString()] =
            unnamed_scope_element;
    });

    return { refs, scope_refs };
}

/**
 * Returns an object of child elements containing the ref attribute
 * @template {RefsAnnotation} T
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {T|null} [annotation] - An object specifying the expected types for each reference.
 * @param {ScopeOptions} [options]
 * @returns {Refs<T>}
 */
function selectRefs(root_element, annotation, options) {
    /** @type {{[key:string]:HTMLElement}} */
    var refs = {};
    const config = getConfig(options);

    /**
     *
     * @param {HTMLElement} currentNode
     */
    function callback(currentNode) {
        let ref_name = currentNode.getAttribute(config.ref_attr_name);

        if (ref_name) {
            if (annotation) {
                if (annotation[ref_name]) {
                    refs[ref_name] = currentNode;
                }
            } else {
                refs[ref_name] = currentNode;
            }
        }
    }

    if (config.include_root === true) {
        if (root_element instanceof config.window.HTMLElement) {
            refs.root = /** @type {HTMLElement} */ (root_element);
        }
    }

    walkDomScope(root_element, callback, config);

    if (annotation) {
        checkRefs(refs, annotation);
    }

    return /** @type {import("./dom-scope.esm.d.ts").Refs<T>} */ (refs);
}

/**
 * Walks the DOM tree of the scope and calls the callback for each element
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} callback
 * @param {ScopeOptions} [options] the attribute name contains a name of a scope
 */
function walkDomScope(root_element, callback, options) {
    const config = getConfig(options);

    /**
     * @param {Node} _node
     * @returns
     */
    function scope_filter(_node) {
        var node = /** @type {HTMLElement} */ (_node);

        var parentElement = node.parentElement;

        if (
            parentElement &&
            parentElement != root_element &&
            isScopeElement(parentElement, config) !== false
        ) {
            return /* NodeFilter.FILTER_REJECT */ 2;
        }

        return /* NodeFilter.FILTER_ACCEPT */ 1;
    }

    const tw = config.window.document.createTreeWalker(
        root_element,
        /* NodeFilter.SHOW_ELEMENT */ 1,
        scope_filter
    );

    var currentNode;

    if (config.include_root === true) {
        if (root_element instanceof config.window.HTMLElement) {
            callback(/** @type {HTMLElement} */ (root_element));
        }
    }

    while ((currentNode = /** @type {HTMLElement} */ (tw.nextNode()))) {
        callback(currentNode);
    }
}

/**
 * Validates that all references in the provided `refs` object match the types specified in the `annotation` object.
 * Throws an error if any reference is missing or does not match the expected type.
 *
 * @param {{[key:string]: HTMLElement}} refs - An object containing references with property names as keys.
 * @param {RefsAnnotation} annotation - An object specifying the expected types for each reference.
 * @throws Will throw an error if a reference is missing or does not match the expected type specified in the annotation.
 */
function checkRefs(refs, annotation) {
    for (let prop in annotation) {
        let ref = refs[prop];

        if (!ref) {
            throw new Error(`Missing ref: ${prop}`);
        }

        // if type is interface, return prototype

        const type =
            typeof annotation[prop] === "function"
                ? annotation[prop].prototype
                : annotation[prop];

        if (type.isPrototypeOf(ref) === false) {
            throw new Error(
                `The ref "${prop}" must be an instance of ${type.constructor.name} (actual: ${ref.constructor.name})`
            );
        }
    }
}

// @ts-check


/**
 * @typedef {Element|HTMLElement|DocumentFragment|ShadowRoot} RootType
 */

/**
 * @template {RefsAnnotation} T
 */
class DomScope {
    #is_destroyed = false;

    /** @type {RootType} */
    #root_element;

    /** @type {Boolean} */
    #first_time_call = true;

    /** @type {Refs<T>} */
    #refs;

    /** @type {{[key:string]:DomScope}} */
    #scopes;

    /** @type {ScopeConfig} */
    config;

    /**
     * Creates an instance of DomScope.
     * @param {RootType} root_element the root element
     * @param {ScopeOptions} [options]
     */
    constructor(root_element, options) {
        if (root_element == null) throw new Error("root_element is null");

        this.#root_element = root_element;
        this.config = getConfig(options);
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
     * @type {Refs<T>}
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

        let { refs, scope_refs } = selectRefsExtended(
            this.#root_element,
            callback,
            this.config
        );

        this.#refs = /** @type {Refs<T>} */ (refs);

        /** @type {{[key:string]:DomScope}} */
        let dom_scopes = {};

        for (let scope_name in scope_refs) {
            dom_scopes[scope_name] = new DomScope(
                scope_refs[scope_name],
                this.config
            );
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
            if (this.contains(found_results[i], true))
                result.push(/** @type {HTMLElement} */ (found_results[i]));
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

        walkDomScope(this.#root_element, callback, this.config);
    }

    /**
     * Destroys the instance
     */
    destroy() {
        this.#is_destroyed = true;

        // @ts-ignore
        this.#root_element = null;

        this.#first_time_call = false;

        // @ts-ignore
        this.#refs = {};

        this.#scopes = {};

        // @ts-ignore
        this.config = {};
    }

    /**
     * Checks if element is scope
     * @param {Element|HTMLElement} element
     * @returns {boolean}
     */
    isScopeElement(element) {
        return !!isScopeElement(element, this.config);
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
     * @param {RefsAnnotation} annotation Object with property names as keys and function constructors as values
     * @example
     * const scope = new DomScope(my_element);
     * scope.checkRefs({
     *     my_button: HTMLButtonElement,
     *     my_input: HTMLInputElement
     * });
     */
    checkRefs(annotation) {
        if (this.#is_destroyed) throw new Error("Object is already destroyed");
        checkRefs(this.refs, annotation);
    }
}

// @ts-check


/**
 * Converts an HTML string to an DocumentFragment.
 *
 * @param {string} html - The HTML string
 * @param {{window?: *}} [options] - The options object
 * @returns {DocumentFragment} - The DocumentFragment created from the HTML string
 * @throws {Error} - If no element or multiple elements are found in the HTML string
 */
function createFromHTML(html, options) {
    if (typeof html !== "string") {
        throw new Error("html must be a string");
    }

    const config = getConfig(options);
    let wnd = config.window;

    const doc = /** @type {Document} */ (wnd.document);

    const template = doc.createElement("template");
    template.innerHTML = html;
    return template.content;
}

// @ts-check

let id = 0;

/** @type {Map<string, number>} */
let id_map = new Map();

/**
 * Generates a unique id with an optional custom prefix. If a prefix is supplied, the
 * generated id will be of the form `<prefix>_<number>`. If no prefix is supplied, the
 * generated id will be of the form `id_<number>`. The generated id is guaranteed to be
 * unique per prefix.
 * @param {string} [custom_prefix] The custom prefix to use when generating the id.
 * @returns {string} The generated id.
 */
function generateId(custom_prefix) {

    if (typeof custom_prefix === "string") {
        let id = 0;

        if (id_map.has(custom_prefix)) {
            let current_id = id_map.get(custom_prefix) || 0;
            id = current_id + 1;
        } 
        
        id_map.set(custom_prefix, id);
        return `${custom_prefix}_${id}`;
    }

    let name = `id_${id}`;
    id++;
    return name;
}

export { DomScope, checkRefs, createFromHTML, generateId, selectRefs, selectRefsExtended, setDomScopeOptions, useDataAttributes, walkDomScope };
