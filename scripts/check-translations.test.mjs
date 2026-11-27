import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { untranslatedLiterals, loadTS } from "./check-translations.mjs";

test("Talk controls have authored labels in all five languages", () => {
  const { talkControlTranslations: packs } = loadTS("lib/locales/talk-controls.ts");
  for (const locale of ["ar", "hi", "ur", "tl"]) {
    assert.deepEqual(Object.keys(packs[locale]), Object.keys(packs.en));
    for (const key of Object.keys(packs.en)) assert.ok(packs[locale][key]?.trim(), key);
  }
});

test("authored interface packs preserve every declared placeholder", () => {
  const { authoredTranslations } = loadTS("lib/i18n.ts");
  const placeholders = (value) => [...new Set([...value.matchAll(/\{([a-zA-Z]+)\}/g)].map((match) => match[1]))].sort();
  for (const locale of ["ar", "hi", "ur", "tl"]) {
    for (const [key, value] of Object.entries(authoredTranslations.en)) {
      const translated = authoredTranslations[locale][key];
      assert.ok(translated?.trim(), `${locale}: ${key}`);
      assert.deepEqual(placeholders(translated), placeholders(value), `${locale}: ${key}`);
    }
  }
});

test("Talk work-choice labels cover what the state flow offers without changing saved facts", () => {
  const { authoredTranslations } = loadTS("lib/i18n.ts");
  const { getRoleFamilies } = loadTS("lib/role-suggestions.ts");
  const { getTalkTitles, getTalkWorkplaces, getTalkAchievements } = loadTS("lib/talk-flow.ts");
  const { talkWorkChoiceKey } = loadTS("lib/locales/talk-work-choices.ts");
  const found = new Set(getRoleFamilies().flatMap(({ key }) =>
    [...getTalkTitles(key), ...getTalkWorkplaces(key), ...getTalkAchievements(key)]));
  assert.ok(found.size >= 80);
  for (const english of found) {
    const key = talkWorkChoiceKey(english);
    assert.ok(key, english);
    assert.equal(authoredTranslations.en[key], english);
    for (const locale of ["ar", "hi", "ur", "tl"]) assert.ok(authoredTranslations[locale][key]?.trim(), key);
  }
  assert.equal(talkWorkChoiceKey("Example Cedar Hotel"), undefined);
});

test("Talk duty choices preserve English output and offer Arabic output separately", () => {
  const { getTalkDutyOptions } = loadTS("lib/talk-sentence-options.ts");
  const { getRoleFamilies, getTalkSentences } = loadTS("lib/role-suggestions.ts");
  for (const family of getRoleFamilies()) {
    const english = getTalkDutyOptions(family.key, "en");
    const arabic = getTalkDutyOptions(family.key, "ar");
    assert.deepEqual(english.map((item) => item.value), getTalkSentences(family.key));
    for (const item of arabic) {
      assert.equal(english.find((entry) => entry.key === item.key)?.canonical, item.canonical);
      assert.ok(item.value?.trim(), item.key);
      assert.notEqual(item.value, item.canonical);
    }
    assert.deepEqual(getTalkDutyOptions(family.key, "ur"), english);
  }
  assert.ok(getTalkDutyOptions("housekeeping", "ar").length > 0);
  assert.ok(getTalkDutyOptions("reservations", "ar").length > 0);
});

test("detects visible text, labels, errors and interpolated English", () => {
  const issues = untranslatedLiterals(`<><p>Save my CV</p><input placeholder="Your name"/><button aria-label="Close">{ready ? "Ready" : "Wait"}</button><p>{\`Question \${count} of three\`}</p>{setError("Choose a month")}</>`, "example.tsx");
  assert.equal(issues.length, 7);
  assert.ok(issues.every((item) => item.line === 1));
});
test("ignores translation keys, class names, saved enum values and candidate text", () => {
  assert.deepEqual(untranslatedLiterals(`const value = "Employment"; const x = <p className="text-start" dir="ltr">{t("talk.next")}{candidate.answer}</p>;`, "example.tsx"), []);
});
test("conditional layout and canonical input values are not visible labels", () => {
  const source = `<input dir={arabic ? "rtl" : "ltr"} className={active ? "bg-white" : "text-red"} value={current ? "Employment" : "Visit"} aria-label={active ? "Remove" : "Add"}/>`;
  assert.deepEqual(untranslatedLiterals(source, "example.tsx").map((issue) => issue.text), ["Remove", "Add"]);
});
test("conditional predicates are not copy but their displayed branches are", () => {
  const source = '<>{status === "pending" && "Save your changes"}{mode === "live" ? title : `Question ${number} of three`}</>';
  assert.deepEqual(untranslatedLiterals(source, "example.tsx").map((issue) => issue.text), ["Save your changes", "Question of three"]);
});
test("does not mistake a non-Latin keyless label for translated coverage", () => {
  // Locale completeness remains a separate mandatory check.
  assert.deepEqual(untranslatedLiterals(`<p>{t("talk.next")}</p>`, "example.tsx"), []);
});
test("all 24 question headings have authored translations in each language", () => {
  const { talkQuestionTranslations } = loadTS("lib/locales/talk-questions.ts");
  const questions = Object.keys(talkQuestionTranslations.en).filter((key) => key.startsWith("talk.question."));
  assert.equal(questions.length, 24);
  for (const locale of ["ar", "hi", "ur", "tl"]) {
    assert.deepEqual(Object.keys(talkQuestionTranslations[locale]).sort(), Object.keys(talkQuestionTranslations.en).sort());
    for (const key of questions) {
      assert.ok(talkQuestionTranslations[locale][key].trim());
      assert.notEqual(talkQuestionTranslations[locale][key], talkQuestionTranslations.en[key]);
    }
    assert.ok(talkQuestionTranslations[locale]["talk.progress"].includes("{current}"));
    assert.ok(talkQuestionTranslations[locale]["talk.progress"].includes("{total}"));
  }
});
test("translated form screens and their date/suggestion controls have no English literals", () => {
  for (const filename of ["components/steps/StepSummary.tsx", "components/steps/StepEducation.tsx"]) {
    assert.deepEqual(untranslatedLiterals(fs.readFileSync(filename, "utf8"), filename), []);
  }
});
test("all authored form control packs cover their English source keys", () => {
  for (const filename of ["lib/locales/form.ts", "lib/locales/skill-examples.ts", "lib/locales/experience.ts"]) {
    const packs = Object.values(loadTS(filename))[0];
    for (const locale of ["ar", "hi", "ur", "tl"]) {
      assert.deepEqual(Object.keys(packs[locale]), Object.keys(packs.en));
      for (const value of Object.values(packs[locale])) assert.ok(value.trim());
    }
  }
});
test("a sentence translation cannot be borrowed from an older sentence at the same index", () => {
  const { roleLibraryTranslations, newRoleSentenceTranslations } = loadTS("lib/locales/role-library.ts");
  const { translatedRoleSentenceSources } = loadTS("lib/locales/role-sentence-source.ts");
  const { getRoleFamilies } = loadTS("lib/role-suggestions.ts");
  const { getRoleExamplesForFamily } = loadTS("lib/role-examples.ts");
  for (const family of getRoleFamilies()) {
    assert.equal(roleLibraryTranslations.en[`role.label.${family.key}`], family.label);
    const title = roleLibraryTranslations.en[`example.title.${family.key}`];
    assert.equal(title, getRoleExamplesForFamily(family.key).title);
    assert.equal(roleLibraryTranslations.en[`example.company.${family.key}`], getRoleExamplesForFamily(family.key).company);
    for (let index = 0; index < family.sentences.length; index++) {
      const key = `role.sentence.${family.key}.${index}`;
      assert.equal(roleLibraryTranslations.en[key], family.sentences[index]);
      const sourceMatches = (translatedRoleSentenceSources[family.key] ?? []).includes(family.sentences[index]) ||
        Boolean(newRoleSentenceTranslations[family.key]?.some(([source]) => source === family.sentences[index]));
      for (const locale of ["ar", "hi", "ur", "tl"]) assert.equal(Boolean(roleLibraryTranslations[locale][key]?.trim()), sourceMatches, key);
    }
  }
  assert.equal(roleLibraryTranslations.en["example.title.construction"], "Site Worker");
  assert.equal(roleLibraryTranslations.en["example.company.construction"], "Building contractor");
  assert.notEqual(roleLibraryTranslations.ar["role.sentence.housekeeping.0"], undefined);
});

test("new role translation rows bind to unique current source material", () => {
  const { newRoleSentenceTranslations } = loadTS("lib/locales/role-library.ts");
  const { getRoleFamilies } = loadTS("lib/role-suggestions.ts");
  for (const [family, rows] of Object.entries(newRoleSentenceTranslations)) {
    const source = getRoleFamilies().find((role) => role.key === family)?.sentences;
    assert.ok(source, family);
    const seen = new Set();
    for (const [english, ...translated] of rows) {
      assert.ok(source.includes(english), `${family}: ${english}`);
      assert.ok(!seen.has(english), `${family}: duplicate source ${english}`);
      seen.add(english);
      assert.equal(translated.length, 4);
      assert.ok(translated.every((value) => value.trim() && value !== english));
    }
  }
});
test("localised date controls preserve canonical month values and saved CV dates", () => {
  const { experienceTranslations } = loadTS("lib/locales/experience.ts");
  const { MONTHS, experienceDateText } = loadTS("lib/experience-dates.ts");
  MONTHS.forEach((month, index) => assert.equal(experienceTranslations.en[`month.${index + 1}`], month));
  assert.equal(experienceDateText({ startMonth: "1", startYear: "2023", current: true }), "Jan 2023 to Present");
  const source = fs.readFileSync("components/shared/ExperienceDates.tsx", "utf8");
  assert.match(source, /value=\{String\(index \+ 1\)\}/);
});
test("translated skill examples retain their canonical English hints", () => {
  const { skillExampleTranslations } = loadTS("lib/locales/skill-examples.ts");
  assert.equal(skillExampleTranslations.en["example.skill.housekeeping"], "Housekeeping procedures");
  assert.equal(skillExampleTranslations.tl["example.skill.kitchen-steward"], "Paglilinis ng kusina");
});
test("localising the profile screen does not bring back free-form summary output", () => {
  const source = fs.readFileSync("components/steps/StepSummary.tsx", "utf8");
  assert.match(source, /const \{ cv \} = finishCV\(state\)/);
  assert.match(source, /lang=\{cv\.cvLanguage\}/);
  assert.doesNotMatch(source, /summaryStarters/);
});
