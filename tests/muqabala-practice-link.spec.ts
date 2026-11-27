import { expect, test } from "@playwright/test";
import { defaultCVState } from "../lib/types";

for (const mode of ["requested", "unchecked", "service-offline"] as const) {
  test(`CV practice link: ${mode}`, async ({ page }) => {
    test.skip(process.env.NEXT_PUBLIC_MUQABALA_PRACTICE_LINK !== "true", "Practice-link preview flag is off.");
    const state = {
      ...defaultCVState, step: 8,
      personal: { ...defaultCVState.personal, name: "Fictional Candidate", location: "Dubai, UAE" },
    };
    await page.addInitScript((draft) => {
      localStorage.setItem("inspireambitions-cv-state", JSON.stringify({ version: 8, savedAt: new Date().toISOString(), state: draft }));
    }, state);
    let calls = 0;
    let requested: unknown;
    await page.route("**/api/subscribe", async route => {
      calls++;
      requested = route.request().postDataJSON().requestPracticeLink;
      if (mode === "service-offline") await route.abort("failed");
      else await route.fulfill({ json: { success: true, emailSent: true, practiceLinkIncluded: mode === "requested" } });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Download my CV", exact: true }).click();
    const checkbox = page.getByRole("checkbox", { name: /Email me a Muqabala interview practice link/ });
    await expect(checkbox).not.toBeChecked();
    if (mode !== "unchecked") await checkbox.check();
    expect(calls).toBe(0);
    await page.getByRole("textbox", { name: "Email address" }).fill("fictional-practice@example.com");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Unlock and Download PDF", exact: true }).click();
    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
    expect(calls).toBe(1);
    expect(requested).toBe(mode === "unchecked" ? undefined : true);
    const link = page.getByRole("link", { name: "Open Muqabala interview practice" });
    if (mode === "unchecked") await expect(link).toHaveCount(0);
    else await expect(link).toHaveAttribute("href", "https://trymuqabala.com/practice");
    if (mode === "service-offline") await expect(page.getByRole("status").filter({ hasText: /Your download is ready/ })).toBeVisible();
  });
}
