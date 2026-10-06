import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCopy, inspectSource } from "./check-plain-language.mjs";

test("glossary, models and question complexity fail", () => {
  for (const text of ["JPEG", "ATS-safe", "Tailor", "Professional Summary", "Resume link", "encrypted", "PREMIUM BETA", "evidence gate", "Claude", "Grok", "Sonnet", "OpenAI", "NOC"]) assert.ok(checkCopy(text).length, text);
  assert.deepEqual(checkCopy("ATS", { allowATS: true }), []);
  assert.ok(checkCopy("JPEG", { allowATS: true }).length);
  assert.ok(checkCopy("Claude", { allowATS: true }).length);
  assert.deepEqual(checkCopy("What work do you do?", { question: true }), []);
  assert.ok(checkCopy("Please comprehensively articulate your organisational responsibilities and strategic transformation accomplishments across multifaceted international enterprises.", { question: true }).length);
});

test("AST distinguishes visible copy from identifiers, comments and translation keys", () => {
  assert.equal(inspectSource('import ATSCleanTemplate from "./ATSCleanTemplate"; // Claude\nconst node = <p>Picture</p>;', "components/Test.tsx").length, 0);
  assert.ok(inspectSource('const node = <p>{"Cl\\u0061ude"}</p>;', "components/Test.tsx").length);
  assert.ok(inspectSource('const node = <input placeholder="JPEG"/>;', "components/Test.tsx").length);
  assert.ok(inspectSource('const node = <p>{`Claude ${name}`}</p>;', "components/Test.tsx").length);
  assert.ok(inspectSource('const label = "Claude"; const node = <p>{label}</p>;', "components/Test.tsx").length);
  assert.equal(inspectSource('const copy = { "download.jpeg": "Picture" };', "lib/i18n.ts").length, 0);
  assert.equal(inspectSource('const node = <p>ATS</p>;', "app/vs/[competitor]/page.tsx").length, 0);
  assert.ok(inspectSource('const node = <p>Claude</p>;', "app/vs/[competitor]/page.tsx").length);
});
