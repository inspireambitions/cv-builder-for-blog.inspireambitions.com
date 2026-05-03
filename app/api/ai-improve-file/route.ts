import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { getPath as getPdfWorkerPath } from "pdf-parse/worker";
import { analyseCvText } from "@/lib/ai-improve";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_EXTRACTED_CHARS = 80;

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isPlainText(file: File, extension: string) {
  return file.type === "text/plain" || extension === "txt";
}

function isDocx(file: File, extension: string) {
  return (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  );
}

function isPdf(file: File, extension: string) {
  return file.type === "application/pdf" || extension === "pdf";
}

function normaliseExtractedText(text: string) {
  return text.replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").trim();
}

async function extractPdfText(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  PDFParse.setWorker(getPdfWorkerPath());
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    return normaliseExtractedText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer });
  return normaliseExtractedText(result.value);
}

async function extractTextFromFile(file: File) {
  const extension = getExtension(file.name);

  if (isPlainText(file, extension)) {
    return normaliseExtractedText(await file.text());
  }

  if (isPdf(file, extension)) {
    return extractPdfText(file);
  }

  if (isDocx(file, extension)) {
    return extractDocxText(file);
  }

  if (extension === "doc" || file.type === "application/msword") {
    throw new Error("Legacy .doc files are not supported. Please upload a PDF, DOCX, or TXT file.");
  }

  throw new Error("Please upload a PDF, DOCX, or TXT file.");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing CV file. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5MB." },
        { status: 400 }
      );
    }

    const text = await extractTextFromFile(file);

    if (text.length < MIN_EXTRACTED_CHARS) {
      return NextResponse.json(
        {
          error:
            "We could not extract enough readable text from this CV. Please upload a text-based PDF, DOCX, or TXT file.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(await analyseCvText(text));
  } catch (error) {
    console.error("AI Improve file error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyse this CV file. Please try a PDF, DOCX, or TXT file.",
      },
      { status: 500 }
    );
  }
}
