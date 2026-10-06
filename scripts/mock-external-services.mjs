import { createServer } from "node:http";

const port = Number(process.env.MOCK_SERVICES_PORT || 3216);
const analysisAttempts = new Map();
const emailRequests = new Map();

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);

  if (request.method === "GET" && url.pathname === "/health") {
    return send(response, 200, { ok: true });
  }

  if (request.method === "GET" && url.pathname === "/domains") {
    return send(response, 200, {
      data: [
        {
          name: "inspireambitions.com",
          status: "verified",
          capabilities: { sending: "enabled" },
        },
      ],
    });
  }

  if (request.method === "POST" && url.pathname === "/contacts") {
    const body = await readJson(request);
    if (body.properties) {
      return send(response, 422, {
        message: "One or more properties do not exist",
      });
    }
    return send(response, 200, { id: "contact_test", object: "contact" });
  }

  if (request.method === "GET" && url.pathname === "/contacts") {
    return send(response, 200, { data: [] });
  }

  if (url.pathname === "/wp-json/ia-mail/v1/cv-welcome") {
    if (request.headers.authorization !== "Bearer test-bridge-key") {
      return send(response, 401, { message: "Authentication required" });
    }
    if (request.method === "GET") return send(response, 200, { ready: true });
    const body = await readJson(request);
    if (String(body.email || "").startsWith("idempotency-")) {
      const key = JSON.stringify([body.email, body.firstName, body.format]);
      const deduped = emailRequests.has(key);
      emailRequests.set(key, true);
      return send(response, 200, { sent: true, deduped });
    }
    return send(response, 503, { message: "Simulated email outage" });
  }

  if (request.method === "POST" && url.pathname === "/emails") {
    const body = await readJson(request);
    const recipient = String(body.to?.[0] || "");
    if (recipient.startsWith("idempotency-")) {
      const key = String(request.headers["idempotency-key"] || "");
      const serialised = JSON.stringify(body);
      if (emailRequests.has(key) && emailRequests.get(key) !== serialised) {
        return send(response, 409, {
          name: "invalid_idempotent_request",
          message: "This idempotency key was reused with a different request body.",
        });
      }
      emailRequests.set(key, serialised);
      return send(response, 200, { id: `email_${emailRequests.size}` });
    }
    return send(response, 503, { message: "Simulated email outage" });
  }

  if (request.method === "POST" && url.pathname === "/v1/messages") {
    const body = await readJson(request);
    if (body.tools?.some((tool) => tool.name === "save_cv_lines")) {
      const payload = JSON.parse(body.messages[0].content);
      if (payload.metadata.jobTitle === "Fixture outage") return send(response, 503, { error: { type: "overloaded_error", message: "Simulated outage" } });
      const lines = payload.metadata.jobTitle === "Fixture unsupported"
        ? [{ text: "Cleaned 40 rooms at Marriott with a HACCP certificate.", source: "Cleaned rooms." }, { text: "Changed towels.", source: "Changed towels." }, { text: "Cleaned rooms.", source: "Cleaned rooms." }]
        : [{ text: "Cleaned rooms.", source: "Cleaned rooms." }, { text: "Changed towels.", source: "Changed towels." }];
      return send(response, 200, { id: "msg_talk_test", type: "message", role: "assistant", model: body.model, content: [{ type: "tool_use", id: "toolu_talk", name: "save_cv_lines", input: { lines } }], stop_reason: "tool_use", stop_sequence: null, usage: { input_tokens: 20, output_tokens: 20 } });
    }
    const serialised = JSON.stringify(body.messages || []);
    const marker = serialised.includes("STRUCTURED_RETRY_TEST")
      ? "structured-retry"
      : "default";
    const attempt = (analysisAttempts.get(marker) || 0) + 1;
    analysisAttempts.set(marker, attempt);

    const content =
      marker === "structured-retry" && attempt === 1
        ? [{ type: "text", text: '{"extracted":[broken' }]
        : [
            {
              type: "tool_use",
              id: "toolu_test",
              name: "submit_cv_analysis",
              input: {
                extracted: {
                  name: "Mariam Hassan",
                  title: "Housekeeping Attendant",
                  email: "",
                  phone: "",
                  location: "Dubai",
                  linkedin: "",
                  summary: "",
                  experience: [],
                  education: [],
                  certifications: [
                    { name: "Chemical Handling Certificate", issuer: "Diversey", date: "", expiry: "" },
                  ],
                  skills: ["Room preparation", "Guest service"],
                  languages: [],
                },
                feedback: [
                  "**Summary:** Add a short profile for the target role.",
                  "**Experience:** Add results you can support with evidence.",
                  "**Skills:** Match your proven skills to the vacancy.",
                ],
              },
            },
          ];

    return send(response, 200, {
      id: `msg_test_${attempt}`,
      type: "message",
      role: "assistant",
      model: "claude-sonnet-5",
      content,
      stop_reason: content[0].type === "tool_use" ? "tool_use" : "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 20, output_tokens: 20 },
    });
  }

  return send(response, 404, { error: "Not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock external services listening on http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
