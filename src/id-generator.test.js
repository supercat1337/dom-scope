// @ts-check

import test from "./../node_modules/ava/entrypoints/main.mjs";
import { generateId } from "./id-generator.js";

test("generateId", t => {
    t.is(generateId(), "id_0");
    t.is(generateId("foo"), "foo_0");
    t.is(generateId("foo"), "foo_1");
    t.is(generateId("foo"), "foo_2");
});
