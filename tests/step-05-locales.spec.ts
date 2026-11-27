import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { sampleServiceCVState } from "../lib/sample-data";
import { translations } from "../lib/i18n";
import { defaultTalkProgress } from "../lib/talk-flow";
import { finishCV } from "../lib/cv-finish";
import { availableLanguages } from "../lib/ui-languages";

const talkFlag = process.env.NEXT_PUBLIC_TALK_MODE === "true";

test("the language switcher offers only enabled interface locales", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: talkFlag ? /Fill in the full form/ : /Build My CV/ }).click();
  const options = page.locator("#ui-language option");
  await expect(options).toHaveCount(availableLanguages.length);
  expect(await options.evaluateAll(nodes => nodes.map(node => (node as HTMLOptionElement).value))).toEqual(availableLanguages);
});

for (const locale of ["en", "ar", "ur"] as const) {
  test(`changing interface to ${locale} keeps the English CV intact`, async ({ page }, testInfo) => {
    test.skip(!availableLanguages.includes(locale), "Incomplete packs are available only in translation QA.");
    const state = {
      ...sampleServiceCVState,
      builderMode: "full" as const,
      cvLanguage: "en" as const,
      step: 5,
      summary: "Fictional notes for this draft.",
    };
    const expectedProfile = finishCV(state).cv.summary;
    expect(expectedProfile).not.toContain(state.summary);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(state => {
      if (sessionStorage.getItem("cv-locale-test-seeded")) return;
      sessionStorage.setItem("cv-locale-test-seeded", "1");
      localStorage.setItem("cv-locale", "en");
      localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state }));
    }, state);
    await page.goto("/");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const language = page.locator("#ui-language");
    await language.selectOption(locale);
    await expect(page.getByTestId("summary-step").getByRole("heading", { name: translations[locale]["summary.title"] })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
    const profile = page.getByTestId("built-profile");
    await expect(profile).toHaveAttribute("lang", "en");
    await expect(profile).toHaveAttribute("dir", "ltr");
    await expect(profile).toHaveText(expectedProfile);
    await expect(page.locator("#cv-profile-notes")).toHaveValue(state.summary);
    if (testInfo.project.name === "mobile-360") {
      expect(await page.locator("html").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await mkdir(`outputs/step-05/${locale}`, { recursive: true });
      await page.screenshot({ path: `outputs/step-05/${locale}/full-form-profile-360.png`, fullPage: true });
    }
    await page.reload();
    await expect(language).toHaveValue(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    expect(errors).toEqual([]);
  });

  test(`Talk Mode restores a saved profile from an older draft in ${locale}`, async ({ page }, testInfo) => {
    test.skip(!talkFlag || !availableLanguages.includes(locale), "Talk and supported locale are required.");
    const state = {
      ...sampleServiceCVState,
      builderMode: "talk" as const,
      cvLanguage: "en" as const,
      step: 1,
      talk: { ...defaultTalkProgress, questionId: "summary", summarySuggestion: "Never put this old text on the CV." },
    };
    const expectedProfile = finishCV(state).cv.summary;
    await page.addInitScript(({ state, locale }) => {
      localStorage.setItem("cv-locale", locale);
      localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state }));
    }, { state, locale });
    await page.goto("/");
    await page.getByRole("button", { name: translations[locale]["talk.continue"], exact: true }).click();
    await expect(page.getByRole("heading", { name: translations[locale]["talk.question.summary"] })).toBeVisible();
    const profile = page.getByText(expectedProfile, { exact: true });
    await expect(profile).toHaveAttribute("lang", "en");
    await expect(profile).toHaveAttribute("dir", "ltr");
    await expect(profile).toHaveText(expectedProfile);
    if (testInfo.project.name === "mobile-360") {
      expect(await page.locator("html").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await mkdir(`outputs/step-05/${locale}`, { recursive: true });
      await page.screenshot({ path: `outputs/step-05/${locale}/talk-profile-360.png`, fullPage: true });
    }
    await page.getByRole("button", { name: translations[locale]["talk.saveContinue"] }).click();
    await expect(page.getByRole("heading", { name: translations[locale]["talk.question.design"] })).toBeVisible();
  });
}
