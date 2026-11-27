"use client";

import DocumentWorkEntry from "./DocumentWorkEntry";
import DocumentContact from "./DocumentContact";
import { documentBodyLayout } from "@/lib/cv-page-layout";

import { cvContactParts, finishCV } from "@/lib/cv-finish";
import type { CVState } from "@/lib/types";
import { TEMPLATE_CONFIG, SECTION_LABELS } from "@/lib/template-config";
import { formatSectorCredential, getSelectedSectorCredentials, getUAEHeaderParts } from "@/lib/uae";

function Heading({ children, accent, rtl }: { children: React.ReactNode; accent: string; rtl: boolean }) {
  return (
    <h2 style={{ color: accent, borderBlockEnd: `1px solid ${accent}`, paddingBlockEnd: 5, marginBlockEnd: 12, fontSize: 14, fontWeight: 750, textTransform: rtl ? "none" : "uppercase" }}>
      {children}
    </h2>
  );
}

function Credentials({
  credentials,
  certifications,
}: {
  credentials: ReturnType<typeof getSelectedSectorCredentials>;
  certifications: CVState["certifications"];
}) {
  return (
    <>
      {credentials.map((item) => <div key={`sector-${item.authority}`} style={{ marginBlockEnd: 7, fontSize: 12 }}>{formatSectorCredential(item)}</div>)}
      {certifications.map((item) => (
        <div key={item.id} style={{ marginBlockEnd: 8 }}>
          <strong>{item.name}</strong>
          {item.issuer && <div>{item.issuer}</div>}
          {(item.date || item.expiry) && <small><bdi>{[item.date, item.expiry ? `Expiry: ${item.expiry}` : ""].filter(Boolean).join(" | ")}</bdi></small>}
        </div>
      ))}
    </>
  );
}

export default function SectorTemplate({ state: draft }: { state: CVState }) {
  const { cv } = finishCV(draft);
  const layout = documentBodyLayout(cv);
  const config = TEMPLATE_CONFIG[cv.template];
  const labels = SECTION_LABELS[cv.cvLanguage];
  const rtl = cv.cvLanguage === "ar";
  const experiences = cv.experience.filter((item) => item.role.trim() || item.company.trim());
  const education = cv.education.filter((item) => item.degree.trim() || item.institution.trim());
  const credentials = getSelectedSectorCredentials(cv);
  const certifications = cv.certifications.filter((item) => item.name.trim() || item.issuer.trim());
  const skills = cv.skills.filter(Boolean);
  const languages = cv.languages.filter((item) => item.language.trim());
  const achievements = cv.achievements.filter((item) => item.title.trim() || item.body.trim());
  const volunteer = cv.volunteer.filter((item) => item.role.trim() || item.org.trim() || item.impact.trim());
  const projects = cv.projects.filter((item) => item.name.trim() || item.description.trim() || item.outcomes.trim());
  const publications = cv.publications.filter((item) => item.title.trim() || item.outlet.trim());
  const memberships = cv.memberships.filter((item) => item.org.trim());
  const showPhoto = cv.photoPreference === "photo" && config.photo !== "hidden" && Boolean(cv.photo);
  const sideContent = Boolean(skills.length || languages.length);

  return (
    <div id="cv-render" data-finished-cv="true" dir={rtl ? "rtl" : "ltr"} lang={cv.cvLanguage} className="cv-document w-[794px] min-h-[1123px] bg-white text-[#202124]" style={{ fontFamily: rtl ? "Tahoma, Arial, sans-serif" : "Arial, sans-serif", fontSize: `${layout.size}pt`, lineHeight: layout.leading }}>
      <header style={{ padding: "34px 40px 24px", borderBlockEnd: `3px solid ${config.accent}`, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ flex: 1, minInlineSize: 0 }}>
          <div style={{ color: config.accent, fontSize: 10, fontWeight: 800 }}>{config.eyebrow}</div>
          <div style={{ marginBlockStart: 5, fontFamily: config.heading === "serif" ? "Georgia, serif" : "Arial, sans-serif", fontSize: 31, fontWeight: 800 }}>{cv.personal.name}</div>
          <div style={{ marginBlockStart: 4, color: config.accent, fontSize: 15, fontWeight: 650 }}>{cv.personal.title}</div>
          <div style={{ marginBlockStart: 10, color: "#5f6368", fontSize: 11 }}><DocumentContact parts={cvContactParts(cv)} /></div>
          {getUAEHeaderParts(cv).length > 0 && <div style={{ marginBlockStart: 7, color: config.accent, fontSize: 10, fontWeight: 700 }}>{getUAEHeaderParts(cv).join("  |  ")}</div>}
        </div>
        {showPhoto && <img src={cv.photo!} alt="" style={{ inlineSize: config.photo === "prominent" ? 104 : 78, blockSize: config.photo === "prominent" ? 112 : 78, objectFit: "cover", borderRadius: config.photo === "prominent" ? 4 : "50%", flexShrink: 0 }} />}
      </header>
      <div style={{ display: "grid", gridTemplateColumns: config.sidebar && sideContent ? (rtl ? "1fr 2.25fr" : "2.25fr 1fr") : "1fr", gridTemplateRows: "min-content 1fr", minHeight: 940 }}>
        <main style={{ padding: "28px 36px 0 40px", gridColumn: rtl && config.sidebar && sideContent ? 2 : 1 }}>
          {cv.summary.trim() && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.summary}</Heading><p>{cv.summary}</p></section>}
          {experiences.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.experience}</Heading>{experiences.map((item) => <DocumentWorkEntry key={item.id} item={item} note={labels.careerNote} />)}</section>}
          {education.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.education}</Heading>{education.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.degree}</strong><div>{item.institution}</div><small><bdi>{[item.year, item.grade].filter(Boolean).join(" | ")}</bdi></small></div>)}</section>}
          {!config.sidebar && skills.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.skills}</Heading><div>{skills.join(" | ")}</div></section>}
          {!config.sidebar && languages.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.languages}</Heading>{languages.map((item) => <div key={item.id}><strong>{item.language}</strong>{item.level ? ` | ${item.level}` : ""}</div>)}</section>}
        </main>
        {config.sidebar && sideContent && <aside style={{ background: config.soft, padding: "28px 24px", borderInlineStart: `1px solid ${config.accent}22`, gridColumn: rtl ? 1 : 2, gridRow: "1 / 3" }}>
          {skills.length > 0 && <section style={{ marginBlockEnd: 22 }}><Heading accent={config.accent} rtl={rtl}>{labels.skills}</Heading>{skills.map((item) => <div key={item} style={{ paddingBlock: 5, borderBlockEnd: "1px solid #d9dadd" }}>{item}</div>)}</section>}
          {languages.length > 0 && <section><Heading accent={config.accent} rtl={rtl}>{labels.languages}</Heading>{languages.map((item) => <div key={item.id} style={{ marginBlockEnd: 5 }}><strong>{item.language}</strong>{item.level && <span style={{ color: "#666" }}> {item.level}</span>}</div>)}</section>}
        </aside>}
        <div style={{ padding: "0 36px 36px 40px", gridColumn: rtl && config.sidebar && sideContent ? 2 : 1 }}>
          {(credentials.length > 0 || certifications.length > 0) && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.credentials}</Heading><Credentials credentials={credentials} certifications={certifications} /></section>}
          {achievements.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.achievements}</Heading>{achievements.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.title}</strong><div>{item.body}</div><small><bdi>{[item.awardingBody, item.year].filter(Boolean).join(" | ")}</bdi></small></div>)}</section>}
          {volunteer.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.volunteer}</Heading>{volunteer.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.role}</strong>{item.org && <div>{item.org}</div>}<small><bdi>{item.dates}</bdi></small><div>{item.impact}</div></div>)}</section>}
          {projects.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.projects}</Heading>{projects.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.name}</strong><div>{item.description}</div><div>{item.outcomes}</div><small>{item.url}</small></div>)}</section>}
          {publications.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.publications}</Heading>{publications.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.title}</strong><div>{item.outlet}</div><small><bdi>{[item.date, item.url].filter(Boolean).join(" | ")}</bdi></small></div>)}</section>}
          {memberships.length > 0 && <section style={{ marginBlockEnd: `${layout.sectionGap}pt` }}><Heading accent={config.accent} rtl={rtl}>{labels.memberships}</Heading>{memberships.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.org}</strong><div><bdi>{[item.level, item.year].filter(Boolean).join(" | ")}</bdi></div></div>)}</section>}
        </div>
      </div>
    </div>
  );
}
