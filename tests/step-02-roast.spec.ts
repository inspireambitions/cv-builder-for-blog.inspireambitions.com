import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { defaultCVState, type CVState } from "../lib/types";
import { sampleServiceCVState } from "../lib/sample-data";
import { getMissingCVItems } from "../lib/score";
import { migrateExperienceDates, experienceDateText } from "../lib/experience-dates";
import { getRoleExamples } from "../lib/role-examples";

async function restore(page: Page, state: CVState, locale = "en") {
  await page.addInitScript(({ state, locale }) => {
    localStorage.clear();
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 7, savedAt: new Date().toISOString(), state }));
    localStorage.setItem("cv-locale", locale);
  }, { state, locale });
  await page.goto("/");
  await page.getByLabel("Interface language").selectOption(locale);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

test("review minimum checks name, contact and a real job", () => {
  expect(getMissingCVItems(defaultCVState)).toHaveLength(3);
  expect(getMissingCVItems(sampleServiceCVState)).toHaveLength(0);
  expect(getMissingCVItems({ ...sampleServiceCVState, experience: [{ ...sampleServiceCVState.experience[0], description: "" }] })).toHaveLength(1);
});

test("old dates migrate without changing exported text or unusual dates", () => {
  const entry = sampleServiceCVState.experience[0];
  expect(migrateExperienceDates(entry)).toMatchObject({ startMonth: "1", startYear: "2023", current: true });
  expect(experienceDateText(migrateExperienceDates(entry))).toBe(entry.dates);
  expect(migrateExperienceDates({ ...entry, dates: "Seasonal work in 2020" }).dates).toBe("Seasonal work in 2020");
});

test("examples follow the candidate's role and stay neutral for unknown roles", () => {
  expect(getRoleExamples("Room Attendant")).toMatchObject({ title: "Room Attendant", company: "5-star hotel, Dubai", skill: "Housekeeping procedures" });
  expect(getRoleExamples("Kitchen Steward").education).toBe("Food safety certificate");
  expect(getRoleExamples("Astronaut").title).toBe("Your job title");
});

test("every missing item opens the correct form", async ({ page }) => {
  for (const item of getMissingCVItems(defaultCVState)) {
    const itemPage = await page.context().newPage();
    await restore(itemPage, { ...defaultCVState, step: 8 });
    await itemPage.getByRole("button", { name: item.label, exact: true }).click();
    await expect.poll(() => itemPage.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state.step)).toBe(item.step);
    await itemPage.close();
  }
});

for (const locale of ["en", "ar", "ur"]) {
  test(`honest review and stable brand in ${locale}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await restore(page, { ...defaultCVState, step: 8 }, locale);
    await expect(page.getByRole("heading", { name: "Almost there: 3 things missing" })).toBeVisible();
    const brand = page.getByTestId("brand");
    await expect(brand).toHaveAttribute("dir", "ltr");
    await expect(brand).toHaveText("InspireAmbitions");
    await expect(page.locator("footer a")).toHaveCount(1);
    await expect(page.locator(".theme-toggle")).not.toBeVisible();
    await expect(page.getByText(/Grok|Sonnet|Premium beta/i)).toHaveCount(0);
    await mkdir("outputs/step-02", { recursive: true });
    await page.screenshot({ path: `outputs/step-02/review-${locale}-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole("button", { name: "Add one job and your duties" }).click();
    await expect(page.getByRole("heading", { name: "Work Experience", exact: true })).toBeVisible();
    await page.screenshot({ path: `outputs/step-02/work-history-${locale}-${testInfo.project.name}.png`, fullPage: true });
  });
}

test("save toast cannot cover primary actions on any mobile step", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (let step = 1; step <= 8; step++) {
    const stepPage = await page.context().newPage();
    await stepPage.setViewportSize({ width: 360, height: 800 });
    await restore(stepPage, { ...sampleServiceCVState, step });
    await stepPage.evaluate(() => window.dispatchEvent(new Event("cv-saved")));
    const toast = stepPage.getByTestId("save-toast");
    expect(await toast.boundingBox()).toBeNull();
    await expect(stepPage.getByText(/\bJPEG\b|\bATS\b|Grok|Sonnet|Anthropic|PREMIUM BETA|URL fragment|encrypted/i)).toHaveCount(0);
    await stepPage.close();
  }
});

test("date controls derive legacy export strings and keep them after refresh", async ({ page }) => {
  await restore(page, { ...sampleServiceCVState, step: 3 });
  await page.getByLabel("Start month", { exact: true }).first().selectOption("2");
  await page.getByLabel("Start year", { exact: true }).first().selectOption("2022");
  await page.getByLabel("I still work here").first().uncheck();
  await page.getByLabel("End month", { exact: true }).first().selectOption("4");
  await page.getByLabel("End year", { exact: true }).first().selectOption("2024");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state.experience[0].dates)).toBe("Feb 2022 to Apr 2024");
  // Remove the seed script by opening a fresh page in the same context.
  const returning = await page.context().newPage();
  await returning.goto("/");
  await returning.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(returning.getByLabel("Start month", { exact: true }).first()).toHaveValue("2");
});

test("homepage has a finished sample CV", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByAltText("Finished fictional room attendant CV in the Service design")).toBeVisible();
});

test("date controls fit narrow phones, tablets and large desktops", async ({ page }) => {
  await restore(page, { ...sampleServiceCVState, step: 3 });
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920, 3840]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByLabel("Start month", { exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("generate the real Service sample image", async ({ page }) => {
  test.skip(!process.env.GENERATE_SAMPLE_ASSET, "One-time static asset generation");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await restore(page, sampleServiceCVState);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#cv-render").filter({ visible: true }).evaluate((element) => {
    const clone = element.cloneNode(true) as HTMLElement;
    document.body.replaceChildren(clone);
    document.documentElement.dataset.theme = "light";
  });
  await mkdir("outputs/step-02", { recursive: true });
  await page.locator("#cv-render").filter({ visible: true }).screenshot({ path: "outputs/step-02/room-attendant.png" });
});
