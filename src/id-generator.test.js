// @ts-check

import test from 'ava';
import { generateId } from './id-generator.js';
import { getDefaultConfig } from './config.js';

test('generateId', t => {
    let config = getDefaultConfig();

    t.is(generateId(), config.scope_auto_name_prefix + '-0');
    t.is(generateId('foo'), 'foo-0');
    t.is(generateId('foo'), 'foo-1');
    t.is(generateId('foo'), 'foo-2');
});
