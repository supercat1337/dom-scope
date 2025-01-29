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

export type TypeIsScopeElement = (element: Element | HTMLElement, settings: ScopeConfig) => string | null | false;
export type ScopeSettings = {
    ref_attr_name?: string;
    window?: any;
    is_scope_element?: TypeIsScopeElement;
    include_root?: boolean;
};
export type ScopeConfig = {
    ref_attr_name: string;
    window: any;
    is_scope_element: TypeIsScopeElement | undefined;
    include_root: boolean;
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
     * @param {ScopeSettings} [settings]
     */
    constructor(root_element: RootType, settings?: ScopeSettings);
    /** @type {ScopeConfig} */
    config: ScopeConfig;
    /**
     * Returns the root element
     * @type {RootType}
     */
    get root(): RootType;
    /**
     * Returns the object containing html elements with ref attribute
     * @type {Refs<T>}
     * */
    get refs(): Refs<T>;
    /**
     * Returns the object containing children DomScopes
     * @type {{[key:string]:DomScope}}
     * */
    get scopes(): {
        [key: string]: DomScope<any>;
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
 * Returns an object of child elements containing the ref attribute
 * @template {RefsAnnotation} T
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {T|null} [annotation] - An object specifying the expected types for each reference.
 * @param {ScopeSettings} [settings]
 * @returns {Refs<T>}
 */
export function selectRefs<T extends RefsAnnotation>(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, annotation?: T | null, settings?: ScopeSettings): Refs<T>;
/**
 * Returns an object of child elements containing the ref attribute and an object of child elements containing the scope-ref attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {SelectRefsCallback|null} [custom_callback]
 * @param {ScopeSettings} [settings]
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, custom_callback?: SelectRefsCallback | null, settings?: ScopeSettings): {
    refs: {
        [key: string]: HTMLElement;
    };
    scope_refs: {
        [key: string]: HTMLElement;
    };
};
/**
 * Walks the DOM tree of the scope and calls the callback for each element
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} callback
 * @param {ScopeSettings} [settings] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, callback: (currentElement: HTMLElement) => void, settings?: ScopeSettings): void;
