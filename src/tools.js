// @ts-check

export const SCOPE_ATTR_NAME = "scope-ref";
export const SCOPE_AUTO_NAME_PREFIX = "$";
export const REF_ATTR_NAME = "ref";


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
 * @typedef {(currentElement:HTMLElement)=>void} SelectRefsCallback
 */

/**
 * Checks if the element is a scope
 * @param {Element|HTMLElement} element 
 * @param {TypeAllDomScopeOptions} options 
 * @returns {false|string} returns scope name or false
 */
export function isScopeElement(element, options) {

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
export function getOptions(options) {
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