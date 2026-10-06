import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const banned = /\b(?:JPEG|ATS(?:-safe)?|tailor(?:ing)?|Professional Summary|Resume link|URL fragment|encrypted|premium beta|evidence gate)\b/i;
const vendors = /\b(?:Anthropic|Claude|OpenAI|ChatGPT|GPT(?:-\d[\w.-]*)?|Grok|Sonnet|Opus|Gemini)\b/i;
const visibleProperties = /^(label|title|description|desc|placeholder|text|message|error|starter|question|heading|tip|reason|summary)$/;
const visibleAttributes = /^(title|alt|placeholder|aria-label)$/;

export function readingGrade(text) {
  const words = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const syllables = words.reduce((sum, word) => {
    const stem = word.replace(/(?:es|ed|e)$/, "");
    return sum + Math.max(1, (stem.match(/[aeiouy]+/g) ?? []).length);
  }, 0);
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  return words.length ? 0.39 * words.length / sentences + 11.8 * syllables / words.length - 15.59 : 0;
}

export function checkCopy(text, { allowATS = false, question = false } = {}) {
  const issues = [];
  const glossaryText = allowATS ? text.replace(/\bATS(?:-safe)?\b/gi, "") : text;
  if (banned.test(glossaryText)) issues.push("banned glossary term");
  if (vendors.test(text)) issues.push("AI vendor or model name");
  if (/\bNOC\b/.test(text) && !/letter from your sponsor allowing you to change job \(NOC\)/i.test(text)) issues.push("explain NOC in plain words");
  if (question) {
    if ((text.match(/\S+/g) ?? []).length > 12) issues.push("question exceeds 12 words");
    if (readingGrade(text) > 6) issues.push("question exceeds reading grade 6");
  }
  return issues;
}

export function inspectSource(source, filename) {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, filename.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const issues = [];
  const bindings = new Map();
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isStringLiteralLike(node.initializer)) bindings.set(node.name.text, node.initializer.text);
    ts.forEachChild(node, collect);
  }
  collect(ast);
  const legal = filename === "lib/comparison-data.ts" || /^app\/(?:vs\/|privacy(?:\/|$)|privacy-policy(?:\/|$)|terms(?:\/|$)|legal(?:\/|$))/.test(filename);
  function inspect(node, text, question = false) {
    const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
    for (const issue of checkCopy(text.replace(/\s+/g, " ").trim(), { allowATS: legal, question })) issues.push(`${filename}:${line}: ${issue}: ${text.trim()}`);
  }
  function visit(node) {
    if (ts.isJsxText(node)) inspect(node, node.text);
    if (ts.isIdentifier(node) && bindings.has(node.text) && ts.isJsxExpression(node.parent)) inspect(node, bindings.get(node.text));
    if (ts.isTemplateExpression(node)) {
      const parent = node.parent;
      const property = ts.isPropertyAssignment(parent) ? parent.name.getText(ast).replace(/["']/g, "") : "";
      if (ts.isJsxExpression(parent) || visibleProperties.test(property)) {
        inspect(node, [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(" "), property === "question" && /talk/i.test(filename));
      }
    }
    if (ts.isStringLiteralLike(node)) {
      const parent = node.parent;
      if (ts.isPropertyAssignment(parent) && parent.name === node) return;
      const property = ts.isPropertyAssignment(parent) ? parent.name.getText(ast).replace(/["']/g, "") : "";
      const attr = ts.isJsxAttribute(parent) ? parent.name.getText(ast) : "";
      const jsxExpression = ts.isJsxExpression(parent) || (ts.isConditionalExpression(parent) && ts.isJsxExpression(parent.parent));
      const message = ts.isCallExpression(parent) && /(?:setError|alert|confirm)$/.test(parent.expression.getText(ast));
      if (visibleProperties.test(property) || visibleAttributes.test(attr) || jsxExpression || message) {
        inspect(node, node.text, property === "question" && /talk/i.test(filename));
      }
      // Translation keys are not prose. Their values are.
      if (filename === "lib/i18n.ts" && ts.isPropertyAssignment(parent) && !visibleProperties.test(property)) inspect(node, node.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return issues;
}

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(file);
    return /\.tsx?$/.test(file) ? [file] : [];
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  // Server prompts and SDK descriptions are not UI copy.
  const uiLibraries = ["lib/i18n.ts", "lib/constants.ts", "lib/comparison-data.ts", "lib/gulf-match.ts", "lib/score.ts", "lib/role-suggestions.ts", "lib/role-examples.ts", "lib/template-recommendation.ts", "lib/plain-summary.ts"];
  const targets = [...files("components"), ...files("app").filter((file) => !file.replaceAll("\\", "/").startsWith("app/api/")), ...uiLibraries, ...files("lib").filter((file) => /talk/i.test(file))];
  const issues = targets.flatMap((file) => inspectSource(fs.readFileSync(file, "utf8"), file.replaceAll("\\", "/")));
  if (issues.length) {
    console.error(issues.join("\n"));
    process.exitCode = 1;
  } else console.log("Plain-language guard passed. Talk Mode questions will be checked when added.");
}
