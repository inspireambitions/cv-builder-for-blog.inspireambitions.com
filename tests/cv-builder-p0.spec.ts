import { expect, test } from "@playwright/test";
import { mkdir, readFile, stat } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

test("removes Google linker tracking from shared URLs", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        async writeText(text: string) {
          (window as unknown as { __copiedResumeLink?: string }).__copiedResumeLink = text;
        },
      },
      configurable: true,
    });
  });

  await page.goto("/?_gl=1*tracking-value");
  await expect.poll(() => new URL(page.url()).search).toBe("");

  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: "Copy private resume link" }).click();

  const resumeLink = await page.evaluate(
    () => (window as unknown as { __copiedResumeLink?: string }).__copiedResumeLink
  );
  const sharedUrl = new URL(resumeLink ?? "");
  expect(sharedUrl.search).toBe("");
  expect(sharedUrl.hash).toMatch(/^#resume=/);
});

test("P0 CV builder path restores drafts, gates downloads by email, and exports PDF/DOCX", async ({
  context,
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        value: "",
        async writeText(text: string) {
          this.value = text;
          (window as unknown as { __copiedResumeLink?: string }).__copiedResumeLink = text;
        },
      },
      configurable: true,
    });
  });
  await page.route("**/api/email-results", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { subscribed: true } }),
    });
  });
  await page.route("**/api/subscribe", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: /Next Step/ }).click();

  await page
    .getByPlaceholder("e.g. Sarah Al-Mansoori")
    .fill("Mariam Hassan");
  await page
    .getByPlaceholder("e.g. Senior Project Manager")
    .fill("F&B Supervisor");
  await page
    .getByPlaceholder("firstname.lastname@gmail.com")
    .fill("mariam.hassan@example.com");
  await page.getByLabel("Visa Status").selectOption("Employment");
  await page.getByPlaceholder("e.g. Immediate, 30 days").fill("Immediate");
  await page.getByLabel("NOC Available").selectOption("Yes");
  await page.getByPlaceholder("Start typing or skip").fill("Philippines");
  await page.getByLabel("Arabic Proficiency").selectOption("Conversational");
  await page.getByRole("button", { name: "RERA" }).click();

  await expect(page.getByPlaceholder("Licence / registration number")).toBeVisible();
  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem("inspireambitions-cv-state");
    if (!raw) return false;
    const draft = JSON.parse(raw);
    return (
      draft.state?.step === 2 &&
      draft.state?.personal?.name === "Mariam Hassan" &&
      draft.state?.personal?.visa_status === "Employment"
    );
  });

  await page.reload();
  await expect(page.getByText("We restored your CV from")).toBeVisible();
  await expect(page.getByPlaceholder("e.g. Sarah Al-Mansoori")).toHaveValue(
    "Mariam Hassan"
  );
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Copy private resume link" }).click();
  await expect(page.getByRole("button", { name: "Copy private resume link" })).toContainText("Link copied");
  const resumeLink = await page.evaluate(
    () => (window as unknown as { __copiedResumeLink?: string }).__copiedResumeLink
  );
  expect(resumeLink).toContain("#resume=");

  const restorePage = await context.newPage();
  await restorePage.goto(resumeLink ?? "");
  await expect(restorePage.getByText("We restored your CV from")).toBeVisible();
  await expect(restorePage.getByPlaceholder("e.g. Sarah Al-Mansoori")).toHaveValue(
    "Mariam Hassan"
  );
  await restorePage.close();

  for (let index = 0; index < 6; index += 1) {
    await page.getByRole("button", { name: /Next Step/ }).click();
  }

  await expect(
    page.getByText("after email unlock. No card, no watermark")
  ).toBeVisible();
  await page.getByRole("button", { name: "Email & Download CV" }).click();
  await expect(page.getByRole("button", { name: "Unlock and Download PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download JPEG, no email/ })).toBeVisible();
  await page.getByLabel("Email address").fill("mariam.hassan@example.com");
  const initialPdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unlock and Download PDF" }).click();
  await initialPdf;
  await expect(page.getByRole("button", { name: "Download ATS-safe PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download Recruiter-ready PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ATS Word (.docx)" })).toBeVisible();

  const pdfDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download ATS-safe PDF" }).click();
  const pdfDownload = await pdfDownloadPromise;
  expect(pdfDownload.suggestedFilename()).toMatch(/InspireAmbitions_CV_ATS\.pdf$/);
  await mkdir("test-results/cv-builder-p0", { recursive: true });
  const pdfPath = "test-results/cv-builder-p0/mariam-hassan.pdf";
  await pdfDownload.saveAs(pdfPath);
  await expect(page.getByText("Finished-PDF ATS check")).toBeVisible();
  await expect(page.getByText(/Readable text layer/)).toBeVisible();
  const parser = new PDFParse({ data: await readFile(pdfPath) });
  const parsedPdf = await parser.getText();
  await parser.destroy();
  expect(parsedPdf.text).toContain("Mariam Hassan");
  expect(parsedPdf.text).toContain("Visa: Employment");

  const wordDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ATS Word (.docx)" }).click();
  const wordDownload = await wordDownloadPromise;
  expect(wordDownload.suggestedFilename()).toMatch(/InspireAmbitions_CV_ATS\.docx$/);
  const wordPath = "test-results/cv-builder-p0/mariam-hassan.docx";
  await wordDownload.saveAs(wordPath);
  expect((await stat(wordPath)).size).toBeGreaterThan(1000);
});

test("CV builder fits a mobile viewport and preview opens without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Build My CV/ }).click();
  await page.getByRole("button", { name: /Next Step/ }).click();
  await page.getByPlaceholder("e.g. Sarah Al-Mansoori").fill("Mariam Hassan");

  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    )
    .toBe(true);

  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.locator("[data-preview-container]").last()).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    )
    .toBe(true);
});
