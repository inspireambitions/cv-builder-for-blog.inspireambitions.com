import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const root = process.cwd();
const port = 3300;
const url = `http://127.0.0.1:${port}/`;
const profileDir = join(root, ".lighthouseci", `profile-${process.pid}`);
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const thresholds = {
  performance: 0.9,
  accessibility: 0.95,
  largestContentfulPaint: 2500,
  cumulativeLayoutShift: 0.05,
  totalBlockingTime: 300,
};

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("The production server did not start within 30 seconds.");
}

await mkdir(profileDir, { recursive: true });
const server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
  cwd: root,
  stdio: "ignore",
});
let chrome;

try {
  await waitForServer();
  chrome = await launch({
    userDataDir: profileDir,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility"],
    formFactor: "mobile",
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 800,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttlingMethod: "simulate",
  });
  if (!result) throw new Error("Lighthouse returned no result.");

  const report = result.lhr;
  const values = {
    performance: report.categories.performance.score ?? 0,
    accessibility: report.categories.accessibility.score ?? 0,
    largestContentfulPaint: report.audits["largest-contentful-paint"].numericValue ?? Infinity,
    cumulativeLayoutShift: report.audits["cumulative-layout-shift"].numericValue ?? Infinity,
    totalBlockingTime: report.audits["total-blocking-time"].numericValue ?? Infinity,
  };

  console.log(`Performance: ${Math.round(values.performance * 100)}`);
  console.log(`Accessibility: ${Math.round(values.accessibility * 100)}`);
  console.log(`LCP: ${Math.round(values.largestContentfulPaint)} ms`);
  console.log(`CLS: ${values.cumulativeLayoutShift.toFixed(3)}`);
  console.log(`TBT: ${Math.round(values.totalBlockingTime)} ms`);

  const failures = [];
  if (values.performance < thresholds.performance) failures.push("Performance score is below 90.");
  if (values.accessibility < thresholds.accessibility) failures.push("Accessibility score is below 95.");
  if (values.largestContentfulPaint > thresholds.largestContentfulPaint) failures.push("LCP is above 2.5 seconds.");
  if (values.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) failures.push("CLS is above 0.05.");
  if (values.totalBlockingTime > thresholds.totalBlockingTime) failures.push("TBT is above 300 ms.");

  if (failures.length > 0) {
    throw new Error(failures.join(" "));
  }
} finally {
  if (chrome) {
    try {
      chrome.kill();
    } catch {
      // The browser may already have closed after the audit.
    }
  }
  server.kill();
  await new Promise((resolve) => setTimeout(resolve, 500));
  await rm(profileDir, { recursive: true, force: true, maxRetries: 10 }).catch(() => undefined);
}
