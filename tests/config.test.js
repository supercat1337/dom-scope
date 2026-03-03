// @ts-check

import test from 'ava';
import { createConfig, getDefaults, setDefaults } from '../src/config.js';
import { Window } from 'happy-dom';

test('setDefaults', t => {
    const window = new Window({ url: 'https://localhost:8080' });

    let config = createConfig({ window: window });
    setDefaults({ window: window });
    t.deepEqual(getDefaults(), config);
    setDefaults({ window: undefined });
});
