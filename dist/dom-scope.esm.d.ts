export type TypeIsScopeElement = (element: Element | HTMLElement, options: TypeAllDomScopeOptions) => string | null | false;
export type TypeDomScopeOptions = {
    ref_attr_name?: string;
    window?: any;
    is_scope_element?: TypeIsScopeElement;
    default_scope_name?: string | (() => string);
    include_root?: boolean;
};
export type TypeAllDomScopeOptions = {
    ref_attr_name: string;
    window: any;
    is_scope_element?: TypeIsScopeElement;
    default_scope_name?: string | (() => string);
    include_root: boolean;
};
export type RootType = Element | HTMLElement | DocumentFragment | ShadowRoot;
export type HTMLElementInterface = {
    name: string;
    prototype: HTMLElement;
};
/**
 * @template {{[key:string]:HTMLElement}} T
 */
export class DomScope<T extends {
    [key: string]: HTMLElement;
}> {
    /**
     * Creates an instance of DomScope.
     * @param {RootType} root_element the root element
     * @param {TypeDomScopeOptions} [options]
     */
    constructor(root_element: RootType, options?: TypeDomScopeOptions);
    /** @type {TypeAllDomScopeOptions} */
    options: TypeAllDomScopeOptions;
    /**
     * Returns the root element
     * @type {RootType}
     */
    get root(): RootType;
    /**
     * Returns the object containing html elements with ref attribute
     * @type {T}
     * */
    get refs(): T;
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
     * @param {{[key:string]: HTMLElementInterface|HTMLElement}} annotation Object with property names as keys and function constructors as values
     * @example
     * const scope = new DomScope(my_element);
     * scope.check({
     *     my_button: HTMLButtonElement,
     *     my_input: HTMLInputElement
     * });
     */
    checkRefs(annotation: {
        [key: string]: HTMLElementInterface | HTMLElement;
    }): void;
    #private;
}
/**
 * Returns an object of child elements containing the ref attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {TypeDomScopeOptions} [options]
 */
export function selectRefs(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, options?: TypeDomScopeOptions): {
    [key: string]: HTMLElement;
};
/**
 * Returns an object of child elements containing the ref attribute and an object of child elements containing the scope-ref attribute
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} [custom_callback]
 * @param {TypeDomScopeOptions} [options]
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, custom_callback?: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): {
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
 * @param {TypeDomScopeOptions} [options] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, callback: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): void;
//# sourceMappingURL=dom-scope.esm.d.ts.map