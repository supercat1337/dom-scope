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