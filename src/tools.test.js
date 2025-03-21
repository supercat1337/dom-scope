// @ts-check

import test from "ava";
import { getConfig, setDomScopeOptions, useDataAttributes } from "./tools.js";
import { Window } from "happy-dom";

test("setDomScopeOptions", (t) => {
    const window = new Window({ url: "https://localhost:8080" });
    const document = window.document;

    let config = getConfig({ window: window });
    setDomScopeOptions({ window: window });
    t.deepEqual(getConfig(), config);
    setDomScopeOptions({ window: undefined });
});

test("useDataAttributes", (t) => {
    let config = getConfig({}, false);
    useDataAttributes();
    let config2 = getConfig({}, false);

    t.true("data-" + config.ref_attr_name == config2.ref_attr_name);
    t.true("data-" + config.scope_ref_attr_name == config2.scope_ref_attr_name);
    useDataAttributes(false);
    config2 = getConfig({}, false);
    t.true(config.ref_attr_name == config2.ref_attr_name);
    t.true(config.scope_ref_attr_name == config2.scope_ref_attr_name);
});
