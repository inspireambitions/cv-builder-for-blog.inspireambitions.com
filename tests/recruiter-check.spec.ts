import { expect, test } from "@playwright/test";
import { checkCV } from "../lib/cv-quality";
import { calculateScore } from "../lib/score";
import { finishCV } from "../lib/cv-finish";
import { validatePhone } from "../lib/validators";
import { getRoleSuggestionGroup } from "../lib/role-suggestions";
import { defaultCVState, type CVState } from "../lib/types";
import { defaultTalkProgress } from "../lib/talk-flow";
import { translations } from "../lib/i18n";
import { availableLanguages } from "../lib/ui-languages";
import { mkdir } from "node:fs/promises";

const asOf = new Date("2026-11-27T00:00:00Z");
const draft: CVState = {
  ...defaultCVState, step: 8, geo: "gulf",
  personal: { ...defaultCVState.personal, name: "Fictional Mira Daro", title: "Room Attendant", email: "mira@example.com", location: "Dubai" },
  experience: [{
    ...defaultCVState.experience[0], id: "example-job", role: "Room Attendant",
    company: "Example Cedar Hotel", dates: "Feb 2024 to Present",
    description: getRoleSuggestionGroup("Room Attendant").sentences.slice(0, 3).join("\n"),
  }],
  languages: [],
};

test("asks for city and country on the first pass without making them mandatory", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV|Fill in the full form/i }).click();
  const city = page.getByRole("textbox", { name: "City", exact: true });
  const country = page.getByRole("textbox", { name: "Country", exact: true });
  await expect(city).toBeVisible();
  await expect(country).toBeVisible();
  await expect(city).toHaveAttribute("autocomplete", "address-level2");
  await expect(country).toHaveAttribute("autocomplete", "country-name");
  await expect(city).not.toHaveAttribute("required");
  await expect(country).not.toHaveAttribute("required");
  await country.fill("UAE");
  await city.fill("Sharjah");
  await expect(country).toHaveValue("UAE");
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem("inspireambitions-cv-state") ?? "{}").state?.personal?.location,
  )).toEqual("Sharjah, UAE");
});

for (const locale of ["en", "ar", "hi", "ur", "tl"] as const) {
  test(`first-pass address and contact work at 360px in ${locale}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-360" || !availableLanguages.includes(locale), "360 px locale preview.");
    await page.goto("/");
    await page.getByRole("button", { name: /Build My CV|Fill in the full form/i }).click();
    await page.locator("#ui-language").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const strings = translations[locale];
    const city = page.getByRole("textbox", { name: strings["contact.city"], exact: true });
    const country = page.getByRole("textbox", { name: strings["contact.country"], exact: true });
    await city.fill(strings["contact.cityExample"]);
    await country.fill(strings["contact.countryExample"]);
    await expect(city).toHaveValue(strings["contact.cityExample"]);
    await expect(country).toHaveValue(strings["contact.countryExample"]);
    await expect(page.getByRole("textbox", { name: strings["contact.phoneNumber"] })).toHaveAttribute("dir", "ltr");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await country.evaluate((field) => field.scrollIntoView({ block: "center" }));
    await mkdir("outputs/step-05/contact", { recursive: true });
    await page.screenshot({ path: `outputs/step-05/contact/${locale}-360.png` });
  });
}

test("checks email-only contact, an untouched library and timelines without changing the draft", () => {
  const saved = structuredClone(draft);
  const withGap = { ...draft, experience: [...draft.experience, {
    ...draft.experience[0], id: "older", dates: "Jan 2020 to Nov 2022",
  }] };
  const finished = finishCV(withGap, asOf).cv;
  const ids = checkCV(finished, asOf).map((item) => item.id);
  expect(ids.slice(0, 3)).toEqual(["phone", "location", "language"]);
  expect(ids).toEqual(expect.arrayContaining(["detail", "library-example-job", "gap-example-job"]));
  expect(checkCV({ ...finished, experience: finished.experience.map((job) => ({ ...job, gap: "Career break" })) }, asOf)
    .some((item) => item.id.startsWith("gap-"))).toBe(false);
  expect(calculateScore(finished).breakdown["Contact Details"]?.score ?? 0).toBeLessThan(8);
  expect(draft).toEqual(saved);
  expect(validatePhone("+971 50 000 0001").valid).toBe(true);
  expect(validatePhone("+971").valid).toBe(false);
  expect(validatePhone("Text +971 50 000 0001").valid).toBe(false);
});

test("gives download advice and takes a candidate with email only to the phone field", async ({ page }) => {
  await page.addInitScript((state) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, state, savedAt: new Date().toISOString() }));
  }, draft);
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Recruiter check:/ })).toBeVisible();
  await page.getByRole("button", { name: "Download my CV" }).click();
  await expect(page.getByText("3 things recruiters look for are missing.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download picture, no email/ })).toBeEnabled();
  await page.getByRole("button", { name: "Close download dialog" }).click();
  await page.getByRole("button", { name: /Fix: Add your phone number/ }).click();
  const phone = page.locator('[data-cv-fix="phone"]:visible');
  await expect(phone).toBeFocused();
  await page.getByRole("combobox", { name: "Country code" }).selectOption("+971");
  await expect(phone).toHaveValue("+971 ");
  await phone.fill("+971 50 000 0001");
  await expect(phone).toHaveValue("+971 50 000 0001");
  await page.getByRole("button", { name: "Save and return to Recruiter Check" }).click();
  await expect(page.getByRole("heading", { name: /^Recruiter check:/ })).toBeFocused();
  await expect(page.getByRole("button", { name: /Fix: Add your phone number/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Fix: Add your city and country." }).click();
  const country = page.getByRole("textbox", { name: "Country", exact: true });
  await expect(country).toBeFocused();
  await country.fill("UAE");
  await page.getByRole("button", { name: "Save and return to Recruiter Check" }).click();
  await expect(page.getByRole("heading", { name: /^Recruiter check:/ })).toBeFocused();
  await expect(page.getByRole("button", { name: "Fix: Add your city and country." })).toHaveCount(0);
});

test("Talk Mode returns directly to Recruiter Check after editing contact details", async ({ page }) => {
  test.skip(process.env.NEXT_PUBLIC_TALK_MODE !== "true", "Talk Mode is off in this build.");
  const state: CVState = { ...draft, builderMode: "talk", talk: { ...defaultTalkProgress, questionId: "done" } };
  await page.addInitScript((state) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, state, savedAt: new Date().toISOString() }));
  }, state);
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Add your city and country." }).click();
  await page.getByRole("textbox", { name: "Country", exact: true }).fill("UAE");
  await page.getByRole("button", { name: "Save and return to Recruiter Check" }).click();
  await expect(page.getByRole("heading", { name: "Would you like to download your CV?" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Add your city and country." })).toHaveCount(0);
});

test("does not invent gaps from nested work or exactly six months off", () => {
  const makeJob = (id: string, dates: string) => ({ ...draft.experience[0], id, dates });
  const timeline = [
    makeJob("first", "Jun 2015 to Jan 2024"),
    makeJob("overlap", "Mar 2017 to Feb 2018"),
    makeJob("next", "Aug 2024 to Present"),
  ];
  const gapIds = () => checkCV(finishCV({ ...draft, experience: timeline }, asOf).cv, asOf)
    .filter((issue) => issue.id.startsWith("gap-")).map((issue) => issue.id);
  expect(gapIds()).toEqual([]);
  timeline[2].dates = "Sep 2024 to Present";
  expect(gapIds()).toEqual(["gap-next"]);
  timeline[1].dates = "2017 to 2018";
  expect(gapIds()).toEqual([]);
});
