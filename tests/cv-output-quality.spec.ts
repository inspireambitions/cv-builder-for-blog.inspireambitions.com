import { readFileSync, readdirSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { finishCV } from "../lib/cv-finish";
import { buildProfile, getRoleMove } from "../lib/profile-builder";
import { checkCV } from "../lib/cv-quality";
import { findBannedCVPhrase } from "../lib/banned-phrases";
import { buildPDF } from "../lib/export-pdf";
import { buildWord } from "../lib/export-word";
import { SECTION_LABELS, TEMPLATE_CONFIG } from "../lib/template-config";
import { defaultCVState, type CVState, type TemplateType } from "../lib/types";
import person1 from "./fixtures/people/01-reservation-agent.json";
import person3 from "./fixtures/people/03-driver.json";
import person5 from "./fixtures/people/05-kitchen-steward.json";
import person8 from "./fixtures/people/08-waiter.json";
import person6 from "./fixtures/people/06-cleaner.json";
import person15 from "./fixtures/people/15-accounts-clerk.json";
import person19 from "./fixtures/people/19-school-leaver.json";
import { packPages, contactLines } from "../lib/cv-page-layout";

type Person = {
  personal: Partial<CVState["personal"]>;
  summary?: string;
  experience: Partial<CVState["experience"][number]>[];
  education?: Partial<CVState["education"][number]>[];
  skills: string[];
  languages?: { id: string; language: string; level: string }[];
  certifications?: CVState["certifications"];
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
    certifications: person.certifications ?? [],
    languages: (person.languages ?? []).map((language) => ({
      ...language,
      level: ["Native", "Fluent", "Professional", "Conversational", "Basic"].includes(language.level)
        ? language.level as CVState["languages"][number]["level"] : "",
    })),
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
  return text.normalize("NFKC").replace(/[\u061c\u200e\u200f]/g, "").replace(/\s+/g, " ").trim();
}

test("fits short CVs on one balanced page and avoids a near-empty last page", async () => {
  for (const person of [person6, person19]) {
    const output = await buildPDF(draftFor(person));
    expect(output.pageCount).toBe(1);
    expect(output.pageFills[0], person.personal.name).toBeGreaterThanOrEqual(0.65);
    expect(output.pageFills[0], person.personal.name).toBeLessThanOrEqual(0.85);
    expect(await pdfText(output.blob)).toContain(person.personal.name);
  }
  const long = await buildPDF(draftFor(person15));
  expect(long.pageCount).toBe(2);
  expect(long.pageLineCounts.at(-1)).toBeGreaterThanOrEqual(6);
  expect(await pdfText(long.blob)).toContain("Example Ledger Delta");
});

test("moves full groups onto an otherwise short final page and wraps contacts between items", () => {
  const rows = Array.from({ length: 13 }, (_, index) => ({ height: 1, index, keepWithNext: index === 7 }));
  const pages = packPages(rows, 11);
  expect(pages.flat()).toEqual(rows);
  expect(pages[1]).toHaveLength(6);
  expect(contactLines(["Dubai, UAE", "+971 50 000 0001", "amina@example.com"], (line) => line.length, 35))
    .toEqual(["Dubai, UAE | +971 50 000 0001", "amina@example.com"]);
});

test("produce fictional Word files for the native layout audit", async ({}, testInfo) => {
  const directory = process.env.CV_WORD_VISUAL_DIR;
  test.skip(!directory || testInfo.project.name !== "desktop-1440", "Optional native Word audit artefacts.");
  await mkdir(directory!, { recursive: true });
  for (const [id, person] of [[6, person6], [15, person15], [19, person19]] as const) {
    const { blob } = await buildWord(draftFor(person), { asOf: reference });
    await writeFile(`${directory}/person-${id}.docx`, Buffer.from(await blob.arrayBuffer()));
  }
});

test("renderers consume the finished view, including both capture exports", () => {
  const sharedViews = new Set(["TemplatePreview.tsx", "DocumentContact.tsx", "DocumentWorkEntry.tsx"]);
  const entries = readdirSync("components/templates").filter((name) => name.endsWith(".tsx") && !sharedViews.has(name));
  for (const path of [...entries.map((name) => `components/templates/${name}`), "lib/export-pdf.ts", "lib/export-word.ts"]) {
    const source = readFileSync(path, "utf8");
    expect(source, path).toMatch(/const \{ cv \} = finishCV\(draft(?:, options\.asOf)?\)/);
    expect(source, path).not.toMatch(/\b(?:state|draft)(?:\?\.|\.)experience\b|\{[^}]*\bexperience\b[^}]*\}\s*=\s*(?:state|draft)\b/);
  }
  expect(readFileSync("lib/export-jpeg.ts", "utf8")).toContain("captureCV(draft)");
  expect(readFileSync("lib/export-pdf.ts", "utf8")).toContain("buildPDF(draft, options)");
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
  expect(cv.experience[0].description).toBe("Take guest calls and make their reservations.");
  expect(draft.experience[1].description).toContain("Helped customers or colleagues and passed difficult issues to the supervisor.");
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

test("fixes coordinated action verbs without changing nouns or padding weak duties", () => {
  const draft = draftFor(person8);
  draft.experience[0].description = [
    "Reconcile bills and summarise unmatched invoices",
    "Review accounts and record the approvals",
    "Check stock and order records",
    "Responsible for cash",
    "- RESPONSIBLE FOR CASH!",
  ].join("\n");
  expect(finishCV(draft).cv.experience[0].description).toBe([
    "Reconciled bills and summarised unmatched invoices.",
    "Reviewed accounts and recorded the approvals.",
    "Checked stock and order records.",
    "Handled cash.",
  ].join("\n"));
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
    expect(output).not.toMatch(/Volunteer Work|Projects/i);
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

const reference = new Date("2026-11-27T12:00:00Z");
const fixtureDir = "tests/fixtures/people";
const fixtureFiles = readdirSync(fixtureDir).filter((name) => /^\d{2}-.+\.json$/.test(name)).sort();
const fonts = async (file: string) => readFileSync(`public/cv-fonts/${file}`).toString("base64");

async function assertPDFGeometry(blob: Blob, expectedName: string, phone: string) {
  const document = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()), useSystemFonts: true }).promise;
  try {
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const view = page.getViewport({ scale: 1 });
      const items = (await page.getTextContent()).items.flatMap((item) => {
        if (!("str" in item) || !item.str.trim()) return [];
        const [, , , , x, y] = item.transform;
        return [{ x, y, width: item.width, height: item.height, text: item.str }];
      });
      expect(items.length, "Blank PDF page").toBeGreaterThan(0);
      if (number === 1) {
        const firstText = flat(items.map((item) => item.text).join(" "));
        expect(firstText).toContain(expectedName);
        if (phone) expect(firstText).toContain(phone);
      }
      if (number > 1 && number === document.numPages) {
        expect(new Set(items.map((item) => Math.round(item.y))).size).toBeGreaterThanOrEqual(6);
      }
      for (const item of items) {
        expect(item.x).toBeGreaterThanOrEqual(20);
        expect(item.x + item.width).toBeLessThanOrEqual(view.width - 19);
        expect(item.y).toBeGreaterThanOrEqual(20);
        expect(item.y + item.height).toBeLessThanOrEqual(view.height);
      }
      const baselines = new Map<number, typeof items>();
      for (const item of items) {
        const key = Math.round(item.y * 10);
        baselines.set(key, [...(baselines.get(key) ?? []), item]);
      }
      for (const group of baselines.values()) {
        group.sort((a, b) => a.x - b.x);
        for (let index = 1; index < group.length; index++) {
          expect(group[index].x + 0.8).toBeGreaterThanOrEqual(group[index - 1].x + group[index - 1].width);
        }
      }
    }
  } finally {
    await document.destroy();
  }
}

function checkCoreSectionOrder(text: string, cv: CVState) {
  const labels = SECTION_LABELS[cv.cvLanguage];
  const sections = [
    cv.summary.trim() && labels.summary,
    cv.experience.some((job) => job.role || job.company) && labels.experience,
    cv.education.some((entry) => entry.degree || entry.institution) && labels.education,
    cv.skills.length > 0 && labels.skills,
    cv.languages.some((entry) => entry.language) && labels.languages,
  ].flatMap((section) => section ? [section] : []);
  let index = -1;
  for (const section of sections) {
    const next = text.toLowerCase().indexOf(section.toLowerCase(), index + 1);
    expect(next, section).toBeGreaterThan(index);
    index = next;
  }
}

test("the quality matrix contains exactly 20 fictional people", () => {
  expect(fixtureFiles.map((file) => Number(file.slice(0, 2)))).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
});

test("canonical ATS text matches all 20 reviewed snapshots", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Snapshots do not depend on the viewport.");
  const update = process.env.UPDATE_CV_GOLDENS === "1" && !process.env.CI;
  if (update) await mkdir("tests/golden", { recursive: true });
  for (const file of fixtureFiles) {
    const person = JSON.parse(readFileSync(`${fixtureDir}/${file}`, "utf8")) as Person;
    const pdf = await buildPDF(draftFor(person), { asOf: reference }, fonts);
    const text = (await pdfText(pdf.blob)).replace(/^-- \d+ of \d+ --$/gm, "");
    const snapshot = `tests/golden/${file.replace(/\.json$/, ".txt")}`;
    const content = flat(text) + "\n";
    if (update) await writeFile(snapshot, content);
    expect(content, snapshot).toBe(readFileSync(snapshot, "utf8").replace(/\r\n/g, "\n"));
  }
});

for (const file of fixtureFiles) {
  const person = JSON.parse(readFileSync(`${fixtureDir}/${file}`, "utf8")) as Person;
  test(`finished preview and text downloads agree for ${person.personal.name} across ten designs`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.clock.setFixedTime(reference);
    await page.goto("/");
    for (const key of Object.keys(TEMPLATE_CONFIG) as TemplateType[]) {
      const draft = draftFor(person, key);
      const before = structuredClone(draft);
      const { cv } = finishCV(draft, reference);
      const findings = checkCV(cv, reference);
      expect(draft).toEqual(before);
      expect(finishCV(cv, reference).cv).toEqual(cv);
      await page.evaluate((state) => {
        localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 7, savedAt: new Date().toISOString(), state }));
      }, draft);
      await page.reload();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      const paper = await openPreview(page);
      const previewContent = flat(await paper.innerText());
      const pdf = await buildPDF(draft, { asOf: reference }, fonts);
      const word = await buildWord(draft, { asOf: reference });
      const extractedPDF = (await pdfText(pdf.blob)).replace(/^-- \d+ of \d+ --$/gm, "");
      const pdfContent = flat(extractedPDF);
      const wordBuffer = Buffer.from(await word.blob.arrayBuffer());
      const wordContent = flat((await mammoth.extractRawText({ buffer: wordBuffer })).value);
      const wordMarkup = await mammoth.convertToHtml({ buffer: wordBuffer });
      const expectedBullets = cv.experience.flatMap((job) => job.description.split("\n").filter(Boolean));
      expect((wordMarkup.value.match(/<li>/g) ?? []).length, key).toBe(expectedBullets.length);
      await expect(paper.locator("article ul > li")).toHaveCount(expectedBullets.length);
      expect(pdf.needsUnicodeRendering).toBe(false);
      for (const output of [previewContent, pdfContent, wordContent]) {
        expect(findBannedCVPhrase(output), key).toBeUndefined();
        checkCoreSectionOrder(output, cv);
        expect(output, key).toContain(cv.personal.title);
        expect(output, key).toContain(cv.summary);
        if (cv.personal.phone) expect(output, key).toContain(cv.personal.phone);
        let previousJob = Math.max(0, output.toLowerCase().indexOf("work experience"));
        for (const job of cv.experience) {
          const position = output.indexOf(job.company, previousJob);
          expect(position, key).toBeGreaterThanOrEqual(previousJob);
          previousJob = position + job.company.length;
          for (const line of job.description.split("\n").filter(Boolean)) expect(output, key).toContain(flat(line));
          expect(output.slice(position), key).toContain(job.dates);
        }
        for (const skill of cv.skills) expect(output, key).toContain(skill);
      }
      for (const bullet of expectedBullets) {
        expect(bullet).toMatch(/\.$/);
        expect(bullet).not.toMatch(/^[-–—*•]\s/);
        if (/^[a-z]/i.test(bullet)) expect(bullet).toMatch(/^[A-Z]/);
        expect(pdfContent.includes(`• ${flat(bullet)}`) || pdfContent.includes(`${flat(bullet)} •`), bullet).toBe(true);
      }
      await assertPDFGeometry(pdf.blob, cv.personal.name, cv.personal.phone);
      if (file.startsWith("12-")) expect(findings.some((issue) => issue.id.startsWith("gap-"))).toBe(true);
      if (file.startsWith("02-")) expect(findings.some((issue) => issue.id.startsWith("library-"))).toBe(true);
      if (file.startsWith("18-")) expect(pdfContent).toContain("فحصت 15 لوحة كهربائية");
      if (file.startsWith("19-")) expect(pdfContent.toLowerCase()).not.toContain("work experience");
      if (file.startsWith("20-")) expect(cv.summary).not.toContain("Now seeking");
    }
  });
}

test("browser PDF download keeps Arabic and numbers as selectable text", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "The same exporter runs in both viewports.");
  const person = JSON.parse(readFileSync(`${fixtureDir}/18-electrician.json`, "utf8")) as Person;
  const draft = draftFor(person, "site");
  await page.addInitScript((state) => {
    localStorage.setItem("ia-cv-download-email-unlocked", "fixture@example.com");
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, state, savedAt: new Date().toISOString() }));
  }, draft);
  await page.route("**/api/ats-check", (route) => route.fulfill({ status: 503 }));
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Download my CV" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download PDF for company computers/ }).click();
  const download = await pending;
  const path = await download.path();
  const bytes = readFileSync(path);
  const text = flat(await pdfText(new Blob([new Uint8Array(bytes)])));
  expect(text).toContain("فحصت 15 لوحة كهربائية");
  expect(text).toContain("Check 230 V circuits");
});

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

test("person one profile is grounded in dates, work, skills and target", async ({}, testInfo) => {
  const draft = draftFor(person1);
  const expected = "Reservation Agent with more than 2 years of hotel experience at City Hotel Barsha, Dubai. Moved from Waitress to Reservation Agent in 2025. Skilled in guest calls, email handling and Microsoft Office. Now seeking a finance clerk role.";
  expect(finishCV(draft, reference).cv.summary).toBe(expected);
  expect(buildProfile(finishCV(draft, reference).cv, draft.personal.title, reference, expected.replace("hotel experience", "award-winning hotel experience"))).toBe(expected);
  expect(buildProfile(finishCV(draft, reference).cv, draft.personal.title, reference, expected.replace("Moved", "Promoted"))).toBe(expected);
  expect(buildProfile(finishCV(draft, reference).cv, draft.personal.title, reference, expected + " Dynamic team player.")).toBe(expected);
  expect(buildProfile(finishCV(draft, reference).cv, draft.personal.title, reference, expected.replace("with more", "with  more"))).toBe(expected.replace("with more", "with  more"));
  const dir = process.env.CV_PROFILE_COMPARISON_DIR;
  if (dir && testInfo.project.name === "desktop-1440") {
    const { blob } = await buildPDF(draft);
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/after.pdf`, Buffer.from(await blob.arrayBuffer()));
    await writeFile(`${dir}/after.txt`, await pdfText(blob));
  }
});

test("only an explicit confirmation for the same dated move says promoted", () => {
  const draft = draftFor(person1);
  const job = draft.experience[1];
  job.promotionConfirmation = getRoleMove(job, draft.experience, reference)?.confirmation;
  expect(finishCV(draft, reference).cv.summary).toContain("Promoted from Waitress to Reservation Agent in 2025.");
  job.role = "Front Desk Agent";
  expect(finishCV(draft, reference).cv.summary).toContain("Moved from Waitress to Front Desk Agent in 2025.");
  job.dates = "Feb 2026 to Present";
  expect(finishCV(draft, reference).cv.summary).not.toMatch(/Moved|Promoted/);
});

test("tenure avoids overlaps, future dates, partial months, different sites and unknown dates", () => {
  const draft = draftFor(person1);
  const job = draft.experience[1];
  job.dates = "Nov 2025 to Present";
  draft.experience = [job, { ...job, id: "overlap", dates: "Dec 2025 to Present" },
    { ...job, id: "future", role: "Future Role", dates: "Nov 2027 to Dec 2027" },
    { ...job, id: "old", company: "Example Other Hotel", dates: "Jan 2015 to Dec 2024" },
    { ...job, id: "branch", location: "Abu Dhabi", dates: "Jan 2008 to Dec 2014" },
    { ...job, id: "bad-month", dates: "Octopus 1999 to Nov 2005" },
  ];
  expect(finishCV(draft, reference).cv.summary).not.toMatch(/years? of|Moved|Promoted/);
  expect(finishCV(draft, reference).cv.personal.title).toBe("Reservation Agent");
  draft.experience[1].dates = "Oct 2025 to Present";
  expect(finishCV(draft, reference).cv.summary).toContain("with 1 year of hotel experience");
});

test("the CV language check uses word boundaries and protects the saved draft", () => {
  expect(findBannedCVPhrase("RESULTS‑DRIVEN")).toBe("results-driven");
  expect(findBannedCVPhrase("hard working team member")).toBe("hardworking");
  expect(findBannedCVPhrase("Academy, MySQL and Dynamics")).toBeUndefined();
  const draft = draftFor(person1);
  draft.experience[1].description = "Responsible for handling guest calls\nI am a passionate team player.";
  draft.skills = ["Detail oriented", "MySQL"];
  draft.languages = [{ id: "en", language: "English", level: "" }, { id: "lg", language: "Luganda", level: "" }];
  const { cv } = finishCV(draft, reference);
  expect(cv.experience[0].description).toBe("Handle guest calls.");
  expect(cv.skills).toEqual(["MySQL"]);
  expect(cv.summary).toContain("Speaks English and Luganda.");
  expect(draft.experience[1].description).toContain("passionate");
  expect(draft.skills).toContain("Detail oriented");
  draft.personal.title = "WAITRESS";
  expect(finishCV(draft, reference).cv.summary).not.toContain("Now seeking");
  draft.cvLanguage = "ar";
  expect(finishCV(draft, reference).cv.summary).toContain("اللغات English وLuganda.");
});

test("an unchecked promotion becomes a claim only after the candidate selects it", async ({ page }) => {
  await page.addInitScript((state) => {
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state }));
  }, { ...draftFor(person1), step: 2 });
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const promotion = page.getByRole("checkbox", { name: "This was a promotion from Waitress" });
  await expect(promotion).not.toBeChecked();
  await promotion.focus();
  await page.keyboard.press("Space");
  await expect(promotion).toBeChecked();
  await expect(await openPreview(page)).toContainText("Promoted from Waitress to Reservation Agent in 2025.");
});
