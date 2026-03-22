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

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY || "",
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName || "",
        },
        listIds: [2],
        updateEnabled: true,
      }),
    });

    if (res.ok || res.status === 204) {
      return NextResponse.json({ success: true });
    }

    const data = await res.json().catch(() => ({}));

    // Brevo returns "duplicate_parameter" for existing contacts
    if (data.code === "duplicate_parameter") {
      return NextResponse.json({ success: true, existing: true });
    }

    return NextResponse.json(
      { error: data.message || "Subscription failed" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
