import { expect, test } from "@playwright/test";
import { mkdir, stat } from "node:fs/promises";
import { defaultCVState, type CVState } from "../lib/types";

function completeState(template: CVState["template"] = "service"): CVState {
  return {
    ...structuredClone(defaultCVState),
    step: 8,
    template,
    templateConfirmed: true,
    personal: {
      ...defaultCVState.personal,
      name: "Andrew Kakooza",
      title: "Cruise Ship Kitchen Steward",
      email: "andrew@example.com",
      phone: "+971 52 000 0000",
      location: "Dubai, UAE",
    },
    summary: "Kitchen steward with hotel experience in Dubai and Kampala.",
    experience: [{
      id: "exp-1",
      role: "Kitchen Steward",
      company: "Example Hotel",
      companyDesc: "Large hospitality employer",
      location: "Dubai, UAE",
      dates: "2023 to Present",
      description: "Clean kitchen areas\nOperate industrial dishwashers",
      gap: "Relocated between roles",
    }],
    education: [{ id: "edu-1", degree: "Catering Certificate", institution: "YMCA", year: "2020", grade: "" }],
    certifications: [{ id: "cert-1", name: "Chemical Handling Certificate", issuer: "Diversey", date: "", expiry: "" }],
    skills: ["Kitchen sanitation", "Industrial dishwashing"],
    languages: [{ id: "lang-1", language: "English", level: "" }],
    achievements: [{ id: "ach-1", title: "Service Award", body: "Recognised for reliable service", awardingBody: "Example Hotel", year: "2024" }],
    volunteer: [{ id: "vol-1", role: "Volunteer Cleaner", org: "Community Centre", dates: "2022", impact: "Supported weekly cleaning" }],
    projects: [{ id: "proj-1", name: "Kitchen Close Checklist", description: "Created a closing checklist", url: "", outcomes: "Improved handovers" }],
    publications: [{ id: "pub-1", title: "Food Hygiene Talk", outlet: "Team briefing", date: "2024", url: "" }],
    memberships: [{ id: "mem-1", org: "Hospitality Association", level: "Member", year: "2024" }],
  };
}

async function seedDraft(page: import("@playwright/test").Page, state: CVState) {
  await page.addInitScript((draftState) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({
      version: 6,
      savedAt: new Date().toISOString(),
      state: draftState,
    }));
  }, state);
}

test("cruise steward receives and keeps the Service template on immediate continuation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByLabel("Target job").fill("Cruise Ship Kitchen Steward");
  await page.getByRole("button", { name: "Save and continue" }).click();
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Save and continue" }).click();
  }

  const service = page.getByRole("button", { name: /Recommended for your target job Service/ });
  await expect(service).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Preview CV" }).click();
  await expect(page.getByLabel("CV preview")).toContainText("HOSPITALITY & SERVICE");
});

test("sector templates preserve every entered evidence section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedDraft(page, completeState("corner"));
  await page.goto("/");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Preview CV" }).click();
  const preview = page.getByLabel("CV preview");

  for (const text of [
    "Chemical Handling Certificate",
    "Diversey",
    "Kitchen sanitation",
    "English",
    "Service Award",
    "Volunteer Cleaner",
    "Kitchen Close Checklist",
    "Food Hygiene Talk",
    "Hospitality Association",
    "Large hospitality employer",
    "Relocated between roles",
  ]) {
    await expect(preview).toContainText(text);
  }
  await expect(preview).not.toContainText("English | Professional");
});

test("version 5 drafts keep their current step and chosen template", async ({ page }) => {
  await page.addInitScript((draftState) => {
    const legacyState = { ...draftState, step: 6 };
    delete (legacyState as Partial<CVState>).templateConfirmed;
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({
      version: 5,
      savedAt: new Date().toISOString(),
      state: legacyState,
    }));
  }, completeState("service"));

  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Choose your CV design")).toBeVisible();
  await expect(page.locator('button[aria-pressed="true"]').filter({ hasText: "Service" })).toBeVisible();
});

test("anonymous JPEG export supports Tailwind OKLCH colours", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedDraft(page, completeState());
  await page.goto("/");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Download my CV" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download JPEG, no email/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Andrew_Kakooza_InspireAmbitions.jpg");
  await mkdir("test-results/production-defects", { recursive: true });
  const output = "test-results/production-defects/andrew-kakooza.jpg";
  await download.saveAs(output);
  expect((await stat(output)).size).toBeGreaterThan(10_000);
  await expect(page.getByText(/Export failed/)).toHaveCount(0);
});
