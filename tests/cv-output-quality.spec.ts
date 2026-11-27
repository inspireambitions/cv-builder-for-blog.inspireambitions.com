import { readFileSync, readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { finishCV } from "../lib/cv-finish";
import { buildPDF } from "../lib/export-pdf";
import { buildWord } from "../lib/export-word";
import { TEMPLATE_CONFIG } from "../lib/template-config";
import { defaultCVState, type CVState, type TemplateType } from "../lib/types";
import person1 from "./fixtures/people/01-reservation-agent.json";
import person3 from "./fixtures/people/03-driver.json";
import person5 from "./fixtures/people/05-kitchen-steward.json";
import person8 from "./fixtures/people/08-waiter.json";

type Person = {
  personal: Partial<CVState["personal"]>;
  summary?: string;
  experience: Partial<CVState["experience"][number]>[];
  education?: Partial<CVState["education"][number]>[];
  skills: string[];
};

function draftFor(person: Person, template: TemplateType = "ats-clean"): CVState {
  return {
    ...defaultCVState,
    summary: person.summary ?? "",
    template,
    templateConfirmed: true,
    step: 8,
    geo: "gulf",
    personal: { ...defaultCVState.personal, ...person.personal },
    experience: person.experience.map((job, index) => ({
      ...defaultCVState.experience[0], ...job, id: `job-${index}`,
    })),
    education: (person.education ?? []).map((entry, index) => ({
      ...defaultCVState.education[0], ...entry, id: `education-${index}`,
    })),
    skills: [...person.skills],
  };
}

async function pdfText(blob: Blob) {
  const parser = new PDFParse({ data: new Uint8Array(await blob.arrayBuffer()) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

function flat(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

test("renderers consume the finished view, including both capture exports", () => {
  const entries = readdirSync("components/templates").filter((name) => name.endsWith(".tsx") && name !== "TemplatePreview.tsx");
  for (const path of [...entries.map((name) => `components/templates/${name}`), "lib/export-pdf.ts", "lib/export-word.ts"]) {
    const source = readFileSync(path, "utf8");
    expect(source, path).toMatch(/const \{ cv \} = finishCV\(draft\)/);
    expect(source, path).not.toMatch(/\b(?:state|draft)(?:\?\.|\.)experience\b|\{[^}]*\bexperience\b[^}]*\}\s*=\s*(?:state|draft)\b/);
  }
  expect(readFileSync("lib/export-jpeg.ts", "utf8")).toContain("captureCV(draft)");
  expect(readFileSync("lib/export-pdf.ts", "utf8")).toContain("captureCV(draft)");
  expect(readFileSync("lib/capture-cv.ts", "utf8")).toContain("createElement(Template, { state: draft })");
});

test("finishes fictional drafts without changing them or inventing facts", () => {
  const draft = draftFor(person1);
  const original = structuredClone(draft);
  const { cv, changes } = finishCV(draft);
  expect(draft).toEqual(original);
  expect(cv.personal.title).toBe("Reservation Agent");
  expect(cv.experience.map((job) => job.role)).toEqual(["Reservation Agent", "Waitress"]);
  expect(cv.experience[0].description).toContain("Take guest calls and make their reservations.");
  expect(cv.experience[0].description).toContain("Help customers or colleagues and pass difficult issues to the supervisor.");
  expect(cv.experience[1].description).toContain("Handled restaurant reservations.");
  expect(cv.experience[1].description).toContain("Welcomed guests, explained menu items and recorded orders.");
  expect(cv.skills).toEqual(["Email handling", "Reservation checks", "Microsoft Office", "Communication"]);
  expect(changes.map(({ kind }) => kind)).toContain("job-order");
  expect(finishCV(cv).cv).toEqual(cv);

  const driver = finishCV(draftFor(person3)).cv;
  expect(driver.experience.map((job) => job.company)).toEqual([
    "Example Route Logistics", "Example Oasis Dispatch", "Example Dune Transit",
  ]);
  expect(driver.education.map((entry) => entry.year)).toEqual(["2021", "2017"]);
  expect(finishCV(draftFor(person5)).cv.experience[0].description)
    .toBe("Check HACCP records.\nWash pots and pans.\nClean work surfaces.");
  expect(finishCV(draftFor(person8)).cv.experience[0].description)
    .toBe("Used Micros to enter orders.\nGreeted guests.\nTook orders and made drinks.\nServed food.\nChecked orders.");
});

test("preserves unknown dates, missing facts, non-English duties and distinct amounts", () => {
  const draft = draftFor(person3);
  draft.experience.unshift({ ...defaultCVState.experience[0], id: "legacy", role: "Porter", dates: "Holiday work", description: "نقلت 15 صندوقًا.\nMet the 1.5 target\nMet the 15 target\n-5°C freezer checks" });
  draft.experience.push({ ...defaultCVState.experience[0], id: "other", role: "Clerk", dates: "Seasonal" });
  const { cv } = finishCV(draft);
  expect(cv.experience.slice(-2).map((job) => job.dates)).toEqual(["Holiday work", "Seasonal"]);
  expect(cv.experience.at(-2)?.description).toBe("نقلت 15 صندوقًا.\nMet the 1.5 target.\nMet the 15 target.\n-5°C freezer checks.");
  expect(finishCV({ ...draft, experience: [], skills: ["Excel"] }).cv.personal.title).toBe("");
  expect(finishCV({ ...draft, skills: ["Excel"] }).cv.skills).toEqual(["Excel"]);
  expect(finishCV({ ...draft, skills: ["C++", "C#", "CI/CD", ".NET", "CISSP", "iOS", "ms excel", "MS Excel"] }).cv.skills)
    .toEqual(["C++", "C#", "CI/CD", ".NET", "CISSP", "iOS", "MS Excel"]);
});

test("keeps noun phrases and exact quantities in the exported content", () => {
  const draft = draftFor(person8);
  draft.experience[0].description = [
    "Booking engine errors reported to IT",
    "Training records kept up to date for 12 staff",
    "Housekeeping requests logged in HotSOS",
    "Cut average wait from 1.5 minutes to 15 seconds",
    "Handled 1,250 calls a month",
  ].join("\n");
  const lines = finishCV(draft).cv.experience[0].description.split("\n");
  expect(lines).toEqual([
    "Training records kept up to date for 12 staff.",
    "Housekeeping requests logged in HotSOS.",
    "Cut average wait from 1.5 minutes to 15 seconds.",
    "Handled 1,250 calls a month.",
    "Booking engine errors reported to IT.",
  ]);
});

test("prefers named systems and typed duties within the six-bullet limit and preserves negation", () => {
  const draft = draftFor(person5);
  draft.experience[0].description = [
    "Followed safety rules and kept the work area clean and organised.",
    "Do not mix detergent types.",
    "Packed crates",
    "Loaded trays",
    "Cleaned ovens",
    "Labelled food trays",
    "Moved boxes",
    "Recorded -5°C",
    "CHECKED HACCP RECORDS",
  ].join("\n");
  const lines = finishCV(draft).cv.experience[0].description.split("\n");
  expect(lines).toHaveLength(6);
  expect(lines.slice(0, 2)).toEqual(["Record -5°C.", "Check HACCP records."]);
  expect(lines).toContain("Do not mix detergent types.");
});

test("sorts multiple current roles by start date and skips placeholders for the headline", () => {
  const draft = draftFor(person3);
  const blankCurrent = { ...defaultCVState.experience[0], id: "blank", current: true, startMonth: "3", startYear: "2026" };
  const otherCurrent = { ...draft.experience[0], id: "current", dates: "Apr 2022 to Present" };
  draft.experience.unshift(blankCurrent, otherCurrent);
  const { cv } = finishCV(draft);
  expect(cv.experience.slice(0, 3).map((job) => job.id)).toEqual(["blank", "job-1", "current"]);
  expect(cv.personal.title).toBe("Driver");
});

test("keeps empty draft entries out of the text exports", async () => {
  const draft = draftFor(person3);
  draft.summary = "  ";
  draft.volunteer = [{ id: "blank", role: "", org: " ", dates: "", impact: "" }];
  draft.projects = [{ id: "blank", name: "", description: "", outcomes: "", url: "" }];
  const word = await buildWord(draft);
  const pdf = await buildPDF(draft);
  const wordContent = (await mammoth.extractRawText({ buffer: Buffer.from(await word.blob.arrayBuffer()) })).value;
  for (const output of [wordContent, await pdfText(pdf.blob)]) {
    expect(output).not.toMatch(/Profile|Volunteer Work|Projects/i);
  }
  expect(draft.volunteer).toHaveLength(1);
  expect(draft.projects).toHaveLength(1);
});

async function openPreview(page: Page) {
  const button = page.getByRole("button", { name: "Preview CV", exact: true });
  if (await button.isVisible()) await button.click();
  const paper = page.locator('#cv-render[data-finished-cv="true"]:visible');
  await expect(paper).toBeVisible();
  return paper;
}

for (const person of [person1, person3, person5, person8]) {
  test(`finished preview and text downloads agree for ${person.personal.name} across ten designs`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    for (const key of Object.keys(TEMPLATE_CONFIG) as TemplateType[]) {
      const draft = draftFor(person, key);
      const { cv } = finishCV(draft);
      await page.evaluate((state) => {
        localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 7, savedAt: new Date().toISOString(), state }));
      }, draft);
      await page.reload();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      const paper = await openPreview(page);
      const previewContent = flat(await paper.innerText());
      const pdf = await buildPDF(draft);
      const word = await buildWord(draft);
      const pdfContent = flat(await pdfText(pdf.blob));
      const wordContent = flat((await mammoth.extractRawText({ buffer: Buffer.from(await word.blob.arrayBuffer()) })).value);
      for (const output of [previewContent, pdfContent, wordContent]) {
        expect(output, key).toContain(cv.personal.title);
        expect(output, key).toContain(cv.personal.phone);
        let previousJob = 0;
        for (const job of cv.experience) {
          const position = output.indexOf(job.company, previousJob);
          expect(position, key).toBeGreaterThanOrEqual(previousJob);
          previousJob = position + job.company.length;
          for (const line of job.description.split("\n")) expect(output, key).toContain(line);
          expect(output.slice(position), key).toContain(job.dates);
        }
        for (const skill of cv.skills) expect(output, key).toContain(skill);
      }
      const firstBullet = cv.experience[0].description.split("\n")[0];
      expect(pdfContent).toContain(`• ${firstBullet}`);
    }
  });
}

test("saved drafts show the finishing details while keeping typed answers", async ({ page }) => {
  const draft = draftFor(person1);
  await page.addInitScript((state) => {
    if (sessionStorage.getItem("cv-quality-seeded")) return;
    sessionStorage.setItem("cv-quality-seeded", "1");
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 7, savedAt: new Date().toISOString(), state }));
  }, draft);
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const details = page.locator("summary").filter({ hasText: /We tidied .* things/ });
  await expect(details).toBeVisible();
  await details.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Put recent jobs first.")).toBeVisible();
  await expect(await openPreview(page)).toContainText("Take guest calls and make their reservations.");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state);
  expect(saved.experience.map((job: CVState["experience"][number]) => job.description))
    .toEqual(draft.experience.map((job) => job.description));
  expect(saved.personal.title).toBe("Finance clerk");
});
