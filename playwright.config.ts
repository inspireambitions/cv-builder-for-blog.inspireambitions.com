import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3215";
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: useExternalServer
    ? undefined
    : [
        {
          command: "node scripts/mock-external-services.mjs",
          url: "http://127.0.0.1:3216/health",
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
        {
          command: "npm run start:test",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            RESEND_API_KEY: "test-resend-key",
            RESEND_API_BASE: "http://127.0.0.1:3216",
            RESEND_FROM_EMAIL: "Inspire Ambitions <info@inspireambitions.com>",
            ANTHROPIC_API_KEY: "test-anthropic-key",
            ANTHROPIC_API_BASE: "http://127.0.0.1:3216",
          },
        },
      ],
  projects: [
    {
      name: "mobile-360",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true },
    },
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
});
