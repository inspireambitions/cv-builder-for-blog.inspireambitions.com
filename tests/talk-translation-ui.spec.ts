import { expect, test } from "@playwright/test";
import { getTalkTranslationExamples } from "../lib/talk-translation-evidence";
import { defaultTalkProgress } from "../lib/talk-flow";
import { defaultCVState, type CVState } from "../lib/types";

const roleId = "fictional-housekeeping";

for (const [index, language] of (["ar", "hi", "ur", "tl"] as const).entries()) {
test(`Talk Mode keeps unsupported text and asks before replacing a supported line: ${language}`, async ({ page }, testInfo) => {
  test.skip(process.env.NEXT_PUBLIC_TALK_MODE !== "true", "Talk Mode is off in this build.");
  await page.setExtraHTTPHeaders({ "x-real-ip": `192.0.2.${(testInfo.project.name === "mobile-360" ? 101 : 111) + index}` });
  const [original, second] = getTalkTranslationExamples("housekeeping", language);
  const state: CVState = {
    ...defaultCVState, builderMode: "talk", step: 1, cvLanguage: "en",
    experience: [{ ...defaultCVState.experience[0], id: roleId, role: "Room Attendant", description: original + "\n" + second }],
    talk: { ...defaultTalkProgress, questionId: roleId + "-duties", families: { [roleId]: "housekeeping" } },
  };
  await page.addInitScript(state => {
    localStorage.setItem("cv-locale", "en");
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ state, version: 8, savedAt: new Date().toISOString() }));
  }, state);
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("combobox", { name: "Language of these answers" }).selectOption(language);
  const text = page.getByRole("textbox", { name: "Say it in my words" });
  const unsupported = original + "\n" + second + "\nI managed 99 hotels.";
  await text.fill(unsupported);
  await page.getByRole("button", { name: "Show English wording" }).click();
  await expect(page.locator(".talk-mode").getByRole("alert")).toHaveText("We could not check these lines in English. Your words are still saved.");
  await expect(text).toHaveValue(unsupported);
  await expect(page.getByRole("button", { name: "Replace with English" })).toHaveCount(0);
  await text.fill(state.experience[0].description);
  await page.getByRole("button", { name: "Show English wording" }).click();
  const replace = page.getByRole("button", { name: "Replace with English" });
  await expect(replace).toHaveCount(2);
  await expect(page.locator(`p[lang="${language}"]`).getByText(original, { exact: true })).toBeVisible();
  await expect(text).toHaveValue(state.experience[0].description);
  await replace.first().click();
  await expect(text).toHaveValue("Cleaned guest rooms.\n" + second);
  await expect(replace).toHaveCount(1);
  await text.fill("Cleaned guest rooms.\n" + second + " Other claim.");
  await expect(replace).toHaveCount(0);
});
}
