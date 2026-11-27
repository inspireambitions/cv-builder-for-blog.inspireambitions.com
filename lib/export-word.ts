"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import type { CVState } from "./types";
import type { ExportOptions } from "./export-options";
import { isRecruiterReady } from "./export-options";
import { cvContactParts, finishCV } from "./cv-finish";
import {
  formatSectorCredential,
  getSelectedSectorCredentials,
  getUAEHeaderParts,
} from "./uae";
import { SECTION_LABELS, TEMPLATE_CONFIG } from "./template-config";

function sectionHeading(text: string, colour = "1a2744"): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: {
      bottom: { color: colour, space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
  });
}

function photoRunFromDataUrl(value: string, size: number) {
  const match = value.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/i);
  if (!match) return null;
  const [, type, base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new ImageRun({
    type: type.toLowerCase() === "png" ? "png" : "jpg",
    data: bytes,
    transformation: { width: size, height: size },
    altText: {
      title: "Professional photo",
      description: "Candidate professional photo",
      name: "professional-photo",
    },
  });
}

export async function buildWord(draft: CVState, options: ExportOptions = {}) {
  const { cv } = finishCV(draft);
  const labels = SECTION_LABELS[cv.cvLanguage];
  const children: Paragraph[] = [];
  const recruiterReady = isRecruiterReady(options);
  const templateConfig = TEMPLATE_CONFIG[cv.template];
  const sectionColour = cv.template === "ats-clean" ? "1155CC" : "1A2744";

  if (recruiterReady && templateConfig.photo !== "hidden" && cv.photoPreference === "photo" && cv.photo) {
    const photo = photoRunFromDataUrl(
      cv.photo,
      templateConfig.photo === "prominent" ? 104 : 78
    );
    if (photo) {
      children.push(
        new Paragraph({
          children: [photo],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
        })
      );
    }
  }

  // Header: Name & Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: cv.personal.name, bold: true, size: 36, font: "Calibri" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  if (cv.personal.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: cv.personal.title, size: 24, color: "666666", font: "Calibri" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Contact line
  const contactParts = cvContactParts(cv);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: contactParts.join("  |  "), size: 20, color: "444444" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  const uaeHeaderParts = getUAEHeaderParts(cv);
  if (uaeHeaderParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: uaeHeaderParts.join("  |  "),
            size: 20,
            color: "2f6f45",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Professional Summary
  if (cv.summary) {
    children.push(sectionHeading(labels.summary, sectionColour));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.summary, size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Work Experience
  const filledExp = cv.experience.filter((e) => e.role.trim() || e.company.trim());
  if (filledExp.length > 0) {
    children.push(sectionHeading(labels.experience, sectionColour));
    for (const exp of filledExp) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true, size: 24 }),
            new TextRun({ text: exp.company ? `  |  ${exp.company}` : "", size: 22 }),
          ],
          spacing: { before: 150, after: 40 },
        })
      );
      if (exp.companyDesc) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.companyDesc, italics: true, size: 20, color: "666666" })],
            spacing: { after: 40 },
          })
        );
      }
      const meta = [exp.location, exp.dates].filter(Boolean).join("  |  ");
      if (meta) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: meta, size: 20, color: "888888" })],
            spacing: { after: 60 },
          })
        );
      }
      if (exp.description) {
        const bullets = exp.description.split("\n").filter((l) => l.trim());
        for (const bullet of bullets) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: bullet, size: 22 })],
              bullet: { level: 0 },
              spacing: { after: 30 },
            })
          );
        }
      }
      if (exp.gap) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Career note: ", bold: true, size: 20 }),
              new TextRun({ text: exp.gap, italics: true, size: 20 }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Education
  const filledEdu = cv.education.filter((e) => e.degree.trim() || e.institution.trim());
  if (filledEdu.length > 0) {
    children.push(sectionHeading(labels.education, sectionColour));
    for (const edu of filledEdu) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22 }),
            new TextRun({ text: edu.institution ? `  |  ${edu.institution}` : "", size: 22 }),
            new TextRun({ text: edu.year ? `  (${edu.year})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 80, after: 40 },
        })
      );
      if (edu.grade) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Grade: ${edu.grade}`, size: 20, color: "666666" })],
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // Skills
  if (cv.skills.length > 0) {
    children.push(sectionHeading(labels.skills, sectionColour));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.skills.join(" | "), size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Languages
  const filledLangs = cv.languages.filter((l) => l.language.trim());
  if (filledLangs.length > 0) {
    children.push(sectionHeading(labels.languages, sectionColour));
    for (const lang of filledLangs) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: [lang.language, lang.level].filter(Boolean).join(" | "), size: 22 }),
          ],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Certifications
  const sectorCredentials = getSelectedSectorCredentials(cv);
  const certificates = cv.certifications.filter((item) => item.name.trim() || item.issuer.trim());
  if (certificates.length > 0 || sectorCredentials.length > 0) {
    children.push(sectionHeading(labels.credentials, sectionColour));
    for (const credential of sectorCredentials) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: formatSectorCredential(credential),
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 60, after: 40 },
        })
      );
    }
    for (const cert of certificates) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 22 }),
            new TextRun({ text: cert.issuer ? `  |  ${cert.issuer}` : "", size: 22 }),
            new TextRun({ text: [cert.date, cert.expiry && `Expiry: ${cert.expiry}`].filter(Boolean).map((value) => ` | ${value}`).join(""), size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 40 },
        })
      );
    }
  }

  // Achievements
  if (cv.achievements.length > 0) {
    children.push(sectionHeading("Achievements & Awards", sectionColour));
    for (const a of cv.achievements) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: a.title, bold: true, size: 22 }),
            new TextRun({ text: a.awardingBody ? `  |  ${a.awardingBody}` : "", size: 22 }),
            new TextRun({ text: a.year ? `  (${a.year})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 30 },
        })
      );
      if (a.body) {
        children.push(new Paragraph({ children: [new TextRun({ text: a.body, size: 22 })], spacing: { after: 60 } }));
      }
    }
  }

  // Volunteer
  if (cv.volunteer.length > 0) {
    children.push(sectionHeading("Volunteer Work", sectionColour));
    for (const v of cv.volunteer) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: v.role, bold: true, size: 22 }),
            new TextRun({ text: v.org ? `  |  ${v.org}` : "", size: 22 }),
          ],
          spacing: { before: 60, after: 30 },
        })
      );
      if (v.impact) {
        children.push(new Paragraph({ children: [new TextRun({ text: v.impact, size: 22 })], spacing: { after: 60 } }));
      }
    }
  }

  // Projects
  if (cv.projects.length > 0) {
    children.push(sectionHeading("Personal Projects", sectionColour));
    for (const p of cv.projects) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p.name, bold: true, size: 22 })],
          spacing: { before: 60, after: 30 },
        })
      );
      if (p.description) {
        children.push(new Paragraph({ children: [new TextRun({ text: p.description, size: 22 })], spacing: { after: 40 } }));
      }
      if (p.url) {
        children.push(new Paragraph({ children: [new TextRun({ text: p.url, size: 20, color: "0066cc" })], spacing: { after: 60 } }));
      }
    }
  }

  // Publications
  if (cv.publications.length > 0) {
    children.push(sectionHeading("Publications & Media", sectionColour));
    for (const pub of cv.publications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: pub.title, bold: true, size: 22 }),
            new TextRun({ text: pub.outlet ? `  |  ${pub.outlet}` : "", size: 22 }),
            new TextRun({ text: pub.date ? `  (${pub.date})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    }
  }

  // Memberships
  if (cv.memberships.length > 0) {
    children.push(sectionHeading("Professional Memberships", sectionColour));
    for (const m of cv.memberships) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: m.org, bold: true, size: 22 }),
            new TextRun({ text: m.level ? `  |  ${m.level}` : "", size: 22 }),
            new TextRun({ text: m.year ? `  (${m.year})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 40 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const suffix = recruiterReady ? "_Recruiter" : "_ATS";
  const filename = cv.personal.name
    ? `${cv.personal.name.replace(/\s+/g, "_")}_InspireAmbitions_CV${suffix}.docx`
    : `InspireAmbitions_CV${suffix}.docx`;
  return { blob, filename };
}

export async function exportWord(draft: CVState, options: ExportOptions = {}) {
  const { blob, filename } = await buildWord(draft, options);
  saveAs(blob, filename);
}
