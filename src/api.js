// @ts-check

import { createConfig, isScopeElement } from './config.js';

/**
 * Enhanced selectRefsExtended to support multiple roots.
 * @param {import("./types.js").ScopeRoots} roots
 * @param {((el: HTMLElement) => void) | null} [customCallback]
 * @param {import("./types.js").ScopeOptions} [options]
 * @returns {import("./types.js").ExtendedResult}
 */
export function selectRefsExtended(roots, customCallback = null, options = {}) {
    const config = createConfig(options);
    /** @type {{ [x: string]: HTMLElement; }} */
    const refs = {};
    /** @type {{ [x: string]: HTMLElement; }} */
    const scopeRefs = {};
    /** @type {HTMLElement[]} */
    const unnamedScopes = [];
    const rootList = Array.isArray(roots) ? roots : [roots];

    const callback = (/** @type {HTMLElement} */ currentNode) => {
        // 1. Refs collection
        const refName = currentNode.getAttribute(config.refAttribute);
        if (refName) {
            if (!refs[refName]) {
                refs[refName] = currentNode;
            } else {
                console.warn(`[Scope] Duplicate ref #${refName} found during multi-root scan.`);
            }
        }

        // 2. Scopes collection
        // An element is a sub-scope only if it's NOT one of our roots
        if (!rootList.includes(/** @type {HTMLElement} */ (currentNode))) {
            const scopeName = isScopeElement(currentNode, config);
            if (typeof scopeName === 'string') {
                if (scopeName !== '' && !scopeRefs[scopeName]) {
                    scopeRefs[scopeName] = currentNode;
                } else {
                    unnamedScopes.push(currentNode);
                }
            }
        }

        if (customCallback) customCallback(currentNode);
    };

    walkDomScope(roots, callback, config);

    // 3. Auto-naming unnamed scopes
    let index = 0;
    const prefix = config.scopeAutoNamePrefix;
    for (const unnamedEl of unnamedScopes) {
        while (scopeRefs[prefix + index]) index++;
        scopeRefs[prefix + index] = unnamedEl;
    }

    return { refs, scopeRefs };
}

/**
 * Selects elements marked with ref attributes within the roots.
 * * @template {import("./types.js").RefsAnnotation} T
 * @param {import("./types.js").ScopeRoots} roots
 * @param {T|null} [annotation] - The schema to validate and type the refs
 * @param {import("./types.js").ScopeOptions} [options]
 * @returns {import("./types.js").Refs<T>}
 */
export function selectRefs(roots, annotation = null, options = {}) {
    const config = createConfig(options);
    /** @type {{ [x: string]: HTMLElement; }} */
    const refs = {};

    const callback = (/** @type {HTMLElement} */ currentNode) => {
        const refName = currentNode.getAttribute(config.refAttribute);
        if (refName) refs[refName] = currentNode;
    };

    // Note: refs.root in a multi-root scenario might be ambiguous,
    // but we'll follow the same logic for all elements in the array.
    walkDomScope(roots, callback, config);

    if (annotation) checkRefs(refs, annotation);
    return /** @type {import("./types.js").Refs<T>} */ (refs);
}

/**
 * Walks one or multiple DOM trees, skipping nested scopes.
 * @param {import("./types.js").ScopeRoots} roots - Single root or array of roots.
 * @param {(el: HTMLElement) => void} callback
 * @param {import("./types.js").ScopeOptions | import("./types.js").IScopeConfig} [options]
 */
export function walkDomScope(roots, callback, options) {
    const config = createConfig(options);
    const win = config.window;

    // Normalize roots to an array
    const rootList = Array.isArray(roots) ? roots : [roots];

    for (const root of rootList) {
        /** @param {Node} node */
        const filter = node => {
            const el = /** @type {HTMLElement} */ (node);
            // If the node is one of our roots, we always accept it
            if (rootList.includes(el)) return win.NodeFilter.FILTER_ACCEPT;

            const parent = el.parentElement;
            // Check if we are inside a nested scope within the current root
            if (parent && !rootList.includes(parent) && isScopeElement(parent, config) !== null) {
                return win.NodeFilter.FILTER_REJECT;
            }
            return win.NodeFilter.FILTER_ACCEPT;
        };

        const walker = win.document.createTreeWalker(root, win.NodeFilter.SHOW_ELEMENT, {
            acceptNode: filter,
        });

        let currentNode;
        while ((currentNode = /** @type {HTMLElement} */ (walker.nextNode()))) {
            callback(currentNode);
        }
    }
}

/**
 * Validates that all references match the types specified in the annotation.
 * @param {Object.<string, HTMLElement>} refs
 * @param {import("./types.js").RefsAnnotation} annotation
 * @throws {Error} If validation fails.
 */
export function checkRefs(refs, annotation) {
    for (const [prop, expectedType] of Object.entries(annotation)) {
        const ref = refs[prop];

        if (!ref) {
            throw new Error(`[Scope] Missing required data-ref: "${prop}"`);
        }

        const targetProto =
            typeof expectedType === 'function' ? expectedType.prototype : expectedType;

        if (!targetProto.isPrototypeOf(ref)) {
            const actualName = ref.constructor?.name || 'Unknown';
            const expectedName = targetProto.constructor?.name || 'ExpectedType';

            throw new Error(
                `[Scope] Type mismatch for "${prop}": expected ${expectedName}, got ${actualName}`
            );
        }
    }
}
