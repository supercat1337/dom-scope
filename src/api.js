// @ts-check

import { getOptions, isScopeElement, SCOPE_AUTO_NAME_PREFIX } from "./tools.js";

/**
 * Returns an object of child elements containing the ref attribute and an object of child elements containing the scope-ref attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element 
 * @param {import("./tools.js").SelectRefsCallback|null} [custom_callback] 
 * @param {import("./tools.js").TypeDomScopeOptions} [options] 
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element, custom_callback, options = {}) {

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
 * @param {{[key:string]: import("./tools.js").HTMLElementInterface|HTMLElement}|null} [annotation] - An object specifying the expected types for each reference.
 * @param {import("./tools.js").TypeDomScopeOptions} [options] 
 * @returns {T}
 */
export function selectRefs(root_element, annotation, options) {
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

    if (annotation) {
        checkRefs(refs, annotation, _options);
    }

    return /** @type {T} */ (refs);
}

/**
 * Walks the DOM tree of the scope and calls the callback for each element
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element 
 * @param {(currentElement:HTMLElement)=>void} callback 
 * @param {import("./tools.js").TypeDomScopeOptions} [options] the attribute name contains a name of a scope
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
 * @param {{[key:string]: import("./tools.js").HTMLElementInterface|HTMLElement}} annotation - An object specifying the expected types for each reference.
 * @param {*} [options] 
 * @throws Will throw an error if a reference is missing or does not match the expected type specified in the annotation.
 */
export function checkRefs(refs, annotation, options) {

    for (let prop in annotation) {
        let ref = refs[prop];

        if (!ref) {
            throw new Error(`Missing ref: ${prop}`);
        }

        // if type is interface, return prototype
        // @ts-ignore 
        const type = annotation[prop].constructor.name === "Function"? annotation[prop].prototype: annotation[prop];
        //console.log(type, annotation[prop]);

        if (type.isPrototypeOf(ref) === false) {
            
            throw new Error(`The ref "${prop}" must be an instance of ${type.constructor.name} (actual: ${ref.constructor.name})`);
        }

    }

}