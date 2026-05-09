import { expect, test } from "@playwright/test";
import { mkdir, readFile, stat } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

test("P0 CV builder path restores drafts and downloads PDF/DOCX without email gate", async ({
  page,
}) => {
  await page.goto("http://localhost:3015");
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
  await page.locator("select").nth(0).selectOption("Employment");
  await page.getByPlaceholder("e.g. Immediate, 30 days").fill("Immediate");
  await page.locator("select").nth(1).selectOption("Yes");
  await page.getByPlaceholder("Start typing or skip").fill("Philippines");
  await page.locator("select").nth(2).selectOption("Conversational");
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

  for (let index = 0; index < 6; index += 1) {
    await page.getByRole("button", { name: /Next Step/ }).click();
  }

  await expect(
    page.getByText("No signup, no card, no watermark")
  ).toBeVisible();
  await page.getByRole("button", { name: "Download CV" }).click();
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download Word (.docx)" })).toBeVisible();
  await expect(page.getByText("Email My Report")).toHaveCount(0);

  const pdfDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const pdfDownload = await pdfDownloadPromise;
  expect(pdfDownload.suggestedFilename()).toMatch(/InspireAmbitions_CV\.pdf$/);
  await mkdir("test-results/cv-builder-p0", { recursive: true });
  const pdfPath = "test-results/cv-builder-p0/mariam-hassan.pdf";
  await pdfDownload.saveAs(pdfPath);
  const parser = new PDFParse({ data: await readFile(pdfPath) });
  const parsedPdf = await parser.getText();
  await parser.destroy();
  expect(parsedPdf.text).toContain("Mariam Hassan");
  expect(parsedPdf.text).toContain("Visa: Employment");

  const wordDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Word (.docx)" }).click();
  const wordDownload = await wordDownloadPromise;
  expect(wordDownload.suggestedFilename()).toMatch(/InspireAmbitions_CV\.docx$/);
  const wordPath = "test-results/cv-builder-p0/mariam-hassan.docx";
  await wordDownload.saveAs(wordPath);
  expect((await stat(wordPath)).size).toBeGreaterThan(1000);
});
