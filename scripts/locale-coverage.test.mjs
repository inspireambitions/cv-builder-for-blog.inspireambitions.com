import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync("lib/locale-coverage.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const tsModule = { exports: {} };
new Function("module", "exports", "require", compiled)(tsModule, tsModule.exports, require);
const { missingLocaleKeys, availableUILocales, resolveUILocale, formatUITranslation } = tsModule.exports;

const packs = () => ({
  en: { next: "Next", back: "Back" },
  ar: { next: "التالي", back: "رجوع" },
  hi: { next: "अगला", back: "पीछे" },
  ur: { next: "اگلا", back: "واپس" },
  tl: { next: "Susunod", back: "Bumalik" },
});

test("only authored, non-empty keys count towards completeness", () => {
  const inherited = Object.create({ back: "Back" });
  inherited.next = "التالي";
  assert.deepEqual(missingLocaleKeys(packs().en, inherited), ["back"]);
  assert.deepEqual(missingLocaleKeys(packs().en, { next: "   ", back: "رجوع" }), ["next"]);
});
test("an incomplete language cannot appear as fully translated", () => {
  const values = packs();
  delete values.ur.back;
  assert.deepEqual(availableUILocales(values), ["en", "ar", "hi", "tl"]);
});
test("the kill switch trims entries and keeps English recovery", () => {
  assert.deepEqual(availableUILocales(packs(), " UR, ar, en, unknown "), ["en", "hi", "tl"]);
});
test("draft-locale previews still respect the kill switch", () => {
  const values = packs();
  delete values.ur.back;
  assert.deepEqual(availableUILocales(values, "ar", true), ["en", "hi", "ur", "tl"]);
  assert.deepEqual(availableUILocales(values, "ar"), ["en", "hi", "tl"]);
});
test("hidden or invalid saved interface settings resolve without changing CV language", () => {
  const cv = { cvLanguage: "ar", title: "Room Attendant" };
  assert.equal(resolveUILocale("ur", ["en", "ar"]), "en");
  assert.equal(resolveUILocale("ar", ["en", "ar"]), "ar");
  assert.equal(resolveUILocale(null, ["en", "ar"]), "en");
  assert.deepEqual(cv, { cvLanguage: "ar", title: "Room Attendant" });
});
test("RTL progress numbers stay isolated and zero is not lost", () => {
  assert.equal(formatUITranslation("السؤال {current} من {total}", { current: 0, total: 24 }), "السؤال \u20680\u2069 من \u206824\u2069");
  assert.equal(formatUITranslation("{missing}", {}), "{missing}");
  assert.equal(formatUITranslation("Save"), "Save");
  assert.equal(formatUITranslation("Personal details • {page} of {total}", { page: 1, total: 3 }, false), "Personal details • 1 of 3");
});
