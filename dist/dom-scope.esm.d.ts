export type TypeIsScopeElement = (element: Element | HTMLElement, options: TypeAllDomScopeOptions) => string | null | false;
export type TypeDomScopeOptions = {
    ref_attr_name?: string;
    document?: any;
    is_scope_element?: TypeIsScopeElement;
    default_scope_name?: string | (() => string);
    include_root?: boolean;
};
export type TypeAllDomScopeOptions = {
    ref_attr_name: string;
    document: any;
    is_scope_element?: TypeIsScopeElement;
    default_scope_name?: string | (() => string);
    include_root: boolean;
};
/**
 * @template {{[key:string]:HTMLElement}} T
 */
export class DomScope<T extends {
    [key: string]: HTMLElement;
}> {
    /**
     *
     * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element the root element
     * @param {TypeDomScopeOptions} [options={}]
     */
    constructor(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, options?: TypeDomScopeOptions);
    /** @type {TypeDomScopeOptions} */
    options: TypeDomScopeOptions;
    /**
     * Get root element
     *
     * @type {Element|HTMLElement|DocumentFragment|ShadowRoot}
     */
    get root(): Element | HTMLElement | DocumentFragment | ShadowRoot;
    /**
     * get the object contains html elements with ref attribute
     * @type {T}
     * */
    get refs(): T;
    /**
     * get the object contains children DomScopes
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
 *
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
 *
 * @param {Element|HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} callback
 * @param {TypeDomScopeOptions} [options] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element: Element | HTMLElement | DocumentFragment | ShadowRoot, callback: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): void;
//# sourceMappingURL=dom-scope.esm.d.ts.map