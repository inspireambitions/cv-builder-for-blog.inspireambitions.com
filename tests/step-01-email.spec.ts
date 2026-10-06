import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { defaultCVState } from "../lib/types";

for (const locale of ["en", "ar", "ur"] as const) {
  test(`step 1 preserves the download screen in ${locale}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-360", "Required screenshots use 360 px.");
    const state = {
      ...defaultCVState,
      step: 8,
      personal: { ...defaultCVState.personal, name: "Sample Candidate", email: "sample@example.com", title: "Room Attendant" },
      experience: [{ id: "sample", role: "Room Attendant", company: "Sample Hotel", companyDesc: "Hotel", location: "Dubai", dates: "Jan 2023 to Present", description: "Clean guest rooms and report maintenance faults.", gap: "" }],
      skills: ["Room cleaning", "Teamwork"],
    };
    await page.addInitScript(({ state, locale }) => {
      localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 7, savedAt: new Date().toISOString(), state }));
      localStorage.setItem("cv-locale", locale);
    }, { state, locale });
    await page.goto("/");
    await page.getByLabel("Interface language").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const restore = page.getByRole("button", { name: "Continue", exact: true });
    if (await restore.isVisible()) await restore.click();
    await page.getByRole("button", { name: "Download my CV", exact: true }).click();
    await expect(page.getByRole("button", { name: "Download picture, no email" })).toBeEnabled();
    await expect(page.getByText("Pictures download with no email.", { exact: false })).toBeVisible();
    await mkdir("outputs/step-01", { recursive: true });
    await page.screenshot({ path: `outputs/step-01/download-${locale}-360.png`, fullPage: true });
  });
}
