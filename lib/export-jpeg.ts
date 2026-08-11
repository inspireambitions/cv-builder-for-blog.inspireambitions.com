"use client";

import { saveAs } from "file-saver";

export async function exportJPEG(candidateName: string) {
  const html2canvas = (await import("html2canvas-pro")).default;
  const source = Array.from(document.querySelectorAll<HTMLElement>("#cv-render"))
    .find((element) => element.getClientRects().length > 0)
    ?? document.querySelector<HTMLElement>("#cv-render");
  if (!source) throw new Error("CV element not found");

  // Mobile keeps the desktop preview hidden. Capture a full-size off-screen
  // clone so export never depends on which preview panel is currently visible.
  const exportHost = document.createElement("div");
  exportHost.setAttribute("aria-hidden", "true");
  Object.assign(exportHost.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    background: "#ffffff",
    pointerEvents: "none",
    zIndex: "-1",
  });
  const clone = source.cloneNode(true) as HTMLElement;
  clone.id = "cv-export-render";
  exportHost.appendChild(clone);
  document.body.appendChild(exportHost);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 794,
    });
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("JPEG encoding failed")),
        "image/jpeg",
        0.95
      );
    });
    const filename = candidateName
      ? `${candidateName.replace(/\s+/g, "_")}_InspireAmbitions.jpg`
      : "InspireAmbitions_CV.jpg";
    saveAs(blob, filename);
  } finally {
    exportHost.remove();
  }
}
