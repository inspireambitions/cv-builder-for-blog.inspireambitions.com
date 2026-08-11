import { expect, test } from "@playwright/test";
import { appendExperienceSentence, getRoleSuggestionGroup } from "../lib/role-suggestions";

test("role matching returns relevant plain-language suggestions", () => {
  expect(getRoleSuggestionGroup("Kitchen Steward").key).toBe("kitchen-steward");
  expect(getRoleSuggestionGroup("HR Intern").key).toBe("hr");
  expect(getRoleSuggestionGroup("Room Attendant").key).toBe("housekeeping");
  expect(getRoleSuggestionGroup("Unlisted Role").key).toBe("general");
});

test("a suggestion is added once without inventing a bullet marker", () => {
  const sentence = "Handled cleaning chemicals and equipment in line with safety instructions.";
  expect(appendExperienceSentence("", sentence)).toBe(sentence);
  expect(appendExperienceSentence(sentence, sentence)).toBe(sentence);
});

test("mobile candidates can add and edit role wording", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByLabel("Target job").fill("Cruise Ship Kitchen Steward");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByLabel("Job Title").fill("Kitchen Steward");
  await expect(page.getByText("Suggested wording for Kitchen steward")).toBeVisible();
  const suggestion = "Operated industrial dishwashers and washed cookware, utensils, glassware and serving dishes.";
  await page.getByRole("button", { name: new RegExp(suggestion) }).click();
  await expect(page.getByLabel("What did you do or achieve?")).toHaveValue(suggestion);
  await expect(page.getByText("Added. Edit the sentence if you need to.")).toBeVisible();

  await page.getByLabel("What did you do or achieve?").fill(`${suggestion}\nSupported a safe closing shift.`);
  await expect(page.getByLabel("What did you do or achieve?")).toHaveValue(`${suggestion}\nSupported a safe closing shift.`);
  await expect(page.getByRole("button", { name: "Show 2 more suggestions" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
