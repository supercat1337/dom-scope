export type TypeIsScopeElement = (element: HTMLElement, options: TypeAllDomScopeOptions) => string | null | false;
export type TypeDomScopeOptions = {
    ref_attr_name?: string;
    document?: any;
    is_scope_element?: TypeIsScopeElement;
    default_scope_name?: string | (() => string);
};
export type TypeAllDomScopeOptions = {
    ref_attr_name: string;
    document: any;
    is_scope_element?: TypeIsScopeElement;
    default_scope_name?: string | (() => string);
};
export type TypeDomScope = DomScope;
/** @typedef {DomScope} TypeDomScope */
export class DomScope {
    /**
     *
     * @param {HTMLElement|DocumentFragment|ShadowRoot} root_element the root element
     * @param {TypeDomScopeOptions} [options={}]
     */
    constructor(root_element: HTMLElement | DocumentFragment | ShadowRoot, options?: TypeDomScopeOptions);
    /** @type {TypeDomScopeOptions} */
    options: TypeDomScopeOptions;
    /**
     * Get root element
     *
     * @type {HTMLElement|DocumentFragment|ShadowRoot}
     */
    get root(): HTMLElement | ShadowRoot | DocumentFragment;
    /**
     * get the object contains html elements with data-ref attribute
     * @type {{[key:string]:HTMLElement}}
     * */
    get refs(): {
        [key: string]: HTMLElement;
    };
    /**
     * get the object contains children DomScopes
     * @type {{[key:string]:DomScope}}
     * */
    get scopes(): {
        [key: string]: DomScope;
    };
    /**
     * Updates refs and scopes objects
     * @param {(currentElement:HTMLElement)=>void} [callback]
    */
    update(callback?: (currentElement: HTMLElement) => void): void;
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
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    isScopeElement(element: HTMLElement): boolean;
    #private;
}
/**
 * Returns an object of child elements containing the data-ref attribute
 * @param {HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {TypeDomScopeOptions} [options]
 */
export function selectRefs(root_element: HTMLElement | DocumentFragment | ShadowRoot, options?: TypeDomScopeOptions): {
    [key: string]: HTMLElement;
};
/**
 *
 * @param {HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} [custom_callback]
 * @param {TypeDomScopeOptions} [options]
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element: HTMLElement | DocumentFragment | ShadowRoot, custom_callback?: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): {
    refs: {
        [key: string]: HTMLElement;
    };
    scope_refs: {
        [key: string]: HTMLElement;
    };
};
/**
 *
 * @param {HTMLElement|DocumentFragment|ShadowRoot} root_element
 * @param {(currentElement:HTMLElement)=>void} callback
 * @param {TypeDomScopeOptions} [options] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element: HTMLElement | DocumentFragment | ShadowRoot, callback: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): void;
//# sourceMappingURL=dom-scope.esm.d.ts.map