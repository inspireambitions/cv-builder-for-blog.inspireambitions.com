import { expect, test } from "@playwright/test";

test("download gate survives a Resend email outage", async ({ request }) => {
  const response = await request.post("/api/subscribe", {
    data: {
      email: "candidate@gmail.com",
      firstName: "Mariam",
      source: "cv-builder-download-gate",
      format: "pdf_ats",
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    success: true,
    contactSaved: true,
    emailSent: false,
    warning: expect.stringContaining("download is ready"),
  });
});

test("download gate health check verifies the Resend sender", async ({ request }) => {
  const response = await request.get("/api/subscribe");
  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
});

test("email idempotency follows the complete request body", async ({ request }, testInfo) => {
  const email = `idempotency-${testInfo.project.name}@example.com`;
  const first = await request.post("/api/subscribe", {
    data: { email, firstName: "Mariam", format: "pdf_ats" },
  });
  const repeated = await request.post("/api/subscribe", {
    data: { email, firstName: "Mariam", format: "pdf_ats" },
  });
  const changed = await request.post("/api/subscribe", {
    data: { email, firstName: "Mary", format: "word" },
  });

  for (const response of [first, repeated, changed]) {
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      contactSaved: true,
      emailSent: true,
    });
  }
});

test("AI CV analysis retries an invalid response with structured output", async ({
  request,
}) => {
  const response = await request.post("/api/ai-improve-file", {
    multipart: {
      file: {
        name: "candidate-cv.txt",
        mimeType: "text/plain",
        buffer: Buffer.from(
          "STRUCTURED_RETRY_TEST Mariam Hassan is a Housekeeping Attendant in Dubai. She prepares guest rooms, follows hygiene standards, reports maintenance faults and supports guest requests with her team."
        ),
      },
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.extracted.name).toBe("Mariam Hassan");
  expect(body.extracted.certifications).toEqual([
    {
      name: "Chemical Handling Certificate",
      issuer: "Diversey",
      date: "",
      expiry: "",
    },
  ]);
  expect(body.feedback).toHaveLength(3);
});
