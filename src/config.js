// @ts-check

/**
 * @callback IsScopeChecker
 * @param {Element|HTMLElement} element
 * @param {ScopeConfig} config
 * @returns {string|null}
 */


const DEFAULT_SETTINGS = {
    REF_ATTR: 'data-ref',
    SCOPE_ATTR: 'data-scope',
    AUTO_PREFIX: 'unnamed-scope',
};


class ScopeConfig {
    /** @param {import("./types.js").ScopeOptions} [options] */
    constructor(options = {}) {
        this.refAttribute = options.refAttribute ?? DEFAULT_SETTINGS.REF_ATTR;
        this.scopeAttribute = options.scopeAttribute ?? DEFAULT_SETTINGS.SCOPE_ATTR;
        this.window =
            options.window ?? (typeof globalThis !== 'undefined' ? globalThis.window : undefined);
        this.isScopeElement = options.isScopeElement ?? null;
        this.scopeAutoNamePrefix = options.scopeAutoNamePrefix ?? DEFAULT_SETTINGS.AUTO_PREFIX;
    }
}

/** @type {ScopeConfig} */
let defaultInstance = new ScopeConfig();

/**
 * Checks if the element is a scope and returns its name.
 * @param {Element|HTMLElement} element
 * @param {ScopeConfig} [config]
 * @returns {string|null}
 */
export function isScopeElement(element, config = defaultInstance) {
    if (config.isScopeElement) {
        return config.isScopeElement(element, config);
    }

    const attrs = Array.isArray(config.scopeAttribute)
        ? config.scopeAttribute
        : [config.scopeAttribute];

    for (const attr of attrs) {
        const value = element.getAttribute(attr);
        if (value !== null) return value;
    }

    return null;
}

/**
 * Returns the current default configuration.
 * @returns {ScopeConfig}
 */
export function getDefaults() {
    return defaultInstance;
}

/**
 * Updates global default settings.
 * @param {import("./types.js").ScopeOptions} options
 * @returns {ScopeConfig}
 */
export function setDefaults(options = {}) {
    defaultInstance = new ScopeConfig({ ...defaultInstance, ...options });
    return defaultInstance;
}

/**
 * Ensures we have a valid ScopeConfig instance.
 * @param {import("./types.js").ScopeOptions | ScopeConfig} [options]
 * @returns {ScopeConfig}
 */
export function createConfig(options = {}) {
    if (options instanceof ScopeConfig) return options;
    return new ScopeConfig({ ...defaultInstance, ...options });
}
