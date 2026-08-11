import { createServer } from "node:http";

const port = Number(process.env.MOCK_SERVICES_PORT || 3216);
const analysisAttempts = new Map();

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

  if (request.method === "POST" && url.pathname === "/emails") {
    return send(response, 503, { message: "Simulated email outage" });
  }

  if (request.method === "POST" && url.pathname === "/v1/messages") {
    const body = await readJson(request);
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
