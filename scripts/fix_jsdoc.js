// @ts-check

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const distDir = path.join(__dirname, "../dist");
const esmFile = path.join(distDir, "dom-scope.esm.js");

const fileContent = fs.readFileSync(esmFile, "utf8");


const fixedContent = fileContent.replaceAll('import("./tools.js").', "");
fs.writeFileSync(esmFile, fixedContent);