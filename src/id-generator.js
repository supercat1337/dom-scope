// @ts-check

/** @type {Map<string, number>} */
let id_map = new Map();

/**
 * Generates a unique id with an optional custom prefix. If a prefix is supplied, the
 * generated id will be of the form `<prefix>_<number>`. If no prefix is supplied, the
 * generated id will be of the form `id_<number>`. The generated id is guaranteed to be
 * unique per prefix.
 * @param {string} [custom_prefix] The custom prefix to use when generating the id.
 * @returns {string} The generated id.
 */
export function generateId(custom_prefix = 'id') {
    let id = 0;

    if (id_map.has(custom_prefix)) {
        let current_id = id_map.get(custom_prefix) || 0;
        id = current_id + 1;
    }

    id_map.set(custom_prefix, id);
    return `${custom_prefix}-${id}`;
}
