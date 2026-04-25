import { NextResponse } from "next/server";

const SENDY_URL = process.env.SENDY_URL || "https://inspire-ambitions.sendybay.com";
const SENDY_LIST_ID = process.env.SENDY_LIST_ID || "M763FI3Su6ageZWvxV2v6eSg";

function isSendySuccess(responseText: string) {
  const body = responseText.trim().toLowerCase();
  return body === "1" || body === "true" || body.includes("already subscribed");
}

export async function POST(req: Request) {
  try {
    const { email, firstName, source } = await req.json();
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const SENDY_API_KEY = process.env.SENDY_API_KEY || "";

    const formData = new URLSearchParams();
    if (SENDY_API_KEY) {
      formData.append("api_key", SENDY_API_KEY);
    }
    formData.append("email", normalizedEmail);
    formData.append("name", firstName || "");
    formData.append("list", SENDY_LIST_ID);
    formData.append("boolean", "true");
    formData.append("subform", "yes");
    formData.append("Source", source || "CV Builder");

    const res = await fetch(`${SENDY_URL}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    });

    const text = await res.text();

    if (res.ok && isSendySuccess(text)) {
      return NextResponse.json({
        success: true,
        existing: text.toLowerCase().includes("already subscribed"),
      });
    }

    return NextResponse.json(
      { error: text || "Subscription failed" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
