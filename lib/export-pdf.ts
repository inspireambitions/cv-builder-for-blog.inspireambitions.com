"use client";

import { saveAs } from "file-saver";

export async function exportPDF(candidateName: string) {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

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

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

  const filename = candidateName
    ? `${candidateName.replace(/\s+/g, "_")}_InspireAmbitions_CV.pdf`
    : "InspireAmbitions_CV.pdf";

  const pdfBlob = pdf.output("blob");
  saveAs(pdfBlob, filename);
}
