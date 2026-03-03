// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const distDir = path.join(__dirname, '../dist');

const typeFile = path.join(distDir, 'types.d.ts');
const typeFileContent = fs.readFileSync(typeFile, 'utf8');

const esmTypeFile = path.join(distDir, 'dom-scope.esm.d.ts');
const esmTypeFileContent = fs.readFileSync(esmTypeFile, 'utf8');

const esmFile = path.join(distDir, 'dom-scope.esm.js');
const esmFileContent = fs.readFileSync(esmFile, 'utf8');

const fixedEsmFileContent = esmFileContent.replace(
    /import\(['"].\/types\.[^'"]+"\)\./g,
    'import("./dom-scope.esm.d.ts").'
);

fs.writeFileSync(esmFile, fixedEsmFileContent);

let typesFileFixedContent = typeFileContent + '\n\n' + esmTypeFileContent;

typesFileFixedContent = typesFileFixedContent.replaceAll('import("./types.js").', '');

fs.writeFileSync(esmTypeFile, typesFileFixedContent);

fs.unlinkSync(typeFile);
