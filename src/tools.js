// @ts-check

export const SCOPE_ATTR_NAME = "scope-ref";
export const SCOPE_AUTO_NAME_PREFIX = "$";
export const REF_ATTR_NAME = "ref";



/**
 * @typedef {import("./types.d.ts").RefsAnnotation} RefsAnnotation 
 */

/**
 * @template {RefsAnnotation} T 
 * @typedef {import("./types.d.ts").Refs<T>} Refs<T> 
 */


/** 
 * @typedef {(element:Element|HTMLElement, settings:ScopeConfig)=>string|null|false} TypeIsScopeElement
 * @typedef {{ref_attr_name?:string, window?: *, is_scope_element?: TypeIsScopeElement, include_root?: boolean}} ScopeSettings
 * @typedef {{ref_attr_name:string, window: *, is_scope_element: TypeIsScopeElement|undefined, include_root: boolean}} ScopeConfig
*/

/**
 * @typedef {(currentElement:HTMLElement)=>void} SelectRefsCallback
 */

/**
 * Checks if the element is a scope
 * @param {Element|HTMLElement} element 
 * @param {ScopeConfig} settings 
 * @returns {false|string} returns scope name or false
 */
export function isScopeElement(element, settings) {

    var value;
    if (settings.is_scope_element) {
        value = settings.is_scope_element(element, settings);
    } else {
        value = element.getAttribute(SCOPE_ATTR_NAME);
    }

    if (value === null) return false;

    return value;
}

/**
 * Creates settings
 * @param {ScopeSettings} [settings] 
 * @returns {ScopeConfig}
 */
export function getConfig(settings) {
    /** @type {ScopeConfig} */
    let init_data = {
        ref_attr_name: REF_ATTR_NAME,
        window: globalThis.window,
        is_scope_element: undefined,
        include_root: false
    };

    let config = Object.assign({}, init_data, settings);

    if (!config.window) {
        throw new Error("settings.window is not defined");
    }

    return config;
}