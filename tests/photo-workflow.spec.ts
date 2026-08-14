import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { defaultCVState, type CVState } from "../lib/types";

test("photo choice, crop, checks, reuse and removal work on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();

  await expect(page.getByRole("button", { name: "Use a photo-free CV" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/multinational employers/)).toBeVisible();
  await page.getByRole("button", { name: "Include a photo" }).click();

  const lowResolutionPhoto = await sharp({
    create: { width: 320, height: 480, channels: 3, background: { r: 156, g: 118, b: 92 } },
  }).jpeg({ quality: 92 }).toBuffer();
  await page.getByLabel("Choose professional photo file").setInputFiles({
    name: "candidate-headshot.jpg",
    mimeType: "image/jpeg",
    buffer: lowResolutionPhoto,
  });

  await expect(page.getByLabel("Photo crop preview")).toBeVisible();
  await expect(page.getByLabel("Photo quality checks")).toContainText("Resolution");
  await expect(page.getByText(/at least 600 pixels/)).toBeVisible();
  await page.getByLabel("Move left or right").fill("58");
  await page.getByLabel("Move up or down").fill("35");
  await page.getByLabel("Zoom").fill("1.4");
  await page.getByRole("button", { name: "Save crop" }).click();

  await expect(page.getByAltText("Current professional photo")).toBeVisible();
  const photo = page.locator("#cv-render header img");
  await expect(photo).toHaveCount(1);
  await expect(photo).toHaveCSS("width", "78px");
  expect(await page.locator("#cv-render header").evaluate((header) => header.lastElementChild?.tagName)).toBe("IMG");

  await page.getByRole("button", { name: "Use a photo-free CV" }).click();
  await expect(photo).toHaveCount(0);
  await page.getByRole("button", { name: "Include a photo" }).click();
  await expect(photo).toHaveCount(1);
  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.getByRole("button", { name: "Use a photo-free CV" })).toHaveAttribute("aria-pressed", "true");
});

test("mobile candidates can reach the same photo controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("button", { name: "Include a photo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use a photo-free CV" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test("Service places a larger selected photo at the upper right", async ({ page }) => {
  const state: CVState = {
    ...structuredClone(defaultCVState),
    step: 1,
    template: "service",
    templateConfirmed: true,
    photoPreference: "photo",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPxB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPxB//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxB//9k=",
    personal: { ...defaultCVState.personal, name: "Amina Yusuf", title: "Front Office Supervisor" },
  };
  await page.addInitScript((draftState) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 7, savedAt: new Date().toISOString(), state: draftState }));
  }, state);
  await page.goto("/");
  await page.getByRole("button", { name: "Continue" }).click();
  const photo = page.locator("#cv-render header img");
  await expect(photo).toHaveCSS("width", "104px");
  expect(await page.locator("#cv-render header").evaluate((header) => header.lastElementChild?.tagName)).toBe("IMG");
});
