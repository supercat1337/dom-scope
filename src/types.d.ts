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
export interface IScopeConfig extends Required<Omit<ScopeOptions, 'isScopeElement' | 'window' | 'scopeAttribute'>> {
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