// @ts-check

interface HTMLElementConstructor extends Function {
    name: string;
    prototype: HTMLElement;
}

export type RefsAnnotation = {
    [key: string]: HTMLElement | HTMLElementConstructor;
}

export type Refs<T extends RefsAnnotation = { [key: string]: HTMLElement }> = {
    [P in keyof T]: T[P] extends HTMLElementConstructor ? T[P]["prototype"] : T[P] extends HTMLElement ? T[P] : HTMLElement;
};

export type TypeIsScopeElement = (element: Element | HTMLElement, options: ScopeConfig) => string | null;
export type ScopeOptions = {
    ref_attr_name?: string;
    scope_ref_attr_name?: string;
    window?: any;
    isScopeElement?: TypeIsScopeElement | null;
    includeRoot?: boolean;
    scope_auto_name_prefix?: string;
};
export type SelectRefsCallback = (currentElement: HTMLElement) => void;
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
     * @param {RootType} root_element the root element
     * @param {ScopeOptions} [options]
     */
    constructor(root_element: RootType, options?: ScopeOptions);
    /** @type {ScopeConfig} */
    config: ScopeConfig;
    /**
     * Returns the root element
     * @type {RootType}
     */
    get root(): RootType;
    /**
     * Returns the object containing html elements with data-ref attribute
     * @type {Refs<T>}
     * */
    get refs(): Refs<T>;
    /**
     * Returns the object containing children DomScopes
     * @type {{[key:string]:DomScope<T>}}
     * */
    get scopes(): {
        [key: string]: DomScope<T>;
    };
    /**
     * Updates refs and scopes objects
     * @param {(currentElement:Element|HTMLElement)=>void} [callback]
     */
    update(callback?: (currentElement: Element | HTMLElement) => void): void;
    /**
     * Searches an element with css selector in current DomScope
     * @param {string} query
     * @returns {null|Element}
     */
    querySelector(query: string): null | Element;
    /**
     * Searches elements with css selector in current DomScope
     * @param {string} query
     * @returns {HTMLElement[]}
     */
    querySelectorAll(query: string): HTMLElement[];
    /**
     * Check if current DomScope constains the element
     * @param {Node} element
     * @param {boolean} [check_only_child_scopes=false]
     * @returns {Boolean}
     */
    contains(element: Node, check_only_child_scopes?: boolean): boolean;
    /**
     * Walks through all elements in the scope
     * @param {(currentElement:HTMLElement)=>void} callback
     */
    walk(callback: (currentElement: HTMLElement) => void): void;
    /**
     * Destroys the instance
     */
    destroy(): void;
    /**
     * Checks if element is scope
     * @param {Element|HTMLElement} element
     * @returns {boolean}
     */
    isScopeElement(element: Element | HTMLElement): boolean;
    /**
     * Checks if the instance was destroyed
     * @returns {boolean} true if the instance was destroyed
     */
    get isDestroyed(): boolean;
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
    checkRefs(annotation: RefsAnnotation): void;
    #private;
}
/**
 * Validates that all references in the provided `refs` object match the types specified in the `annotation` object.
 * Throws an error if any reference is missing or does not match the expected type.
 *
 * @param {{[key:string]: HTMLElement}} refs - An object containing references with property names as keys.
 * @param {RefsAnnotation} annotation - An object specifying the expected types for each reference.
 * @throws Will throw an error if a reference is missing or does not match the expected type specified in the annotation.
 */
export function checkRefs(refs: {
    [key: string]: HTMLElement;
}, annotation: RefsAnnotation): void;
/**
 * Converts an HTML string to an DocumentFragment.
 *
 * @param {string} html - The HTML string
 * @param {{window?: *}} [options] - The options object
 * @returns {DocumentFragment} - The DocumentFragment created from the HTML string
 * @throws {Error} - If no element or multiple elements are found in the HTML string
 */
export function createFromHTML(html: string, options?: {
    window?: any;
}): DocumentFragment;
/**
 * Generates a unique id with an optional custom prefix. If a prefix is supplied, the
 * generated id will be of the form `<prefix>_<number>`. If no prefix is supplied, the
 * generated id will be of the form `id_<number>`. The generated id is guaranteed to be
 * unique per prefix.
 * @param {string} [custom_prefix] The custom prefix to use when generating the id.
 * @returns {string} The generated id.
 */
export function generateId(custom_prefix?: string): string;
/**
 * Returns an object of child elements containing the data-ref attribute
 * @template {RefsAnnotation} T
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {T|null} [annotation] - An object specifying the expected types for each reference.
 * @param {ScopeOptions} [options]
 * @returns {Refs<T>}
 */
export function selectRefs<T extends RefsAnnotation>(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, annotation?: T | null, options?: ScopeOptions): Refs<T>;
/**
 * Returns an object of child elements containing the data-ref attribute and an object of child elements containing the data-scope attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {SelectRefsCallback|null} [custom_callback]
 * @param {ScopeOptions} [options]
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, custom_callback?: SelectRefsCallback | null, options?: ScopeOptions): {
    refs: {
        [key: string]: HTMLElement;
    };
    scope_refs: {
        [key: string]: HTMLElement;
    };
};
/**
 * Sets default options for DomScope
 * @param {ScopeOptions} [options]
 */
export function setDefaultConfig(options?: ScopeOptions): ScopeConfig;
/**
 * Walks the DOM tree of the scope and calls the callback for each element
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} callback
 * @param {ScopeOptions} [options] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, callback: (currentElement: HTMLElement) => void, options?: ScopeOptions): void;
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
declare class ScopeConfig {
    /** @type {string} */
    ref_attr_name: string;
    /** @type {string} */
    scope_ref_attr_name: string;
    /** @type {*} */
    window: any;
    /** @type {TypeIsScopeElement|null} */
    isScopeElement: TypeIsScopeElement | null;
    /** @type {boolean} */
    includeRoot: boolean;
    /** @type {string} */
    scope_auto_name_prefix: string;
    toString(): string;
}
export {};
