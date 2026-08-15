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

test("all ten templates and five UI languages are available", async ({ page }) => {
  await openDesignStep(page);
  const language = page.getByLabel("Interface language");
  await expect(language.locator("option")).toHaveCount(5);
  const showAll = page.getByRole("button", { name: "See all CV designs" });
  if (await showAll.isVisible()) await showAll.click();
  for (const name of ["ATS Clean", "Classic GCC", "Site", "Service", "Care", "Ledger", "Crew", "Stack", "Move", "Corner"]) await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
});

test("ATS Clean renders a centred, photo-free, single-column document", async ({ page }) => {
  await openDesignStep(page);
  const showAll = page.getByRole("button", { name: "See all CV designs" });
  if (await showAll.isVisible()) await showAll.click();
  await page.getByRole("button", { name: /ATS Clean/ }).click();
  const previewButton = page.getByRole("button", { name: "Preview CV", exact: true });
  if (await previewButton.isVisible()) await previewButton.click();
  const document = page.locator('#cv-render[data-template="ats-clean"]:visible');
  await expect(document).toBeVisible();
  await expect(document).toHaveAttribute("data-layout", "single-column");
  await expect(document.locator("img")).toHaveCount(0);
  await expect(document.locator("header")).toHaveCSS("text-align", "center");
});

test("Arabic CV mode mirrors the rendered document", async ({ page }) => {
  await openDesignStep(page);
  await page.getByLabel("CV document language").selectOption("ar");
  await expect(page.locator("#cv-render")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#cv-render")).toHaveAttribute("lang", "ar");
});
