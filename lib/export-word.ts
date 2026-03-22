"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { CVState } from "./types";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: {
      bottom: { color: "1a2744", space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
  });
}

export async function exportWord(state: CVState) {
  const children: Paragraph[] = [];

  // Header: Name & Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: state.personal.name, bold: true, size: 36, font: "Calibri" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  if (state.personal.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: state.personal.title, size: 24, color: "666666", font: "Calibri" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Contact line
  const contactParts = [
    state.personal.email,
    state.personal.phone,
    state.personal.location,
    state.personal.linkedin,
  ].filter(Boolean);
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

  // Professional Summary
  if (state.summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: state.summary, size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Work Experience
  const filledExp = state.experience.filter((e) => e.role.trim());
  if (filledExp.length > 0) {
    children.push(sectionHeading("Work Experience"));
    for (const exp of filledExp) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true, size: 24 }),
            new TextRun({ text: exp.company ? `  —  ${exp.company}` : "", size: 22 }),
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
              children: [new TextRun({ text: bullet.replace(/^[-•]\s*/, ""), size: 22 })],
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
  const filledEdu = state.education.filter((e) => e.degree.trim());
  if (filledEdu.length > 0) {
    children.push(sectionHeading("Education"));
    for (const edu of filledEdu) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22 }),
            new TextRun({ text: edu.institution ? `  —  ${edu.institution}` : "", size: 22 }),
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

  // Certifications
  if (state.certifications.length > 0) {
    children.push(sectionHeading("Professional Certifications"));
    for (const cert of state.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 22 }),
            new TextRun({ text: cert.issuer ? `  —  ${cert.issuer}` : "", size: 22 }),
            new TextRun({ text: cert.date ? `  (${cert.date})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 40 },
        })
      );
    }
  }

  // Skills
  if (state.skills.length > 0) {
    children.push(sectionHeading("Skills"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: state.skills.join("  •  "), size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Languages
  const filledLangs = state.languages.filter((l) => l.language.trim());
  if (filledLangs.length > 0) {
    children.push(sectionHeading("Languages"));
    for (const lang of filledLangs) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${lang.language} — ${lang.level}`, size: 22 }),
          ],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Achievements
  if (state.achievements.length > 0) {
    children.push(sectionHeading("Achievements & Awards"));
    for (const a of state.achievements) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: a.title, bold: true, size: 22 }),
            new TextRun({ text: a.awardingBody ? `  —  ${a.awardingBody}` : "", size: 22 }),
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
  if (state.volunteer.length > 0) {
    children.push(sectionHeading("Volunteer Work"));
    for (const v of state.volunteer) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: v.role, bold: true, size: 22 }),
            new TextRun({ text: v.org ? `  —  ${v.org}` : "", size: 22 }),
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
  if (state.projects.length > 0) {
    children.push(sectionHeading("Personal Projects"));
    for (const p of state.projects) {
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
  if (state.publications.length > 0) {
    children.push(sectionHeading("Publications & Media"));
    for (const pub of state.publications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: pub.title, bold: true, size: 22 }),
            new TextRun({ text: pub.outlet ? `  —  ${pub.outlet}` : "", size: 22 }),
            new TextRun({ text: pub.date ? `  (${pub.date})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    }
  }

  // Memberships
  if (state.memberships.length > 0) {
    children.push(sectionHeading("Professional Memberships"));
    for (const m of state.memberships) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: m.org, bold: true, size: 22 }),
            new TextRun({ text: m.level ? `  —  ${m.level}` : "", size: 22 }),
            new TextRun({ text: m.year ? `  (${m.year})` : "", size: 20, color: "888888" }),
          ],
          spacing: { before: 60, after: 40 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = state.personal.name
    ? `${state.personal.name.replace(/\s+/g, "_")}_InspireAmbitions_CV.docx`
    : "InspireAmbitions_CV.docx";
  saveAs(blob, filename);
}
