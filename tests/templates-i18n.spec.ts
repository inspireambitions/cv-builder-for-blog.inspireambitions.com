import { expect, test } from "@playwright/test";

async function openDesignStep(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  const mobileNext = page.getByRole("button", { name: "Save and continue" });
  if ((page.viewportSize()?.width ?? 1440) < 640) {
    await expect(mobileNext).toBeVisible();
    for (let index = 0; index < 7; index += 1) await mobileNext.click();
  } else {
    for (let index = 0; index < 5; index += 1) await page.getByRole("button", { name: /Next Step/ }).click();
  }
}

test("all nine sector templates and five UI languages are available", async ({ page }) => {
  await openDesignStep(page);
  const language = page.getByLabel("Interface language");
  await expect(language.locator("option")).toHaveCount(5);
  const showAll = page.getByRole("button", { name: "See all CV designs" });
  if (await showAll.isVisible()) await showAll.click();
  for (const name of ["Classic GCC", "Site", "Service", "Care", "Ledger", "Crew", "Stack", "Move", "Corner"]) await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
});

test("Arabic CV mode mirrors the rendered document", async ({ page }) => {
  await openDesignStep(page);
  await page.getByLabel("CV document language").selectOption("ar");
  await expect(page.locator("#cv-render")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#cv-render")).toHaveAttribute("lang", "ar");
});
