import { expect, test } from "@playwright/test";

test("theme persists and CV paper remains light", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  const paperScheme = await page.locator("#cv-render").evaluate((element) => getComputedStyle(element).colorScheme);
  expect(paperScheme).toBe("light");
});

test("mobile preview returns safely to the guided form", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();

  await page.getByRole("button", { name: "Preview CV", exact: true }).click();
  await expect(page.getByRole("region", { name: "CV preview" })).toBeVisible();
  await page.getByRole("button", { name: "Back to editing", exact: true }).click();
  await expect(page.getByPlaceholder("For example, Amina Yusuf")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test("guided mobile details use three short pages and save progress", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();

  await expect(page.getByText("Personal details • 1 of 3")).toBeVisible();
  await expect(page.getByPlaceholder("For example, Amina Yusuf")).toBeVisible();
  await expect(page.getByText("See your CV preview")).toBeVisible();
  await page.getByPlaceholder("For example, Amina Yusuf").fill("Amina Yusuf");
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page.getByText("Personal details • 2 of 3")).toBeVisible();
  await expect(page.getByPlaceholder("For example, Executive Housekeeper")).toBeVisible();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page.getByText("Personal details • 3 of 3")).toBeVisible();
  await expect(page.getByText("Are you applying in the Gulf?")).toBeVisible();
  await expect(page.getByText("Saved on this device")).toBeVisible();
});
