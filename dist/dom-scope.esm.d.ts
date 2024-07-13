export type TypeDomScopeOptions = {
    scope_attr_name?: string;
    ref_attr_name?: string;
    document?: any;
};
export type TypeAllDomScopeOptions = {
    scope_attr_name: string;
    ref_attr_name: string;
    document: any;
};
export type TypeDomScope = DomScope;
/** @typedef {DomScope} TypeDomScope */
export class DomScope {
    /**
     *
     * @param {HTMLElement} root_element the root element
     */
    constructor(root_element: HTMLElement);
    /** @type {TypeDomScopeOptions} */
    options: TypeDomScopeOptions;
    /**
     * Get root element
     *
     * @type {HTMLElement}
     */
    get root(): HTMLElement;
    /**
     * get the object contains html elements with ref attribute
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
    #private;
}
/**
 * Returns an object of child elements containing the ref attribute
 * @param {HTMLElement} root_element
 * @param {TypeDomScopeOptions} [options]
 */
export function selectRefs(root_element: HTMLElement, options?: TypeDomScopeOptions): {
    [key: string]: HTMLElement;
};
/**
 *
 * @param {HTMLElement} root_element
 * @param {(currentElement:HTMLElement)=>void} [custom_callback]
 * @param {TypeDomScopeOptions} [options]
 * @returns { {refs: {[key:string]:HTMLElement}, scope_refs: {[key:string]:HTMLElement} } }
 */
export function selectRefsExtended(root_element: HTMLElement, custom_callback?: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): {
    refs: {
        [key: string]: HTMLElement;
    };
    scope_refs: {
        [key: string]: HTMLElement;
    };
};
/**
 *
 * @param {HTMLElement} root_element
 * @param {(currentElement:HTMLElement)=>void} callback
 * @param {TypeDomScopeOptions} [options] the attribute name contains a name of a scope
 */
export function walkDomScope(root_element: HTMLElement, callback: (currentElement: HTMLElement) => void, options?: TypeDomScopeOptions): void;
//# sourceMappingURL=dom-scope.esm.d.ts.map