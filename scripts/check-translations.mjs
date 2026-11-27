import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
export function loadTS(file) {
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const tsModule = { exports: {} };
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadTS(path.resolve(path.dirname(file), `${specifier}.ts`)) : require(specifier);
  new Function("module", "exports", "require", compiled)(tsModule, tsModule.exports, localRequire);
  return tsModule.exports;
}

const visibleAttributes = new Set(["placeholder", "title", "alt", "aria-label"]);

export function untranslatedLiterals(source, filename) {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result = [];
  function report(node, text) {
    const prose = text.replace(/&(?:times|nbsp|hellip|ndash|mdash|#\d+|#x[\da-f]+);/gi, "");
    if (!/[A-Za-z]/.test(prose)) return;
    result.push({ file: filename, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
      text: text.replace(/\s+/g, " ").trim() });
  }
  function displayedExpression(node) {
    let value = node;
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (ts.isConditionalExpression(parent)) {
        if (parent.condition === value) return false;
      } else if (ts.isBinaryExpression(parent)) {
        const operator = parent.operatorToken.kind;
        if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
          if (parent.left === value) return false;
        } else if (operator !== ts.SyntaxKind.BarBarToken && operator !== ts.SyntaxKind.QuestionQuestionToken) {
          return false;
        }
      } else if (ts.isJsxExpression(parent)) {
        const attribute = ts.isJsxAttribute(parent.parent) ? parent.parent : undefined;
        return !attribute || visibleAttributes.has(attribute.name.getText(ast));
      } else if (!ts.isParenthesizedExpression(parent)) {
        return false;
      }
      value = parent;
    }
    return false;
  }
  // Literal data values (saved job titles, enums and user data) are not UI copy.
  // Once they appear in JSX, their display label needs a translation key.
  function visit(node) {
    if (ts.isJsxText(node) && node.text.trim()) report(node, node.text);
    if (ts.isJsxAttribute(node) && visibleAttributes.has(node.name.getText(ast)) && node.initializer && ts.isStringLiteral(node.initializer)) {
      report(node.initializer, node.initializer.text);
    }
    if (ts.isStringLiteralLike(node)) {
      if (displayedExpression(node)) report(node, node.text);
      if (ts.isCallExpression(node.parent) && /^(setError|alert|confirm)$/.test(node.parent.expression.getText(ast))) report(node, node.text);
    }
    if (ts.isTemplateExpression(node) && displayedExpression(node)) {
      report(node, [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(" "));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return result;
}

function sourceFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}

export function translationReport() {
  const { authoredTranslations } = loadTS("lib/i18n.ts");
  const { missingLocaleKeys } = loadTS("lib/locale-coverage.ts");
  const locales = Object.fromEntries(["ar", "hi", "ur", "tl"].map((locale) => {
    const missing = missingLocaleKeys(authoredTranslations.en, authoredTranslations[locale]);
    return [locale, { authored: Object.keys(authoredTranslations.en).length - missing.length, missing }];
  }));
  const files = ["components/CVBuilder.tsx", ...["components/steps", "components/modals", "components/tailoring", "components/talk", "components/shared"]
    .flatMap(sourceFiles)];
  const literals = files.flatMap((file) => untranslatedLiterals(fs.readFileSync(file, "utf8"), file.replaceAll(path.sep, "/")));
  return { sourceKeys: Object.keys(authoredTranslations.en).length, locales, literals };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const report = translationReport();
  console.log(JSON.stringify(report, null, 2));
  if (!process.argv.includes("--audit") && (report.literals.length || Object.values(report.locales).some((locale) => locale.missing.length))) process.exitCode = 1;
}
