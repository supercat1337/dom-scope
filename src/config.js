// @ts-check

const SCOPE_ATTR_NAME = 'data-scope';
const SCOPE_AUTO_NAME_PREFIX = 'unnamed-scope';
const REF_ATTR_NAME = 'data-ref';

/**
 * @typedef {import("./types.d.ts").RefsAnnotation} RefsAnnotation
 */

/**
 * @template {RefsAnnotation} T
 * @typedef {import("./types.d.ts").Refs<T>} Refs<T>
 */

/**
 * @typedef {(element:Element|HTMLElement, options:ScopeConfig)=>string|null} TypeIsScopeElement
 * @typedef {{ref_attr_name?:string, scope_ref_attr_name?: string, window?: *, isScopeElement?: TypeIsScopeElement|null, includeRoot?: boolean, scope_auto_name_prefix?: string}} ScopeOptions
 */

/**
 * @typedef {(currentElement:HTMLElement)=>void} SelectRefsCallback
 */

export class ScopeConfig {
    /** @type {string} */
    ref_attr_name;
    /** @type {string} */
    scope_ref_attr_name;
    /** @type {*} */
    window;
    /** @type {TypeIsScopeElement|null} */
    isScopeElement;
    /** @type {boolean} */
    includeRoot;
    /** @type {string} */
    scope_auto_name_prefix;

    constructor() {
        this.ref_attr_name = REF_ATTR_NAME;
        this.scope_ref_attr_name = SCOPE_ATTR_NAME;
        this.window = globalThis.window;
        this.isScopeElement = null;
        this.includeRoot = false;
        this.scope_auto_name_prefix = SCOPE_AUTO_NAME_PREFIX;
    }

}

/** @type {ScopeConfig} */
let defaultConfig = new ScopeConfig();

/**
 * Checks if the element is a scope
 * @param {Element|HTMLElement} element
 * @param {ScopeConfig} [config]
 * @returns {null|string} returns scope name or false
 */
export function isScopeElement(element, config) {
    var value = null;

    if (!config) config = defaultConfig;
    let scope_ref_attr_name = config.scope_ref_attr_name || SCOPE_ATTR_NAME;
    let isScopeElementFunc = config.isScopeElement;

    if (isScopeElementFunc) {
        value = isScopeElementFunc(element, config);
    } else {
        value = element.getAttribute(scope_ref_attr_name);
    }

    if (value === null) return null;

    return value;
}

/**
 * Returns a configuration object for the scope.
 *
 * @returns {ScopeConfig} The configuration object.
 * @throws {Error} If 'checkWindow' is true and 'window' is not defined.
 */
export function getDefaultConfig() {
    /** @type {ScopeConfig} */
    return defaultConfig;
}

/**
 * Creates a custom configuration object for DomScope
 * @param {ScopeOptions} options
 * @returns {ScopeConfig}
 */
export function createCustomConfig(options = {}) {
    let config = new ScopeConfig();

    config.includeRoot = options.hasOwnProperty('includeRoot') && typeof options.includeRoot !== 'undefined'
        ? options.includeRoot
        : defaultConfig.includeRoot;
    config.scope_auto_name_prefix = options.hasOwnProperty('scope_auto_name_prefix') && typeof options.scope_auto_name_prefix === 'string'
        ? options.scope_auto_name_prefix
        : defaultConfig.scope_auto_name_prefix;
    config.isScopeElement = options.hasOwnProperty('isScopeElement') && typeof options.isScopeElement !== 'undefined'
        ? options.isScopeElement
        : defaultConfig.isScopeElement;
    config.ref_attr_name = options.hasOwnProperty('ref_attr_name') && typeof options.ref_attr_name === 'string'
        ? options.ref_attr_name
        : defaultConfig.ref_attr_name;
    config.window = options.hasOwnProperty('window') && typeof options.window !== 'undefined' ? options.window : defaultConfig.window;
    config.scope_ref_attr_name = options.hasOwnProperty('scope_ref_attr_name') && typeof options.scope_ref_attr_name === 'string'
        ? options.scope_ref_attr_name
        : defaultConfig.scope_ref_attr_name;

    return config;
}

/**
 * Sets default options for DomScope
 * @param {ScopeOptions} [options]
 */
export function setDefaultConfig(options = {}) {
    if (options.hasOwnProperty('ref_attr_name') && typeof options.ref_attr_name === 'string')
        defaultConfig.ref_attr_name = options.ref_attr_name;
    if (options.hasOwnProperty('window')) defaultConfig.window = options.window;
    if (options.hasOwnProperty('isScopeElement'))
        defaultConfig.isScopeElement = options.isScopeElement || defaultConfig.isScopeElement;
    if (options.hasOwnProperty('includeRoot') && typeof options.includeRoot === 'boolean')
        defaultConfig.includeRoot = options.includeRoot;
    if (options.hasOwnProperty('scope_auto_name_prefix') && typeof options.scope_auto_name_prefix === 'string')
        defaultConfig.scope_auto_name_prefix = options.scope_auto_name_prefix;
    if (options.hasOwnProperty('scope_ref_attr_name') && typeof options.scope_ref_attr_name === 'string')
        defaultConfig.scope_ref_attr_name = options.scope_ref_attr_name;

    return defaultConfig;
}
