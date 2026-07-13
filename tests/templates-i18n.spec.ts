import { expect, test } from "@playwright/test";

test("all nine sector templates and five UI languages are available", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  const language = page.getByLabel("Interface language");
  await expect(language.locator("option")).toHaveCount(5);
  for (const name of ["Classic GCC", "Site", "Service", "Care", "Ledger", "Crew", "Stack", "Move", "Corner"]) await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
});

test("Arabic CV mode mirrors the rendered document", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByLabel("CV document language").selectOption("ar");
  await expect(page.locator("#cv-render")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#cv-render")).toHaveAttribute("lang", "ar");
});
