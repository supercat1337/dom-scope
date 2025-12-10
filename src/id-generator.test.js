// @ts-check

import test from 'ava';
import { generateId } from './id-generator.js';

test('generateId', t => {
    t.is(generateId('foo'), 'foo-0');
    t.is(generateId('foo'), 'foo-1');
    t.is(generateId('foo'), 'foo-2');
});
