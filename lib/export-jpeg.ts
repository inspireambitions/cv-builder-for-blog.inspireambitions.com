"use client";

import { saveAs } from "file-saver";
import { captureCV } from "./capture-cv";
import type { CVState } from "./types";

export async function exportJPEG(draft: CVState) {
  const canvas = await captureCV(draft);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("JPEG encoding failed")),
      "image/jpeg",
      0.95
    );
  });
  const name = draft.personal.name;
  const filename = name
    ? `${name.replace(/\s+/g, "_")}_InspireAmbitions.jpg`
    : "InspireAmbitions_CV.jpg";
  saveAs(blob, filename);
}
