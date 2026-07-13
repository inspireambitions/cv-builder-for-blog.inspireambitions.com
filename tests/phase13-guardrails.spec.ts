import { expect, test } from "@playwright/test";
import { join } from "node:path";

const webviews = [
  {
    name: "iPhone Safari",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  },
  {
    name: "LinkedIn iOS WebView",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LinkedInApp/9.30.1234",
  },
  {
    name: "WhatsApp iOS WebView",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/25.9.10",
  },
  {
    name: "Indeed Android WebView",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0 Mobile Safari/537.36 IndeedApp/233.0",
  },
];

for (const view of webviews) {
  test(`loads and fits inside ${view.name}`, async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: view.userAgent,
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.getByRole("button", { name: /Build My CV/ })).toBeVisible();
    await page.getByRole("button", { name: /Build My CV/ }).click();
    await page.getByRole("button", { name: /Next Step/ }).click();
    await expect(page.getByPlaceholder("e.g. Sarah Al-Mansoori")).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
      )
      .toBe(true);

    await context.close();
  });
}

test("download gate exposes email-only dual exports without account, card, paywall, or watermark", async ({
  page,
}) => {
  await page.route("**/api/email-results", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
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
  for (let index = 0; index < 7; index += 1) {
    const next = page.getByRole("button", { name: /Next Step/ });
    await expect(next).toBeVisible();
    await next.click();
  }
  await page.getByRole("button", { name: "Email & Download CV" }).click();

  await expect(page.getByText("Free. No card. No watermark.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Download JPEG, no email/ })).toBeVisible();
  await expect(page.getByText(/paywall/i)).toHaveCount(0);

  await page.getByLabel("Email address").fill("phase13@example.com");
  const initialPdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unlock and Download PDF" }).click();
  await initialPdf;

  await expect(page.getByRole("button", { name: "Download ATS-safe PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download Recruiter-ready PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ATS Word (.docx)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Recruiter Word" })).toBeVisible();
});

test("embedded iframe parity works for the WordPress wrapper surface", async ({ page, baseURL }) => {
  const appUrl = baseURL ?? "http://127.0.0.1:3215";
  await page.setContent(`
    <main style="margin:0;padding:0">
      <iframe title="Dubai CV Builder" src="${appUrl}/" style="width:100%;height:900px;border:0"></iframe>
    </main>
  `);

  const frame = page.frameLocator("iframe[title='Dubai CV Builder']");
  await expect(frame.getByRole("button", { name: /Build My CV/ })).toBeVisible();
  await frame.getByRole("button", { name: /Build My CV/ }).click();
  await frame.getByRole("button", { name: /Next Step/ }).click();
  await expect(frame.getByPlaceholder("e.g. Sarah Al-Mansoori")).toBeVisible();
});

test("WCAG 2.2 AA guardrail has no serious or critical axe violations on the start page", async ({
  page,
}) => {
  await page.goto("/");
  await page.addScriptTag({
    path: join(process.cwd(), "node_modules", "axe-core", "axe.min.js"),
  });
  const results = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: typeof import("axe-core") }).axe;
    return axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
    });
  });

  const blocking = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  expect(blocking).toEqual([]);
});
