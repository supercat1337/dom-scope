// @ts-check

import test from 'ava';
import { createCustomConfig, getDefaultConfig, setDefaultConfig } from './config.js';
import { Window } from 'happy-dom';

test('setDefaultConfig', t => {
    const window = new Window({ url: 'https://localhost:8080' });
    const document = window.document;

    let config = createCustomConfig({ window: window });
    setDefaultConfig({ window: window });
    t.deepEqual(getDefaultConfig(), config);
    setDefaultConfig({ window: undefined });
});
