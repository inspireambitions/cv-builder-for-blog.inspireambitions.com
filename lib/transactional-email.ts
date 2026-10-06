function bridgeSecret() {
  const secret = process.env.IA_CV_EMAIL_BRIDGE_SECRET;
  if (!secret) throw new Error("CV email bridge is not configured");
  return secret;
}

function bridgeURL() {
  const url = new URL(process.env.IA_CV_EMAIL_BRIDGE_URL || "https://inspireambitions.com/wp-json/ia-mail/v1/cv-welcome");
  if (url.origin !== "https://inspireambitions.com" && url.hostname !== "127.0.0.1") {
    throw new Error("Invalid CV email bridge destination");
  }
  return url.toString();
}

export async function verifyCVEmailBridge() {
  const response = await fetch(bridgeURL(), {
    headers: { Authorization: `Bearer ${bridgeSecret()}` },
    cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok || (await response.json()).ready !== true) {
    throw new Error("CV email bridge is not ready");
  }
}

export async function sendCVConfirmation(email: string, firstName: string, format: string) {
  const secret = bridgeSecret();
  const response = await fetch(bridgeURL(), {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName, format }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`CV confirmation returned ${response.status}`);
  const result = await response.json() as { sent?: boolean };
  if (result.sent !== true) throw new Error("CV confirmation was not accepted");
}
