"use client";

import { saveAs } from "file-saver";
import type { CVState } from "./types";
import {
  formatSectorCredential,
  getSelectedSectorCredentials,
  getUAEHeaderParts,
} from "./uae";

function filenameFor(state: CVState, extension: string): string {
  return state.personal.name
    ? `${state.personal.name.replace(/\s+/g, "_")}_InspireAmbitions_CV.${extension}`
    : `InspireAmbitions_CV.${extension}`;
}

function stripBulletPrefix(value: string): string {
  return value.replace(/^[-•]\s*/, "").trim();
}

export async function exportPDF(state: CVState) {
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
    ensureSpace(14);
    y += 3;
    pdf.setDrawColor(26, 39, 68);
    pdf.setLineWidth(0.4);
    writeLines(text.toUpperCase(), {
      size: 11,
      style: "bold",
      color: [26, 39, 68],
      after: 1.5,
    });
    pdf.line(marginX, y, pageWidth - marginX, y);
    y += 4;
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
    state.personal.phone,
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
    after: 7,
  });

  if (state.summary.trim()) {
    sectionHeading("Professional Summary");
    writeLines(state.summary, { after: 5 });
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
          after: 1.5,
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
        .map((lang) => `${lang.language} - ${lang.level}`)
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

  const blob = pdf.output("blob");
  saveAs(blob, filenameFor(state, "pdf"));
}
