// @ts-check
/** * Represents a constructor for HTML elements (e.g., HTMLButtonElement).
 */
interface HTMLElementConstructor extends Function {
    name: string;
    prototype: HTMLElement;
}

/** * A validation schema for mapping reference names to their expected types.
 */
export type RefsAnnotation = {
    [key: string]: HTMLElement | HTMLElementConstructor;
}

/** * Infers the instance type from the annotation.
 * If an HTMLElementConstructor is provided, it returns the instance (prototype).
 * Otherwise, it defaults to HTMLElement.
 */
export type Refs<T extends RefsAnnotation = { [key: string]: HTMLElement }> = {
    [P in keyof T]: T[P] extends HTMLElementConstructor ? T[P]["prototype"] : T[P] extends HTMLElement ? T[P] : HTMLElement;
};

/** * Valid root types for DOM traversal.
 */
export type ScopeRoot = Element | HTMLElement | DocumentFragment | ShadowRoot;
export type ScopeRoots = ScopeRoot | ScopeRoot[];

/** * Configuration options for DOM scope behavior.
 */
export interface ScopeOptions {
    /** Attribute name for references (default: 'data-ref') */
    refAttribute?: string;
    /** Attribute(s) defining sub-scopes (default: 'data-scope') */
    scopeAttribute?: string | string[];
    /** Global window object for environment isolation */
    window?: any;
    /** * Custom logic to determine if an element is a scope.
     * Added | null to match implementation defaults.
     */
    isScopeElement?: ((element: Element | HTMLElement, config: any) => string | null) | null;
    /** Prefix for automatically named scopes (default: 'unnamed-scope') */
    scopeAutoNamePrefix?: string;
}

/** * Internal configuration object used by the API.
 */
export interface ScopeConfig extends Required<Omit<ScopeOptions, 'isScopeElement' | 'window' | 'scopeAttribute'>> {
    /** Global window object - always present in the processed config */
    window: any;
    /** Attribute(s) for scopes - normalized to string or array */
    scopeAttribute: string | string[];
    /** * Custom logic - strictly Type or null. 
     * We explicitly remove 'undefined' here.
     */
    isScopeElement: ((element: Element | HTMLElement, config: any) => string | null) | null;
}

/** * Resulting structure for extended reference selection.
 */
export interface ExtendedResult {
    refs: Record<string, HTMLElement>;
    scopeRefs: Record<string, HTMLElement>;
}

export type IsScopeChecker = (element: Element | HTMLElement, config: ScopeConfig) => string | null;
export type RootType = Element | HTMLElement | DocumentFragment | ShadowRoot;
/**
 * @typedef {Element|HTMLElement|DocumentFragment|ShadowRoot} RootType
 */
/**
 * @template {RefsAnnotation} T
 */
export class DomScope<T extends RefsAnnotation> {
    /**
     * Creates an instance of DomScope.
     * @param {RootType} rootElement - The root element for this scope.
     * @param {ScopeOptions} [options]
     */
    constructor(rootElement: RootType, options?: ScopeOptions);
    /** @type {ScopeConfig} */
    config: ScopeConfig;
    /** @returns {RootType} */
    get root(): RootType;
    /** @returns {Refs<T>} */
    get refs(): Refs<T>;
    /** @returns {Object.<string, DomScope<any>>} */
    get scopes(): {
        [x: string]: DomScope<any>;
    };
    /**
     * Updates refs and child scopes by re-scanning the DOM.
     * @param {((el: HTMLElement) => void)} [callback]
     */
    update(callback?: ((el: HTMLElement) => void)): void;
    /**
     * Finds the first element matching the selector within the current scope only.
     * @param {string} query
     * @returns {HTMLElement|null}
     */
    querySelector(query: string): HTMLElement | null;
    /**
     * Finds all elements matching the selector that belong to the current scope.
     * @param {string} query
     * @returns {HTMLElement[]}
     */
    querySelectorAll(query: string): HTMLElement[];
    /**
     * Checks if an element belongs to this scope (not nested in child scopes).
     * @param {Node} element
     * @param {boolean} [checkOnlyChildScopes=false]
     * @returns {boolean}
     */
    contains(element: Node, checkOnlyChildScopes?: boolean): boolean;
    /**
     * Walks through all elements belonging to this scope.
     * @param {(el: HTMLElement) => void} callback
     */
    walk(callback: (el: HTMLElement) => void): void;
    /**
     * Cleans up the instance and breaks references to DOM elements.
     */
    destroy(): void;
    /** @returns {boolean} */
    get isDestroyed(): boolean;
    /**
     * Helper to check if an element is a scope according to current config.
     * @param {Element|HTMLElement} element
     * @returns {boolean}
     */
    isScopeElement(element: Element | HTMLElement): boolean;
    /**
     * Validates refs against an annotation.
     * @param {RefsAnnotation} annotation
     */
    checkRefs(annotation: RefsAnnotation): void;
    #private;
}
/**
 * Validates that all references match the types specified in the annotation.
 * @param {Object.<string, HTMLElement>} refs
 * @param {RefsAnnotation} annotation
 * @throws {Error} If validation fails.
 */
export function checkRefs(refs: {
    [x: string]: HTMLElement;
}, annotation: RefsAnnotation): void;
/**
 * Selects elements marked with ref attributes within the roots.
 * * @template {RefsAnnotation} T
 * @param {ScopeRoots} roots
 * @param {T|null} [annotation] - The schema to validate and type the refs
 * @param {ScopeOptions} [options]
 * @returns {Refs<T>}
 */
export function selectRefs<T extends RefsAnnotation>(roots: ScopeRoots, annotation?: T | null, options?: ScopeOptions): Refs<T>;
/**
 * Enhanced selectRefsExtended to support multiple roots.
 * @param {ScopeRoots} roots
 * @param {((el: HTMLElement) => void) | null} [customCallback]
 * @param {ScopeOptions} [options]
 * @returns {ExtendedResult}
 */
export function selectRefsExtended(roots: ScopeRoots, customCallback?: ((el: HTMLElement) => void) | null, options?: ScopeOptions): ExtendedResult;
/**
 * Updates global default settings.
 * @param {ScopeOptions} options
 * @returns {ScopeConfig}
 */
export function setDefaults(options?: ScopeOptions): ScopeConfig;
/**
 * Walks one or multiple DOM trees, skipping nested scopes.
 * @param {ScopeRoots} roots - Single root or array of roots.
 * @param {(el: HTMLElement) => void} callback
 * @param {ScopeOptions | ScopeConfig} [options]
 */
export function walkDomScope(roots: ScopeRoots, callback: (el: HTMLElement) => void, options?: ScopeOptions | ScopeConfig): void;
declare class ScopeConfig {
    /** @param {ScopeOptions} [options] */
    constructor(options?: ScopeOptions);
    refAttribute: string;
    scopeAttribute: string | string[];
    window: any;
    isScopeElement: (element: Element | HTMLElement, config: any) => string | null;
    scopeAutoNamePrefix: string;
}
export {};
