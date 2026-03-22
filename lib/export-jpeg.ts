"use client";

import { saveAs } from "file-saver";

export async function exportJPEG(candidateName: string) {
  const html2canvas = (await import("html2canvas")).default;
  const el = document.getElementById("cv-render");
  if (!el) throw new Error("CV element not found");

  // Temporarily make the element visible at full size for capture
  const preview = el.closest("[data-preview-container]") as HTMLElement | null;
  const prevTransform = preview?.style.transform;
  const prevHeight = preview?.style.height;
  if (preview) {
    preview.style.transform = "none";
    preview.style.height = "auto";
  }

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: 794,
  });

  // Restore preview scaling
  if (preview && prevTransform !== undefined) {
    preview.style.transform = prevTransform;
    preview.style.height = prevHeight || "";
  }

  canvas.toBlob(
    (blob) => {
      if (blob) {
        const filename = candidateName
          ? `${candidateName.replace(/\s+/g, "_")}_InspireAmbitions.jpg`
          : "InspireAmbitions_CV.jpg";
        saveAs(blob, filename);
      }
    },
    "image/jpeg",
    0.95
  );
}
