import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, tool, subject, content } = await request.json();

    if (!email || !email.includes("@") || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Proxy to WordPress AJAX endpoint
    const wpData = new URLSearchParams();
    wpData.append("action", "tool_email_results");
    wpData.append("email", email);
    wpData.append("tool", tool || "CV Builder");
    wpData.append("subject", subject || "Your CV Score Report");
    wpData.append("content", content);
    wpData.append("source", "cv-builder");

    const wpRes = await fetch(
      "https://inspireambitions.com/wp-admin/admin-ajax.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: wpData.toString(),
        cache: "no-store",
      }
    );

    if (!wpRes.ok) {
      const wpText = await wpRes.text();
      console.error("WP email error:", wpRes.status, wpText);
      return NextResponse.json(
        { error: "Email delivery failed" },
        { status: 502 }
      );
    }

    const wpText = await wpRes.text();

    try {
      const wpJson = JSON.parse(wpText);

      if (wpJson.success) {
        return NextResponse.json({ success: true, data: wpJson.data || null });
      }

      console.error("WP email rejected:", wpText);
      return NextResponse.json(
        { error: "Email delivery failed" },
        { status: 502 }
      );
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error("Email proxy error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
