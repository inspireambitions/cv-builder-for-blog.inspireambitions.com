import { readFile } from "node:fs/promises";
import ts from "typescript";

const phraseSource = await readFile(new URL("../lib/banned-phrases.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(phraseSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext } });
const { findBannedCVPhrase } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`);
const files = process.argv.slice(2);
if (!files.length) files.push("lib/role-suggestions.ts", "lib/role-families.ts", "lib/role-details.ts", "lib/role-examples.ts", "lib/sample-data.ts");

for (const file of files) {
  const source = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      const phrase = findBannedCVPhrase(node.text);
      if (phrase) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        console.error(`${file}:${line + 1} Contains disallowed CV wording: "${phrase}".`);
        process.exitCode = 1;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
if (!process.exitCode) console.log("CV language check passed.");
