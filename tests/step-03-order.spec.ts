import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { migrateStep } from "../lib/step-layout";
import { buildPlainSummary } from "../lib/plain-summary";
import { sampleServiceCVState } from "../lib/sample-data";
import { defaultCVState } from "../lib/types";
import { webcrypto } from "node:crypto";

test("draft migration preserves every section across old layouts", () => {
  for (const version of [5, 6, 7]) {
    expect(Array.from({ length: 9 }, (_, step) => migrateStep(step, version))).toEqual([0, 1, 5, 2, 3, 4, 6, 7, 8]);
  }
  expect(Array.from({ length: 9 }, (_, step) => migrateStep(step, 4))).toEqual([0, 6, 1, 5, 2, 3, 4, 7, 8]);
  expect(Array.from({ length: 9 }, (_, step) => migrateStep(step, 8))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  for (const bad of [NaN, 1.5, -1, 9, "3", null]) expect(migrateStep(bad, 7)).toBe(0);
});

test("summary uses entered facts without invented years or achievements", () => {
  expect(buildPlainSummary(defaultCVState)).toBe("");
  const summary = buildPlainSummary({ ...defaultCVState, personal: { ...defaultCVState.personal, title: "Room Attendant" }, skills: ["Room cleaning", "Room cleaning", "Linen care"] });
  expect(summary).toBe("Room Attendant. Skills include Room cleaning, Linen care.");
  expect(summary).not.toMatch(/years|certified|increased|\d/);
});

test("entry buttons wait for interactive handlers", async ({ browser, page, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const initial = await context.newPage();
  const response = await initial.goto(baseURL!);
  await expect(initial.getByRole("button", { name: "Build My CV", exact: true })).toBeDisabled();
  expect(await response!.text()).toContain("Turn on JavaScript to build your CV.");
  await context.close();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Build My CV", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Build My CV", exact: true }).click();
  const nameField = (page.viewportSize()?.width ?? 1440) < 640
    ? page.getByPlaceholder("For example, Amina Yusuf")
    : page.getByPlaceholder("e.g. Sarah Al-Mansoori");
  await expect(nameField).toBeVisible();
});

for (const activeStore of [false, true]) {
  test(`saved work history restores and survives refresh (${activeStore ? "draft list" : "single draft"})`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(({ state, activeStore }) => {
      localStorage.clear();
      const draft = { id: "fictional", version: 7, savedAt: new Date().toISOString(), state: { ...state, step: 3, template: "service", templateConfirmed: false } };
      localStorage.setItem("inspireambitions-cv-state", JSON.stringify(draft));
      if (activeStore) {
        localStorage.setItem("inspireambitions-cv-active-draft-id", "fictional");
        localStorage.setItem("inspireambitions-cv-drafts", JSON.stringify({ fictional: draft }));
      }
    }, { state: sampleServiceCVState, activeStore });
    await page.reload();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Work Experience", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).version)).toBe(8);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state.templateConfirmed)).toBe(false);
    await page.reload();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Work Experience", exact: true })).toBeVisible();
  });
}

test("old private continue link restores summary rather than work history", async ({ page }) => {
  const key = webcrypto.getRandomValues(new Uint8Array(32));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const aes = await webcrypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt"]);
  const oldPayload = { version: 1, savedAt: new Date().toISOString(), state: { ...sampleServiceCVState, step: 2, summary: "My saved words." } };
  const encrypted = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, new TextEncoder().encode(JSON.stringify(oldPayload)));
  const fragment = [Buffer.from(encrypted), Buffer.from(iv), Buffer.from(key)].map((bytes) => bytes.toString("base64url")).join(".");
  await page.goto(`/#resume=${fragment}`);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByPlaceholder("Write 2 to 3 lines about your work.")).toHaveValue("My saved words.");
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("");
});

for (const locale of ["en", "ar", "ur"]) {
  test(`profile screen at 360px: ${locale}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-360", "360px evidence only");
    await page.goto("/");
    await page.evaluate(({ state, locale }) => {
      localStorage.clear();
      localStorage.setItem("cv-locale", locale);
      localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state: { ...state, summary: "", step: 5 } }));
    }, { state: sampleServiceCVState, locale });
    await page.reload();
    await page.getByLabel("Interface language").selectOption(locale);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "About you (2 to 3 lines)" })).toBeVisible();
    const summary = page.getByPlaceholder("Write 2 to 3 lines about your work.");
    await expect(summary).not.toHaveValue("");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await mkdir("outputs/step-03", { recursive: true });
    await page.screenshot({ path: `outputs/step-03/profile-${locale}-360.png`, fullPage: true });
    await summary.fill("My own words.");
    await expect(summary).toHaveValue("My own words.");
    await summary.fill("");
    await expect(summary).toHaveValue("");
  });
}
