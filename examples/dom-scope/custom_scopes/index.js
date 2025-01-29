// @ts-check

import { DomScope } from "../../../dist/dom-scope.esm.js";
//import { DomScope } from "dom-scope";

let scope = new DomScope(document.body);

scope.config.is_scope_element = function (element) {
    if (element.tagName == "SLOT") {
        return element.getAttribute("name") || "";
    }

    if (element.hasAttribute("custom-scope-attribute")) {
        return element.getAttribute("custom-scope-attribute");
    }

    return false;
}

if (!scope.scopes["custom_scope_name"]) {
    console.error("custom_scope_name not found");
}

let scopes = scope.scopes;

let scope_1 = scopes["custom_scope_name"];
let scope_2_ref = scope_1.refs["slot2"];


let scope_2 = scope_1.scopes["slot2"];

console.log(scope_2.root == scope_2_ref);



if (!scope_1.scopes["slot2"]) {
    console.error("custom_scope_name.slot2 not found");
}


