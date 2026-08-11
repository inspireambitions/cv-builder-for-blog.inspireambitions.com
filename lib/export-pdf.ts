"use client";

import { saveAs } from "file-saver";
import type { CVState } from "./types";
import type { ExportOptions } from "./export-options";
import { isRecruiterReady } from "./export-options";
import { normaliseUAEPhoneForDisplay } from "./format";
import {
  formatSectorCredential,
  getSelectedSectorCredentials,
  getUAEHeaderParts,
} from "./uae";

function filenameFor(state: CVState, extension: string, suffix = ""): string {
  const safeSuffix = suffix ? `_${suffix}` : "";
  return state.personal.name
    ? `${state.personal.name.replace(/\s+/g, "_")}_InspireAmbitions_CV${safeSuffix}.${extension}`
    : `InspireAmbitions_CV${safeSuffix}.${extension}`;
}

function stripBulletPrefix(value: string): string {
  return value.replace(/^[-•]\s*/, "").trim();
}

function imageTypeFromDataUrl(value: string): "JPEG" | "PNG" | "WEBP" {
  if (value.startsWith("data:image/png")) return "PNG";
  if (value.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

export async function buildPDF(state: CVState, options: ExportOptions = {}) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 18;
  const maxWidth = pageWidth - marginX * 2;
  let y = 18;
  const recruiterReady = isRecruiterReady(options);

  function ensureSpace(needed = 10) {
    if (y + needed <= pageHeight - 18) return;
    pdf.addPage();
    y = 18;
  }

  function writeLines(
    text: string,
    options: {
      size?: number;
      style?: "normal" | "bold" | "italic";
      color?: [number, number, number];
      align?: "left" | "center";
      before?: number;
      after?: number;
      lineHeight?: number;
      indent?: number;
    } = {}
  ) {
    if (!text.trim()) return;
    const {
      size = 10.5,
      style = "normal",
      color = [34, 34, 34],
      align = "left",
      before = 0,
      after = 3,
      lineHeight = size * 0.42,
      indent = 0,
    } = options;

    y += before;
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text, maxWidth - indent);
    ensureSpace(lines.length * lineHeight + after);

    const x = align === "center" ? pageWidth / 2 : marginX + indent;
    pdf.text(lines, x, y, {
      align,
      maxWidth: maxWidth - indent,
      lineHeightFactor: 1.25,
    });
    y += lines.length * lineHeight + after;
  }

  function sectionHeading(text: string) {
    ensureSpace(18);
    y += 2;
    pdf.setDrawColor(26, 39, 68);
    pdf.setLineWidth(0.4);
    writeLines(text.toUpperCase(), {
      size: 11,
      style: "bold",
      color: [26, 39, 68],
      after: 1,
    });
    pdf.line(marginX, y, pageWidth - marginX, y);
    y += 2.5;
  }

  if (recruiterReady && state.photo) {
    try {
      pdf.addImage(state.photo, imageTypeFromDataUrl(state.photo), marginX, 16, 24, 24);
    } catch {
      // Keep the text export working even if a browser cannot decode the image.
    }
  }

  writeLines(state.personal.name || "Your Name", {
    size: 20,
    style: "bold",
    align: "center",
    after: 2,
  });

  writeLines(state.personal.title, {
    size: 12,
    color: [85, 85, 85],
    align: "center",
    after: 2,
  });

  const contactParts = [
    state.personal.email,
    normaliseUAEPhoneForDisplay(state.personal.phone),
    state.personal.location,
    state.personal.linkedin,
  ].filter(Boolean);
  writeLines(contactParts.join(" | "), {
    size: 9.5,
    color: [80, 80, 80],
    align: "center",
    after: 2,
  });

  writeLines(getUAEHeaderParts(state).join(" | "), {
    size: 9.5,
    color: [72, 110, 74],
    align: "center",
    after: 5,
  });

  if (state.summary.trim()) {
    sectionHeading("Professional Summary");
    writeLines(state.summary, { after: 4 });
  }

  const filledExperience = state.experience.filter(
    (entry) => entry.role.trim() || entry.company.trim()
  );
  if (filledExperience.length > 0) {
    sectionHeading("Work Experience");
    for (const exp of filledExperience) {
      writeLines(
        [exp.role, exp.company].filter(Boolean).join(" - "),
        { size: 11.5, style: "bold", after: 1 }
      );
      writeLines([exp.location, exp.dates].filter(Boolean).join(" | "), {
        size: 9.5,
        color: [100, 100, 100],
        after: 1.5,
      });
      writeLines(exp.companyDesc, {
        size: 9.5,
        style: "italic",
        color: [100, 100, 100],
        after: 1.5,
      });
      for (const bullet of exp.description.split("\n").filter(Boolean)) {
        writeLines(`- ${stripBulletPrefix(bullet)}`, {
          size: 10.2,
          indent: 4,
          after: 0.8,
        });
      }
      writeLines(exp.gap ? `Career note: ${exp.gap}` : "", {
        size: 9.5,
        style: "italic",
        color: [100, 100, 100],
        after: 3,
      });
    }
  }

  const filledEducation = state.education.filter(
    (entry) => entry.degree.trim() || entry.institution.trim()
  );
  if (filledEducation.length > 0) {
    sectionHeading("Education");
    for (const edu of filledEducation) {
      writeLines([edu.degree, edu.institution].filter(Boolean).join(" - "), {
        size: 10.8,
        style: "bold",
        after: 1,
      });
      writeLines([edu.year, edu.grade].filter(Boolean).join(" | "), {
        size: 9.5,
        color: [100, 100, 100],
        after: 2,
      });
    }
  }

  const filledCerts = state.certifications.filter((entry) =>
    entry.name.trim()
  );
  const sectorCredentials = getSelectedSectorCredentials(state);
  if (filledCerts.length > 0 || sectorCredentials.length > 0) {
    sectionHeading("Certifications & Credentials");
    for (const credential of sectorCredentials) {
      writeLines(formatSectorCredential(credential), {
        size: 10.5,
        style: "bold",
        after: 1.5,
      });
    }
    for (const cert of filledCerts) {
      writeLines([cert.name, cert.issuer].filter(Boolean).join(" - "), {
        size: 10.5,
        style: "bold",
        after: 1,
      });
      writeLines(
        [cert.date, cert.expiry ? `Expiry: ${cert.expiry}` : ""]
          .filter(Boolean)
          .join(" | "),
        { size: 9.5, color: [100, 100, 100], after: 2 }
      );
    }
  }

  const filledSkills = state.skills.filter((skill) => skill.trim());
  if (filledSkills.length > 0) {
    sectionHeading("Skills");
    writeLines(filledSkills.join(", "), { after: 5 });
  }

  const filledLanguages = state.languages.filter((lang) =>
    lang.language.trim()
  );
  if (filledLanguages.length > 0) {
    sectionHeading("Languages");
    writeLines(
      filledLanguages
        .map((lang) => [lang.language, lang.level].filter(Boolean).join(" - "))
        .join(", "),
      { after: 5 }
    );
  }

  const filledAchievements = state.achievements.filter((entry) =>
    entry.title.trim()
  );
  if (filledAchievements.length > 0) {
    sectionHeading("Achievements & Awards");
    for (const achievement of filledAchievements) {
      writeLines(achievement.title, { size: 10.5, style: "bold", after: 1 });
      writeLines(achievement.body, { after: 1.5 });
      writeLines(
        [achievement.awardingBody, achievement.year].filter(Boolean).join(" | "),
        { size: 9.5, color: [100, 100, 100], after: 2 }
      );
    }
  }

  return {
    blob: pdf.output("blob"),
    filename: filenameFor(state, "pdf", recruiterReady ? "Recruiter" : "ATS"),
    pageCount: pdf.getNumberOfPages(),
  };
}

export async function exportPDF(state: CVState, options: ExportOptions = {}) {
  if (isRecruiterReady(options)) {
    const element = document.getElementById("cv-render");
    if (element) {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const preview = element.closest("[data-preview-container]") as HTMLElement | null;
      const previousTransform = preview?.style.transform;
      const previousHeight = preview?.style.height;
      if (preview) { preview.style.transform = "none"; preview.style.height = "auto"; }
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794 });
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageHeight = pageWidth * canvas.height / canvas.width;
        let remaining = imageHeight;
        let offset = 0;
        const image = canvas.toDataURL("image/jpeg", 0.96);
        pdf.addImage(image, "JPEG", 0, offset, pageWidth, imageHeight);
        remaining -= pageHeight;
        while (remaining > 0) {
          offset -= pageHeight;
          pdf.addPage();
          pdf.addImage(image, "JPEG", 0, offset, pageWidth, imageHeight);
          remaining -= pageHeight;
        }
        const output = { blob: pdf.output("blob"), filename: filenameFor(state, "pdf", "Recruiter"), pageCount: pdf.getNumberOfPages() };
        saveAs(output.blob, output.filename);
        return output;
      } finally {
        if (preview) { preview.style.transform = previousTransform ?? ""; preview.style.height = previousHeight ?? ""; }
      }
    }
  }
  const output = await buildPDF(state, options);
  saveAs(output.blob, output.filename);
  return output;
}
