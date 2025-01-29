// @ts-check

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const distDir = path.join(__dirname, "../dist");

const typeFile = path.join(distDir, "types.d.ts");
const typeFileContent = fs.readFileSync(typeFile, "utf8");

const esmTypeFile = path.join(distDir, "dom-scope.esm.d.ts");
const esmTypeFileContent = fs.readFileSync(esmTypeFile, "utf8");

let typesFileFixedContent = typeFileContent + "\n\n" + esmTypeFileContent.split("\n").slice(5).join("\n");
fs.writeFileSync(esmTypeFile, typesFileFixedContent);

const esmFile = path.join(distDir, "dom-scope.esm.js");
const esmFileContent = fs.readFileSync(esmFile, "utf8");

const fixedEsmFileContent = esmFileContent
    .replaceAll('import("./types.d.ts").', 'import("./dom-scope.esm.d.ts").');

fs.writeFileSync(esmFile, fixedEsmFileContent);

fs.unlinkSync(typeFile);