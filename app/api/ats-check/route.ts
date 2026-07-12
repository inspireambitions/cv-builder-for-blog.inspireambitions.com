import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getPath as getPdfWorkerPath } from "pdf-parse/worker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.type !== "application/pdf") {
      return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "PDF must be under 8MB." }, { status: 400 });
    }

    const expected = JSON.parse(clean(formData.get("expected")) || "{}") as {
      name?: string;
      email?: string;
      phone?: string;
      skills?: string[];
    };
    PDFParse.setWorker(getPdfWorkerPath());
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    let text = "";
    try {
      text = (await parser.getText()).text.replace(/\s+/g, " ").trim();
    } finally {
      await parser.destroy();
    }

    const lower = text.toLowerCase();
    const required = [expected.name, expected.email, expected.phone]
      .map(clean)
      .filter(Boolean);
    const missingContact = required.filter((value) => {
      const compact = value.replace(/[^a-z0-9@.+]/gi, "").toLowerCase();
      const compactText = lower.replace(/[^a-z0-9@.+]/g, "");
      return !lower.includes(value.toLowerCase()) && !compactText.includes(compact);
    });
    const skills = Array.isArray(expected.skills) ? expected.skills.filter(Boolean).slice(0, 20) : [];
    const coveredSkills = skills.filter((skill) => lower.includes(skill.toLowerCase()));
    const brokenGlyphs = (text.match(/\uFFFD|\(cid:\d+\)/g) ?? []).length;
    const decorativeContactGlyphs = (text.match(/[\u2709\u260E\u{1F4CD}\u{1F517}]/gu) ?? []).length;
    const checks = [
      { label: "Readable text layer", passed: text.length >= 120, detail: `${text.length.toLocaleString()} characters extracted` },
      { label: "Contact details", passed: missingContact.length === 0, detail: missingContact.length ? `Missing: ${missingContact.join(", ")}` : "Name, email and phone remain readable" },
      { label: "Character integrity", passed: brokenGlyphs === 0, detail: brokenGlyphs ? `${brokenGlyphs} broken glyph markers found` : "No broken glyph markers found" },
      { label: "ATS-safe contact text", passed: decorativeContactGlyphs === 0, detail: decorativeContactGlyphs ? `${decorativeContactGlyphs} decorative contact icons entered the text layer` : "No decorative contact icons in the text layer" },
      { label: "Skill coverage", passed: skills.length === 0 || coveredSkills.length / skills.length >= 0.7, detail: skills.length ? `${coveredSkills.length}/${skills.length} selected skills found` : "No selected skills to check" },
    ];
    return NextResponse.json({
      passed: checks.every((check) => check.passed),
      score: Math.round((checks.filter((check) => check.passed).length / checks.length) * 100),
      checks,
    });
  } catch (error) {
    console.error("ATS PDF check error:", error);
    return NextResponse.json({ error: "The PDF was created, but its ATS check could not be completed." }, { status: 500 });
  }
}
