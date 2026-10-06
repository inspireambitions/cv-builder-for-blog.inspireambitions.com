import { expect, test } from "@playwright/test";
import { MEASUREMENT_EVENTS, measurementPayload, sendMeasurement } from "../lib/measurement";

test("every planned event reaches the mocked capture endpoint", async () => {
  const requests: { url: string; body: string }[] = [];
  const transport: typeof fetch = async (input, init) => {
    requests.push({ url: String(input), body: String(init?.body) });
    return new Response("{}", { status: 200 });
  };
  for (const event of MEASUREMENT_EVENTS) expect(await sendMeasurement(event, { questionId: "work-history", lang: "ur", format: "jpeg" }, "fictional-session", { enabled: true, optedIn: true, token: "test-project-token", host: "https://eu.i.posthog.com" }, transport)).toBe(true);
  expect(requests).toHaveLength(MEASUREMENT_EVENTS.length);
  expect(requests.map((request) => JSON.parse(request.body).event)).toEqual([...MEASUREMENT_EVENTS]);
  expect(requests.every((request) => request.url === "https://eu.i.posthog.com/i/v0/e")).toBe(true);
});

test("capture strips personal data and rejects unknown events and settings", async () => {
  const unsafe = { questionId: "someone@example.com", lang: "Secret Name", format: "private-file.pdf", stepKey: "Jane Doe", email: "someone@example.com", cv: "private CV", url: "https://site/#resume=secret" };
  const payload = measurementPayload("cv_exported", unsafe, "fictional-session", "test-token");
  expect(payload?.properties).toEqual({ product: "cv-builder", measurement_version: "1", $process_person_profile: false, $geoip_disable: true });
  expect(measurementPayload("$identify", {}, "fictional", "test-token")).toBeNull();
  let requests = 0;
  const transport: typeof fetch = async () => { requests++; return new Response("{}"); };
  const base = { enabled: true, optedIn: true, token: "test-token", host: "https://us.i.posthog.com" };
  for (const override of [{ enabled: false }, { optedIn: false }, { token: "" }, { host: "https://unapproved.example" }]) expect(await sendMeasurement("cv_exported", {}, "fictional", { ...base, ...override }, transport)).toBe(false);
  expect(requests).toBe(0);
  expect(await sendMeasurement("cv_exported", {}, "fictional", base, async () => { throw new Error("offline"); })).toBe(false);
});
