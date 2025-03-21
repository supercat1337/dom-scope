// @ts-check

const SCOPE_ATTR_NAME = "scope-ref";
const SCOPE_AUTO_NAME_PREFIX = "$";
const REF_ATTR_NAME = "ref";

/**
 * @typedef {import("./types.d.ts").RefsAnnotation} RefsAnnotation
 */

/**
 * @template {RefsAnnotation} T
 * @typedef {import("./types.d.ts").Refs<T>} Refs<T>
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
export function isScopeElement(element, config) {
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
export function getConfig(options = {}, checkWindow = true) {
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
export function setDomScopeOptions(options) {
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
export function useDataAttributes(enabled = true) {
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
