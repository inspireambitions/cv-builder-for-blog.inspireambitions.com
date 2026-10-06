import { expect, test } from "@playwright/test";

test("usage consent can be withdrawn below the fixed mobile actions", async ({ page }) => {
  await page.goto("/");
  const preference = page.getByRole("checkbox", { name: "Help improve this free tool" });
  await expect(preference).toBeVisible();
  await expect(preference).not.toBeChecked();
  await preference.check();
  await page.getByRole("button", { name: "Build My CV", exact: true }).click();
  await expect(page.getByPlaceholder((page.viewportSize()?.width ?? 1440) < 640 ? "For example, Amina Yusuf" : "e.g. Sarah Al-Mansoori")).toBeVisible();
  await preference.uncheck();
  await expect(preference).not.toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem("ia-usage-consent"))).toBe("no");
  await page.reload();
  await expect(preference).not.toBeChecked();
});
