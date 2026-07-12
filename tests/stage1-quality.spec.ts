import { expect, test } from "@playwright/test";

test("theme persists and CV paper remains light", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: /Next Step/ }).click();
  const paperScheme = await page.locator("#cv-render").evaluate((element) => getComputedStyle(element).colorScheme);
  expect(paperScheme).toBe("light");
});

test("mobile Edit Preview Score modes are stable and keyboard named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: /Next Step/ }).click();

  await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("region", { name: "CV preview" })).toBeVisible();
  await page.getByRole("button", { name: "Score", exact: true }).click();
  await expect(page.getByRole("region", { name: "CV score and export" })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByPlaceholder("e.g. Sarah Al-Mansoori")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
