import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { defaultCVState, type CVState } from "../lib/types";
import { sampleServiceCVState } from "../lib/sample-data";
import { defaultTalkProgress, getTalkQuestions, normalizeTalk } from "../lib/talk-flow";
import { getRoleFamilies, getTalkSentences } from "../lib/role-suggestions";
import { isTalkTextGrounded } from "../lib/evidence";

test("sentence library supports every family without auto-selected facts", () => {
  for (const family of getRoleFamilies()) expect(getTalkSentences(family.key).length).toBeGreaterThanOrEqual(8);
  expect(defaultTalkProgress.suggestions).toEqual({});
  expect(defaultTalkProgress.families).toEqual({});
});
test("Talk evidence rejects new numbers, employers, certificates and duties", () => {
  const source = "Cleaned rooms and changed towels.";
  for (const line of ["Cleaned 30 rooms.", "Worked at Marriott.", "HACCP certified.", "Managed payroll.", "Cleaned rooms without help."]) expect(isTalkTextGrounded(line, source)).toBe(false);
  expect(isTalkTextGrounded("Cleaned rooms.", source)).toBe(true);
  expect(isTalkTextGrounded("Cleaned rooms.", "Did not clean rooms.")).toBe(false);
  expect(isTalkTextGrounded("Cleaned 30 rooms.", "Cleaned 300 rooms.")).toBe(false);
  expect(isTalkTextGrounded("Managed 5 rooms.", "Managed 30 rooms and trained 5 staff.")).toBe(false);
  expect(isTalkTextGrounded("Trained 30 staff.", "Managed 30 rooms and trained 5 staff.")).toBe(false);
  expect(isTalkTextGrounded("Managed 30 staff.", "Managed 30 rooms and trained 5 staff.")).toBe(false);
  expect(isTalkTextGrounded("I worked.", "English.")).toBe(false);
});
test("branching progress follows jobs and dates, and restoration is bounded", () => {
  const state = structuredClone(defaultCVState);
  const initial = getTalkQuestions(state);
  expect(initial.some((question) => question.kind === "end")).toBe(false);
  state.experience[0].current = false;
  expect(getTalkQuestions(state).length).toBe(initial.length + 1);
  state.experience.push({ ...state.experience[0], id: "exp-2", current: true });
  expect(getTalkQuestions(state).length).toBe(initial.length + 10);
  expect(normalizeTalk({ families: { unrelated: "housekeeping" }, questionId: 12 }, state.experience).questionId).toBe("language");
});

async function enterTalk(page: Page) {
  await page.goto("/");
  const entry = page.getByRole("button", { name: /Answer simple questions/ });
  test.skip(await entry.count() === 0, "Talk Mode flag is off in the legacy regression build.");
  await entry.click();
  await expect(page.getByRole("heading", { name: "Which language do you want to use?" })).toBeVisible();
}
async function move(page: Page, name: string) {
  const progress = page.getByTestId("talk-progress");
  const previous = await progress.innerText();
  await page.getByRole("button", { name, exact: true }).click();
  await expect(progress).not.toHaveText(previous);
}
async function next(page: Page) { await move(page, "Save and continue"); }
async function skip(page: Page) { await move(page, "Skip for now"); }
async function seed(page: Page, state: CVState, locale = "en") {
  await page.goto("/");
  test.skip(await page.getByRole("button", { name: /Answer simple questions/ }).count() === 0, "Feature is off.");
  await page.evaluate(({ state, locale }) => {
    localStorage.clear(); localStorage.setItem("cv-locale", locale);
    localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state }));
  }, { state, locale });
  await page.reload();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

test("AI endpoints reject fabricated facts and keep plain offline responses", async ({ request }) => {
  const body = { familyKey: "housekeeping", jobTitle: "Fixture unsupported", inputLang: "en", text: "Cleaned rooms. Changed towels." };
  const response = await request.post("/api/talk/bullets", { data: body, headers: { "x-real-ip": "198.51.100.4" } });
  if (response.status() === 404) { expect(await response.json()).toEqual({ error: "Not enabled" }); return; }
  expect(response.ok()).toBe(true);
  expect((await response.json()).bullets).toEqual(["Changed towels.", "Cleaned rooms."]);
  const offline = await request.post("/api/talk/bullets", { data: { ...body, jobTitle: "Fixture outage" }, headers: { "x-real-ip": "198.51.100.5" } });
  expect(offline.status()).toBe(503);
  expect((await offline.json()).error).not.toMatch(/Anthropic|Claude|API|key/i);
  const invalid = await request.post("/api/talk/bullets", { data: { ...body, text: 42 } });
  expect(invalid.status()).toBe(400);
  const external = await request.post("/api/talk/bullets", { data: body, headers: { origin: "https://example.org" } });
  expect(external.status()).toBe(403);
  const statuses = [];
  for (let i = 0; i < 13; i++) statuses.push((await request.post("/api/talk/bullets", { data: body, headers: { "x-real-ip": `198.51.100.${test.info().project.name === "mobile-360" ? 40 : 41}` } })).status());
  expect(statuses[12]).toBe(429);
});

test("Talk Mode completes with AI down and produces valid picture, PDF and Word", async ({ page }, testInfo) => {
  test.setTimeout(120000);
  await page.route("**/api/talk/**", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Unavailable" }) }));
  await page.route("**/api/detect-geo", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ geo: "gulf" }) }));
  await page.route("**/api/subscribe", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) }));
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await enterTalk(page); await next(page);
  await page.getByRole("button", { name: "Housekeeping", exact: true }).click(); await next(page);
  await page.getByRole("button", { name: "Room Attendant", exact: true }).click(); await next(page);
  await page.getByLabel("Company name", { exact: true }).fill("Example Hotel"); await next(page);
  await page.getByRole("button", { name: "Dubai, UAE", exact: true }).click(); await next(page);
  await page.getByLabel("Month", { exact: true }).selectOption("1"); await page.getByLabel("Year", { exact: true }).selectOption("2023"); await next(page);
  await page.getByRole("button", { name: "Yes", exact: true }).click(); await next(page);
  await page.getByRole("button", { name: "Changed bed linen, replaced towels and restocked guest supplies.", exact: true }).click();
  await page.getByRole("button", { name: "Help me write these lines" }).click();
  await expect(page.locator(".talk-mode").getByRole("alert")).toContainText("Your answers are saved");
  await next(page); await skip(page);
  await page.getByRole("button", { name: "No, next" }).click();
  await page.getByRole("button", { name: "Secondary school", exact: true }).click(); await next(page);
  await skip(page);
  await page.getByRole("button", { name: "Teamwork", exact: true }).click(); await next(page);
  await page.getByRole("button", { name: "English", exact: true }).click(); await page.getByRole("button", { name: "Good", exact: true }).click(); await next(page);
  for (let i = 0; i < 4; i++) await skip(page);
  await page.getByLabel("Your name", { exact: true }).fill("Fictional Test Candidate");
  await page.getByLabel("Phone, with country code", { exact: true }).fill("+971 50 000 0000");
  await page.getByRole("button", { name: "I do not use email" }).click(); await next(page);
  await skip(page);
  await expect(page.getByLabel("About you", { exact: true })).toHaveValue("Room Attendant. Skills include Teamwork. Languages: English.");
  await page.getByRole("button", { name: "Help me write this", exact: true }).click(); await expect(page.locator(".talk-mode").getByRole("alert")).toContainText("Your answers are saved");
  await page.getByRole("button", { name: "Keep these words" }).click();
  await page.getByRole("button", { name: /^Service/ }).click(); await next(page);
  await expect(page.getByRole("heading", { name: "Your CV is ready", exact: true })).toBeVisible();
  const save = await page.getByTestId("talk-save").boundingBox();
  const button = await page.getByRole("button", { name: "Download my CV", exact: true }).boundingBox();
  expect(save!.y).toBeGreaterThan(button!.y + button!.height);
  await page.getByRole("button", { name: "Download my CV", exact: true }).click();
  const picturePromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download picture, no email/ }).click();
  const picture = await picturePromise;
  const prefix = `outputs/step-04/offline-${testInfo.project.name}`;
  await mkdir("outputs/step-04", { recursive: true });
  await picture.saveAs(`${prefix}.jpg`);
  expect((await readFile(`${prefix}.jpg`)).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  await page.getByLabel("Email address", { exact: true }).fill("fictional@example.com");
  const pdfPromise = page.waitForEvent("download"); await page.getByRole("button", { name: "Unlock and Download PDF", exact: true }).click();
  await (await pdfPromise).saveAs(`${prefix}.pdf`);
  const parser = new PDFParse({ data: await readFile(`${prefix}.pdf`) });
  expect((await parser.getText()).text).toContain("Fictional Test Candidate"); await parser.destroy();
  const wordPromise = page.waitForEvent("download"); await page.getByRole("button", { name: /Word \(if a company wants to edit it\)/ }).click();
  await (await wordPromise).saveAs(`${prefix}.docx`);
  expect((await mammoth.extractRawText({ buffer: await readFile(`${prefix}.docx`) })).value).toContain("Changed bed linen");
  expect(consoleErrors).toEqual([]);
});

test("switching form modes, Back and refresh preserve the same CV", async ({ page }) => {
  await seed(page, { ...structuredClone(sampleServiceCVState), builderMode: "talk", talk: { ...defaultTalkProgress, questionId: "sample-service-duties", families: { "sample-service": "housekeeping" } } });
  await page.getByLabel("Say it in my words").fill("My own saved work.");
  await page.getByRole("button", { name: "Back", exact: true }).click(); await next(page);
  await expect(page.getByLabel("Say it in my words")).toHaveValue("My own saved work.");
  await page.getByRole("button", { name: "Full form", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(test.info().project.name === "mobile-360" ? 360 : 1440);
  await page.getByRole("button", { name: "Simple questions", exact: true }).click();
  await expect(page.getByLabel("Say it in my words")).toHaveValue("My own saved work.");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state.builderMode)).toBe("talk");
  await page.reload(); await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Say it in my words")).toHaveValue("My own saved work.");
});

test("AI suggestions need approval and adding another job preserves the first", async ({ page }) => {
  const state = { ...structuredClone(sampleServiceCVState), builderMode: "talk" as const, talk: { ...defaultTalkProgress, questionId: "sample-service-duties" } };
  state.experience = [state.experience[0]];
  const original = state.experience[0].description;
  await page.route("**/api/talk/bullets", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ bullets: ["Clean guest rooms.", "Restock guest supplies."] }) }));
  await seed(page, state);
  await page.getByRole("button", { name: "Help me write these lines" }).click();
  await expect(page.getByRole("button", { name: "Keep", exact: true })).toHaveCount(2);
  await expect(page.getByLabel("Say it in my words", { exact: true })).toHaveValue(original);
  await page.getByRole("button", { name: "Keep", exact: true }).first().click();
  await expect(page.getByLabel("Say it in my words", { exact: true })).toHaveValue(`${original}\nClean guest rooms.`);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await next(page); await skip(page);
  await page.getByRole("button", { name: "Yes, add a job", exact: true }).click();
  await expect(page.getByRole("heading", { name: "What work do you do?", exact: true })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state.experience.length)).toBe(2);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("inspireambitions-cv-state")!).state);
  expect(saved.experience[0].description).toContain("Clean guest rooms.");
  expect(saved.experience[1].role).toBe("");
  expect(saved.experience[1].description).toBe("");
});

for (const locale of ["en", "ar", "ur"]) {
  test(`every Talk screen fits 360px with usable targets: ${locale}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-360", "360px screenshot matrix.");
    test.setTimeout(180000);
    await page.goto("/");
    test.skip(await page.getByRole("button", { name: /Answer simple questions/ }).count() === 0, "Feature is off.");
    const state: CVState = { ...structuredClone(sampleServiceCVState), builderMode: "talk", talk: { ...defaultTalkProgress } };
    state.experience = [{ ...state.experience[0], id: "exp-1", current: false, startMonth: "1", startYear: "2023", endMonth: "1", endYear: "2025", dates: "Jan 2023 to Jan 2025" }];
    await mkdir(`outputs/step-04/${locale}`, { recursive: true });
    for (const question of getTalkQuestions(state)) {
      const screen = await page.context().newPage();
      await screen.addInitScript(({ state, id, locale }) => {
        localStorage.setItem("cv-locale", locale);
        localStorage.removeItem("inspireambitions-cv-active-draft-id"); localStorage.removeItem("inspireambitions-cv-drafts");
        localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state: { ...state, talk: { ...state.talk, questionId: id } } }));
      }, { state, id: question.id, locale });
      await screen.goto("/"); await screen.getByRole("button", { name: "Continue", exact: true }).click();
      await expect(screen.getByRole("heading", { name: question.kind === "done" ? "Your CV is ready" : question.question, exact: true })).toBeVisible();
      expect(await screen.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
      const checks = await screen.locator(".talk-mode button, .talk-mode input, .talk-mode select, .talk-mode textarea").evaluateAll((nodes) => nodes.filter((node) => (node as HTMLElement).offsetParent !== null).map((node) => ({ height: node.getBoundingClientRect().height, label: node.textContent })));
      expect(checks.filter((item) => item.height < 48), question.id).toEqual([]);
      expect(await screen.locator(".talk-mode").innerText()).not.toMatch(/\b(?:JPEG|ATS|Anthropic|Claude|Grok|Sonnet|premium beta)\b/i);
      await expect(screen.getByTestId("brand")).toHaveText("Inspire Ambitions");
      await screen.addScriptTag({ path: join(process.cwd(), "node_modules", "axe-core", "axe.min.js") });
      const blocking = await screen.evaluate(async () => {
        const axe = (window as unknown as { axe: typeof import("axe-core") }).axe;
        const result = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
        return result.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
      });
      expect(blocking, question.id).toEqual([]);
      await screen.screenshot({ path: `outputs/step-04/${locale}/${question.id}-360.png`, fullPage: true });
      await screen.close();
    }
  });
}
