import { expect, test } from "@playwright/test";
import { buildEvidenceLedger, validateTailoringDraft } from "../lib/evidence";
import { sampleCVState } from "../lib/sample-data";
import type { TailoringDraft, TailoringResult } from "../lib/tailoring-types";
import { trimDraftForRelevance } from "../lib/tailoring";

function validDraft(): TailoringDraft {
  return {
    roleTitle: "Hotel Operations Manager",
    company: "Gulf Hotel Group",
    matchScore: 82,
    verdict: "strong",
    summary: {
      text: sampleCVState.summary,
      evidenceIds: ["profile-summary"],
    },
    skills: [{ name: sampleCVState.skills[0], evidenceIds: ["skill-1"] }],
    experience: [],
    requirements: [
      {
        id: "req-1",
        text: sampleCVState.skills[0],
        priority: "required",
        status: "supported",
        evidenceIds: ["skill-1"],
      },
      {
        id: "req-2",
        text: "Fluent German",
        priority: "preferred",
        status: "gap",
        evidenceIds: [],
      },
    ],
    gaps: ["Fluent German is not shown in the CV."],
    trimmingNotes: [],
  };
}

test("evidence gate accepts sourced claims and rejects invented numbers", () => {
  const evidence = buildEvidenceLedger(sampleCVState);
  const draft = validDraft();
  expect(validateTailoringDraft(draft, evidence).passed).toBe(true);

  draft.summary = {
    text: "Increased hotel revenue by 47%.",
    evidenceIds: ["profile-summary"],
  };
  const rejected = validateTailoringDraft(draft, evidence);
  expect(rejected.passed).toBe(false);
  expect(rejected.findings.some((finding) => finding.message.includes("47%"))).toBe(true);
});

test("relevance trimming keeps no more than five evidence-backed bullets per role", () => {
  const draft = validDraft();
  draft.experience = [
    {
      experienceId: sampleCVState.experience[0].id,
      bullets: Array.from({ length: 7 }, (_, index) => ({
        text: index < 3 ? `Improved hotel operations and guest service item ${index + 1}` : `Administrative task item ${index + 1}`,
        evidenceIds: ["profile-summary"],
      })),
    },
  ];
  const trimmed = trimDraftForRelevance(draft, "Lead hotel operations and improve guest service standards");
  expect(trimmed.experience[0].bullets).toHaveLength(5);
  expect(trimmed.trimmingNotes.join(" ")).toContain("2 lower-relevance");
});

test("front door uses honest claims and makes tailoring discoverable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Upload & Tailor to a Job" })).toBeVisible();
  await expect(page.getByText("Fictional sample CV").first()).toBeVisible();
  await expect(page.getByText(/world's most|only CV builder|68.?95/i)).toHaveCount(0);
});

test("provider load failure preserves trust in plain language", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((cvState) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 3, savedAt: new Date().toISOString(), state: { ...cvState, step: 8 } }));
  }, sampleCVState);
  await page.route("**/api/tailor", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "The review service is busy. Your CV is safe and unchanged. Please wait one minute, then try again." }) });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Tailor to a Job" }).click();
  await page.getByPlaceholder(/Paste the vacancy/).fill("We need a senior hotel operations manager to lead guest services, manage budgets, coach teams, improve service standards and coordinate departments across a busy UAE luxury hotel operation.");
  await page.getByRole("button", { name: "Run Premium Review" }).click();
  await expect(page.getByText("The review service is busy. Your CV is safe and unchanged. Please wait one minute, then try again.", { exact: true })).toBeVisible();
});

test("reviewer rejection cannot be applied or turned into an application pack", async ({ page }) => {
  const rejectedResult: TailoringResult = {
    draftProvider: "grok-4.5",
    reviewProvider: "claude-sonnet-5",
    evidence: buildEvidenceLedger(sampleCVState),
    review: { approved: false, confidence: 61, corrections: [], warnings: ["Add stronger evidence."], final: validDraft() },
    integrity: { passed: true, findings: [] },
    generatedAt: new Date().toISOString(),
  };
  await page.addInitScript((cvState) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 3, savedAt: new Date().toISOString(), state: { ...cvState, step: 8 } }));
  }, sampleCVState);
  await page.route("**/api/tailor", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rejectedResult) });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Tailor to a Job" }).click();
  await page.getByPlaceholder(/Paste the vacancy/).fill("We need a senior hotel operations manager to lead guest services, manage budgets, coach teams, improve service standards and coordinate departments across a busy UAE luxury hotel operation.");
  await page.getByRole("button", { name: "Run Premium Review" }).click();
  await expect(page.getByRole("button", { name: "Review Not Approved" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Build Application Pack" })).toHaveCount(0);
});

test("premium tailoring workspace is usable on mobile and applies a verified result", async ({ page }) => {
  const result: TailoringResult = {
    draftProvider: "grok-4.5",
    reviewProvider: "claude-sonnet-5",
    evidence: buildEvidenceLedger(sampleCVState),
    review: {
      approved: true,
      confidence: 92,
      corrections: [],
      warnings: ["Keep the unsupported German requirement visible as a gap."],
      final: validDraft(),
    },
    integrity: { passed: true, findings: [] },
    generatedAt: new Date().toISOString(),
  };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((cvState) => {
    const draft = { version: 3, savedAt: new Date().toISOString(), state: { ...cvState, step: 8 } };
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify(draft));
  }, sampleCVState);
  await page.route("**/api/tailor", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(result) });
  });
  await page.route("**/api/application-pack", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        coverLetter: "Dear Hiring Manager,\n\nI am applying for the Hotel Operations Manager role.",
        recruiterEmail: "Please find my tailored application attached.",
        linkedinMessage: "I have applied for your Hotel Operations Manager vacancy.",
        interviewQuestions: Array.from({ length: 10 }, (_, index) => `Interview question ${index + 1}?`),
        starPrompts: Array.from({ length: 5 }, (_, index) => ({ question: `STAR prompt ${index + 1}?`, evidenceIds: ["profile-summary"], bridgeAdvice: "Use a verified example from your CV." })),
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Tailor to a Job" }).click();
  await page.getByPlaceholder("e.g. Front Office Manager").fill("Hotel Operations Manager");
  await page.getByPlaceholder("e.g. Jumeirah Group").fill("Gulf Hotel Group");
  await page.getByPlaceholder(/Paste the vacancy/).fill(
    "We are seeking an experienced hotel operations manager to lead guest services, coach teams, improve service standards, manage budgets, work across departments and deliver measurable operational improvements in a UAE luxury hotel."
  );
  await page.getByRole("button", { name: "Run Premium Review" }).click();
  await expect(page.getByText("Agency review complete")).toBeVisible();
  await expect(page.getByText(/Evidence check passed/)).toBeVisible();
  await page.getByRole("button", { name: "Apply to My CV" }).click();
  await expect(page.getByRole("button", { name: "Tailored Version Applied" })).toBeDisabled();
  await page.getByRole("button", { name: "Build Application Pack" }).click();
  await expect(page.getByText("Application pack", { exact: true })).toBeVisible();
  await expect(page.getByText("Interview question 10?")).toBeVisible();
  await page.getByRole("button", { name: "Interview", exact: true }).click();
  await expect(page.getByRole("button", { name: "Interview", exact: true })).toHaveClass(/bg-emerald-700/);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
