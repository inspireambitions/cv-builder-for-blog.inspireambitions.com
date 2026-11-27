import { expect, test } from "@playwright/test";
import { checkCV } from "../lib/cv-quality";
import { calculateScore } from "../lib/score";
import { finishCV } from "../lib/cv-finish";
import { validatePhone } from "../lib/validators";
import { getRoleSuggestionGroup } from "../lib/role-suggestions";
import { defaultCVState, type CVState } from "../lib/types";

const asOf = new Date("2026-11-27T00:00:00Z");
const draft: CVState = {
  ...defaultCVState, step: 8, geo: "gulf",
  personal: { ...defaultCVState.personal, name: "Fictional Mira Daro", title: "Room Attendant", email: "mira@example.com", location: "Dubai" },
  experience: [{
    ...defaultCVState.experience[0], id: "example-job", role: "Room Attendant",
    company: "Example Cedar Hotel", dates: "Feb 2024 to Present",
    description: getRoleSuggestionGroup("Room Attendant").sentences.slice(0, 3).join("\n"),
  }],
  languages: [],
};

test("checks email-only contact, an untouched library and timelines without changing the draft", () => {
  const saved = structuredClone(draft);
  const withGap = { ...draft, experience: [...draft.experience, {
    ...draft.experience[0], id: "older", dates: "Jan 2020 to Nov 2022",
  }] };
  const finished = finishCV(withGap, asOf).cv;
  const ids = checkCV(finished, asOf).map((item) => item.id);
  expect(ids.slice(0, 3)).toEqual(["phone", "location", "language"]);
  expect(ids).toEqual(expect.arrayContaining(["detail", "library-example-job", "gap-example-job"]));
  expect(checkCV({ ...finished, experience: finished.experience.map((job) => ({ ...job, gap: "Career break" })) }, asOf)
    .some((item) => item.id.startsWith("gap-"))).toBe(false);
  expect(calculateScore(finished).breakdown["Contact Details"]?.score ?? 0).toBeLessThan(8);
  expect(draft).toEqual(saved);
  expect(validatePhone("+971 50 000 0001").valid).toBe(true);
  expect(validatePhone("+971").valid).toBe(false);
  expect(validatePhone("Text +971 50 000 0001").valid).toBe(false);
});

test("gives download advice and takes a candidate with email only to the phone field", async ({ page }) => {
  await page.addInitScript((state) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, state, savedAt: new Date().toISOString() }));
  }, draft);
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Recruiter check:/ })).toBeVisible();
  await page.getByRole("button", { name: "Download my CV" }).click();
  await expect(page.getByText("3 things recruiters look for are missing.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download picture, no email/ })).toBeEnabled();
  await page.getByRole("button", { name: "Close download dialog" }).click();
  await page.getByRole("button", { name: /Fix: Add your phone number/ }).click();
  const phone = page.locator('[data-cv-fix="phone"]:visible');
  await expect(phone).toBeFocused();
  await page.getByRole("combobox", { name: "Country code" }).selectOption("+971");
  await expect(phone).toHaveValue("+971 ");
  await phone.fill("+971 50 000 0001");
  await expect(phone).toHaveValue("+971 50 000 0001");
});
