// @ts-check

import { createCustomConfig } from './config.js';

/**
 * Converts an HTML string to an DocumentFragment.
 *
 * @param {string} html - The HTML string
 * @param {{window?: *}} [options] - The options object
 * @returns {DocumentFragment} - The DocumentFragment created from the HTML string
 * @throws {Error} - If no element or multiple elements are found in the HTML string
 */
export function createFromHTML(html, options) {
    if (typeof html !== 'string') {
        throw new Error('html must be a string');
    }

    const config = createCustomConfig(options);

    if (!config.window) {
        throw new Error('window is not defined in options');
    }

    let wnd = config.window;

    const doc = /** @type {Document} */ (wnd.document);
    
    const template = doc.createElement('template');
    template.innerHTML = html;
    return template.content;
}
