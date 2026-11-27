"use client";

import { saveAs } from "file-saver";
import type { CVState } from "./types";
import type { ExportOptions } from "./export-options";
import { isRecruiterReady } from "./export-options";
import { cvContactParts, finishCV } from "./cv-finish";
import { SECTION_LABELS, TEMPLATE_CONFIG } from "./template-config";
import { BULLET_GAP_PT, JOB_GAP_PT, MM_PER_POINT, chooseBodyLayout, contactLines, packPages, type BodyLayout } from "./cv-page-layout";
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

function imageTypeFromDataUrl(value: string): "JPEG" | "PNG" | "WEBP" {
  if (value.startsWith("data:image/png")) return "PNG";
  if (value.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

const arabic = /\p{Script=Arabic}/u;
const nativePdfText = /^[\x20-\x7e\xa0-\xff\n\r\t€‘’“”–—•…™œŒŠšŽžŸ]+$/u;
const arabicFontNames = ["Amiri-Regular.ttf", "Amiri-Bold.ttf"];

async function fetchArabicFont(file: string) {
  const response = await fetch(`/cv-fonts/${file}`);
  if (!response.ok) throw new Error("PDF typeface could not load");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 12_000) binary += String.fromCharCode(...bytes.subarray(i, i + 12_000));
  return btoa(binary);
}

export async function buildPDF(draft: CVState, options: ExportOptions = {}, loadArabicFont = fetchArabicFont) {
  const { cv } = finishCV(draft, options.asOf);
  const rtl = cv.cvLanguage === "ar";
  const labels = SECTION_LABELS[cv.cvLanguage];
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const hasArabic = rtl || arabic.test(JSON.stringify(cv));
  let arabicLoaded = false;
  if (hasArabic) {
    try {
      const [regular, bold] = await Promise.all(arabicFontNames.map((name) => loadArabicFont(name)));
      for (const [style, name, data] of [["normal", arabicFontNames[0], regular], ["bold", arabicFontNames[1], bold]]) {
        pdf.addFileToVFS(name, data);
        pdf.addFont(name, "amiri", style);
      }
      arabicLoaded = true;
    } catch {
      // Keep the preview-based fallback available if a font cannot load.
    }
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 18;
  const marginY = 18;
  const maxWidth = pageWidth - marginX * 2;
  const recruiterReady = isRecruiterReady(options);
  const config = TEMPLATE_CONFIG[cv.template];
  const colour = config.accent;
  let firstPageInset = 0;
  type RowOptions = {
      size?: number;
      style?: "normal" | "bold" | "italic";
      color?: [number, number, number] | string;
      align?: "left" | "right" | "center";
      before?: number;
      after?: number;
      keepWithNext?: boolean;
      bullet?: boolean;
      heading?: boolean;
      contact?: boolean;
  };
  const rows: { text: string; options: RowOptions }[] = [];
  function writeLines(text: string, options: RowOptions = {}) {
    if (text.trim()) rows.push({ text, options });
  }

  function sectionHeading(text: string) {
    writeLines(text.toUpperCase(), {
      size: 11, style: "bold", color: colour, heading: true, keepWithNext: true,
    });
  }

  if (recruiterReady && config.photo !== "hidden" && cv.photoPreference === "photo" && cv.photo) {
    try {
      pdf.addImage(cv.photo, imageTypeFromDataUrl(cv.photo), pageWidth / 2 - 12, marginY, 24, 24);
      firstPageInset = 28;
    } catch {
      // Keep the text export working even if a browser cannot decode the image.
    }
  }

  writeLines(cv.personal.name, {
    size: 20,
    style: "bold",
    align: "center",
    after: 1, keepWithNext: true,
  });

  writeLines(cv.personal.title, {
    size: 12,
    color: [85, 85, 85],
    align: "center",
    after: 1, keepWithNext: true,
  });

  function writeContact(parts: string[], color: string) {
    pdf.setFontSize(9.5);
    for (const line of contactLines(parts, (text) => {
      pdf.setFont(arabicLoaded && arabic.test(text) ? "amiri" : "helvetica", "normal");
      return pdf.getTextWidth(text);
    }, maxWidth)) {
      writeLines(line, { size: 9.5, color, align: "center", contact: true });
    }
  }
  writeContact(cvContactParts(cv), "#505050");
  writeContact(getUAEHeaderParts(cv), "#486e4a");

  if (cv.summary.trim()) {
    sectionHeading(labels.summary);
    writeLines(cv.summary, { after: 3 });
  }

  const filledExperience = cv.experience.filter(
    (entry) => entry.role.trim() || entry.company.trim()
  );
  if (filledExperience.length > 0) {
    sectionHeading(labels.experience);
    for (const [index, exp] of filledExperience.entries()) {
      writeLines(
        [exp.role, exp.company].filter(Boolean).join(", "),
        { size: 11.5, style: "bold", before: index ? JOB_GAP_PT * MM_PER_POINT : 0, keepWithNext: true }
      );
      writeLines([exp.location, exp.dates].filter(Boolean).join(" | "), {
        size: 9.5,
        color: [100, 100, 100],
        after: 1.5, keepWithNext: Boolean(exp.description || exp.companyDesc),
      });
      writeLines(exp.companyDesc, {
        size: 9.5,
        style: "italic",
        color: [100, 100, 100],
        after: 1.5, keepWithNext: Boolean(exp.description),
      });
      for (const bullet of exp.description.split("\n").filter(Boolean)) {
        writeLines(bullet, { bullet: true, after: BULLET_GAP_PT * MM_PER_POINT });
      }
      writeLines(exp.gap ? `Career note: ${exp.gap}` : "", {
        size: 9.5,
        style: "italic",
        color: [100, 100, 100],
        after: 3,
      });
    }
  }

  const filledEducation = cv.education.filter(
    (entry) => entry.degree.trim() || entry.institution.trim()
  );
  if (filledEducation.length > 0) {
    sectionHeading(labels.education);
    for (const edu of filledEducation) {
      writeLines([[edu.degree, edu.institution].filter(Boolean).join(", "), edu.year, edu.grade].filter(Boolean).join(" | "), {
        size: 10.8,
        style: "bold",
        after: 1,
      });
    }
  }

  const filledSkills = cv.skills.filter((skill) => skill.trim());
  if (filledSkills.length > 0) {
    sectionHeading(labels.skills);
    writeLines(filledSkills.join(" | "), { after: 3 });
  }

  const filledLanguages = cv.languages.filter((lang) =>
    lang.language.trim()
  );
  if (filledLanguages.length > 0) {
    sectionHeading(labels.languages);
    writeLines(
      filledLanguages
        .map((lang) => [lang.language, lang.level].filter(Boolean).join(" - "))
        .join(", "),
      { after: 5 }
    );
  }

  const filledCerts = cv.certifications.filter((entry) =>
    entry.name.trim()
  );
  const sectorCredentials = getSelectedSectorCredentials(cv);
  if (filledCerts.length > 0 || sectorCredentials.length > 0) {
    sectionHeading(labels.credentials);
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

  const filledAchievements = cv.achievements.filter((entry) =>
    entry.title.trim()
  );
  if (filledAchievements.length > 0) {
    sectionHeading(labels.achievements);
    for (const achievement of filledAchievements) {
      writeLines([achievement.title, achievement.awardingBody, achievement.year].filter(Boolean).join(" | "),
        { size: 10.5, style: "bold", after: 1 });
      writeLines(achievement.body, { after: 1.5 });
    }
  }

  const extras = [
    { label: labels.volunteer, values: cv.volunteer.map((entry) => [[entry.role, entry.org].filter(Boolean).join(", "), entry.dates, entry.impact]) },
    { label: labels.projects, values: cv.projects.map((entry) => [entry.name, entry.description, entry.outcomes, entry.url]) },
    { label: labels.publications, values: cv.publications.map((entry) => [[entry.title, entry.outlet].filter(Boolean).join(", "), [entry.date, entry.url].filter(Boolean).join(" | ")]) },
    { label: labels.memberships, values: cv.memberships.map((entry) => [entry.org, [entry.level, entry.year].filter(Boolean).join(" | ")]) },
  ];
  for (const { label, values } of extras) {
    if (!values.some((entry) => entry.some((value) => value?.trim()))) continue;
    sectionHeading(label);
    for (const value of values) writeLines(value.filter(Boolean).join(" | "));
  }

  function measure(layout: BodyLayout) {
    let section = 0;
    return rows.flatMap(({ text, options }) => {
      const scriptFont = arabicLoaded && arabic.test(text);
      const style = scriptFont && options.style === "italic" ? "normal" : options.style ?? "normal";
      const font = scriptFont ? "amiri" : options.heading && recruiterReady && config.heading === "serif" ? "times" : "helvetica";
      pdf.setFont(font, style);
      let size = options.size ?? layout.size;
      pdf.setFontSize(size);
      if (options.contact && pdf.getTextWidth(text) > maxWidth) {
        size *= maxWidth / pdf.getTextWidth(text);
        pdf.setFontSize(size);
      }
      const indent = options.bullet ? 4 : 0;
      const lines: string[] = options.contact ? [text] : pdf.splitTextToSize(text, maxWidth - indent);
      const before = options.heading ? (section++ ? layout.sectionGap * MM_PER_POINT : 2) : options.before ?? 0;
      const lineHeight = size * MM_PER_POINT * layout.leading;
      return lines.map((line, index) => {
        const first = index === 0;
        const last = index === lines.length - 1;
        const top = first ? before : 0;
        const divider = !!options.heading && last;
        return {
          line, size, style, font, indent, top, divider, options,
          rtl: rtl || /^[^\p{L}]*\p{Script=Arabic}/u.test(line),
          marker: options.bullet && first,
          keepWithNext: !last || options.keepWithNext,
          height: top + lineHeight + (last ? options.after ?? 0 : 0) + (divider ? 2 : 0),
        };
      });
    });
  }

  const capacity = pageHeight - marginY * 2;
  const firstCapacity = capacity - firstPageInset;
  const breaks = Math.max(0, rows.filter((row) => row.options.heading).length - 1);
  const layout = chooseBodyLayout((body) => measure(body).reduce((height, line) => height + line.height, 0), breaks, firstCapacity);
  const pages = packPages(measure(layout), capacity, firstCapacity);
  const pageLineCounts: number[] = [];
  const pageFills: number[] = [];
  for (const [index, page] of pages.entries()) {
    if (index) pdf.addPage();
    let y = marginY + (index === 0 ? firstPageInset : 0);
    for (const row of page) {
      const baseline = y + row.top + row.size * MM_PER_POINT;
      pdf.setFont(row.font, row.style);
      pdf.setFontSize(row.size);
      const textColour = row.options.color ?? "#222222";
      if (typeof textColour === "string") pdf.setTextColor(textColour);
      else pdf.setTextColor(...textColour);
      const align = row.options.align ?? (row.rtl ? "right" : "left");
      if (row.marker) {
        pdf.setFont("helvetica", "normal");
        pdf.text("•", row.rtl ? pageWidth - marginX : marginX, baseline, { align: row.rtl ? "right" : "left" });
        pdf.setFont(row.font, row.style);
      }
      const x = align === "center" ? pageWidth / 2 : align === "right" ? pageWidth - marginX - row.indent : marginX + row.indent;
      pdf.text(row.line, x, baseline, row.font === "amiri"
        ? { align, isInputRtl: row.rtl, isInputVisual: false, isOutputVisual: true }
        : { align });
      if (row.divider) {
        pdf.setDrawColor(colour);
        pdf.setLineWidth(0.3);
        pdf.line(marginX, baseline + 1.6, pageWidth - marginX, baseline + 1.6);
      }
      y += row.height;
    }
    pageLineCounts.push(page.length);
    pageFills.push(y / pageHeight);
  }
  return {
    blob: pdf.output("blob"),
    filename: filenameFor(cv, "pdf", recruiterReady ? "Recruiter" : "ATS"),
    pageCount: pdf.getNumberOfPages(),
    pageLineCounts,
    pageFills,
    needsUnicodeRendering: rows.some(({ text }) => {
      const unsupported = arabicLoaded ? text.replace(/\p{Script=Arabic}|[\u061c\u200c-\u200f]/gu, "") : text;
      return Boolean(unsupported && !nativePdfText.test(unsupported));
    }),
  };
}

export async function exportPDF(draft: CVState, options: ExportOptions = {}) {
  const output = await buildPDF(draft, options);
  // Standard PDF fonts do not cover all scripts. Preserve the candidate's
  // letters in the download rather than saving a damaged text layer.
  if (output.needsUnicodeRendering) {
    const [{ captureCV }, { jsPDF }] = await Promise.all([import("./capture-cv"), import("jspdf")]);
    const canvas = await captureCV(isRecruiterReady(options) ? draft : { ...draft, template: "ats-clean" });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const width = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = width * canvas.height / canvas.width;
    const image = canvas.toDataURL("image/jpeg", 0.96);
    for (let top = 0; top < imageHeight; top += pageHeight) {
      if (top > 0) pdf.addPage();
      pdf.addImage(image, "JPEG", 0, -top, width, imageHeight);
    }
    const visual = { blob: pdf.output("blob"), filename: output.filename, pageCount: pdf.getNumberOfPages() };
    saveAs(visual.blob, visual.filename);
    return visual;
  }
  saveAs(output.blob, output.filename);
  return output;
}
