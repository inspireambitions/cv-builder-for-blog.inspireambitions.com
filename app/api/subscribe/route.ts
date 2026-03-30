import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const SENDY_URL = process.env.SENDY_URL || "https://inspire-ambitions.sendybay.com";
    const SENDY_API_KEY = process.env.SENDY_API_KEY || "";
    const SENDY_LIST_ID = process.env.SENDY_LIST_ID || "";

    const formData = new URLSearchParams();
    formData.append("api_key", SENDY_API_KEY);
    formData.append("email", email);
    formData.append("name", firstName || "");
    formData.append("list", SENDY_LIST_ID);
    formData.append("boolean", "true");

    const res = await fetch(`${SENDY_URL}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const text = await res.text();

    // Sendy returns plain text responses when boolean=true
    // "1" = success, "Already subscribed." = already exists
    if (text.trim() === "1" || text.includes("Already subscribed")) {
      return NextResponse.json({
        success: true,
        existing: text.includes("Already subscribed"),
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
