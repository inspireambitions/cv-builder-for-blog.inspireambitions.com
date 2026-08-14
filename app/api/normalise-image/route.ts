import { NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function isSupportedImage(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("image/") ||
    [".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp"].some((extension) =>
      name.endsWith(extension)
    )
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    }

    if (!isSupportedImage(file)) {
      return NextResponse.json(
        { error: "Please upload JPG, PNG, WEBP, HEIC, or HEIF." },
        { status: 400 }
      );
    }

    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 16_000_000 }).rotate();
    const metadata = await image.metadata();
    const { data: jpeg, info } = await image
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    return NextResponse.json({
      dataUrl: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
      mimeType: "image/jpeg",
      strippedExif: true,
      crop: "user",
      originalWidth: metadata.width ?? info.width,
      originalHeight: metadata.height ?? info.height,
      outputWidth: info.width,
      outputHeight: info.height,
    });
  } catch (error) {
    console.error("Image normalise error:", error);
    return NextResponse.json(
      { error: "We could not process this image. Try JPG or PNG if HEIC fails." },
      { status: 422 }
    );
  }
}
