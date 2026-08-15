"use client";

import type { CVState } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/template-config";
import { formatSectorCredential, getSelectedSectorCredentials, getUAEHeaderParts } from "@/lib/uae";

const BLUE = "#1155cc";

function SectionHeading({ children, rtl }: { children: React.ReactNode; rtl: boolean }) {
  return (
    <h2
      style={{
        color: BLUE,
        borderBlockEnd: `1px solid ${BLUE}`,
        paddingBlockEnd: 3,
        marginBlockEnd: 8,
        fontSize: 11,
        lineHeight: 1.2,
        fontWeight: 800,
        textTransform: rtl ? "none" : "uppercase",
      }}
    >
      {children}
    </h2>
  );
}

function BulletList({ value }: { value: string }) {
  const lines = value.split("\n").map((line) => line.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <ul style={{ marginBlockStart: 4, paddingInlineStart: 18 }}>
      {lines.map((line, index) => <li key={index}>{line}</li>)}
    </ul>
  );
}

export default function ATSCleanTemplate({ state }: { state: CVState }) {
  const rtl = state.cvLanguage === "ar";
  const labels = SECTION_LABELS[state.cvLanguage];
  const experiences = state.experience.filter((item) => item.role.trim() || item.company.trim());
  const education = state.education.filter((item) => item.degree.trim() || item.institution.trim());
  const credentials = getSelectedSectorCredentials(state);
  const certifications = state.certifications.filter((item) => item.name.trim() || item.issuer.trim());
  const skills = state.skills.filter((item) => item.trim());
  const languages = state.languages.filter((item) => item.language.trim());
  const achievements = state.achievements.filter((item) => item.title.trim() || item.body.trim());
  const volunteer = state.volunteer.filter((item) => item.role.trim() || item.org.trim() || item.impact.trim());
  const projects = state.projects.filter((item) => item.name.trim() || item.description.trim() || item.outcomes.trim());
  const publications = state.publications.filter((item) => item.title.trim() || item.outlet.trim());
  const memberships = state.memberships.filter((item) => item.org.trim());
  const contact = [state.personal.email, state.personal.phone, state.personal.location, state.personal.linkedin].filter(Boolean);

  return (
    <div
      id="cv-render"
      data-template="ats-clean"
      data-layout="single-column"
      dir={rtl ? "rtl" : "ltr"}
      lang={state.cvLanguage}
      className="w-[794px] min-h-[1123px] bg-white text-black"
      style={{ fontFamily: rtl ? "Tahoma, Arial, sans-serif" : "Arial, sans-serif", fontSize: 10.5, lineHeight: rtl ? 1.65 : 1.34 }}
    >
      <header style={{ padding: "32px 52px 10px", textAlign: "center" }}>
        <div style={{ fontSize: 25, lineHeight: 1.1, fontWeight: 800 }}>{state.personal.name}</div>
        {state.personal.title && <div style={{ marginBlockStart: 7, color: "#444", fontSize: 10.5 }}>{state.personal.title}</div>}
        {contact.length > 0 && <div style={{ marginBlockStart: 5, fontSize: 9.5 }}><bdi>{contact.join("  |  ")}</bdi></div>}
        {getUAEHeaderParts(state).length > 0 && <div style={{ marginBlockStart: 4, color: "#444", fontSize: 9 }}>{getUAEHeaderParts(state).join("  |  ")}</div>}
      </header>

      <main style={{ padding: "3px 52px 40px" }}>
        {state.summary.trim() && (
          <section style={{ marginBlockEnd: 14 }}>
            <SectionHeading rtl={rtl}>{state.cvLanguage === "en" ? "Professional Summary" : labels.summary}</SectionHeading>
            <p>{state.summary}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section style={{ marginBlockEnd: 14 }}>
            <SectionHeading rtl={rtl}>{labels.experience}</SectionHeading>
            {experiences.map((item) => (
              <article key={item.id} style={{ marginBlockEnd: 11, breakInside: "avoid" }}>
                <div><strong>{item.role}</strong>{item.company && <span>, {item.company}</span>}{item.location && <span>, {item.location}</span>}</div>
                {item.dates && <div style={{ color: "#666", fontStyle: "italic", marginBlockStart: 1 }}><bdi>{item.dates}</bdi></div>}
                {item.companyDesc && <div style={{ color: "#444", marginBlockStart: 2 }}>{item.companyDesc}</div>}
                <BulletList value={item.description} />
                {item.gap && <div style={{ color: "#555", marginBlockStart: 3 }}><strong>{labels.careerNote}:</strong> {item.gap}</div>}
              </article>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section style={{ marginBlockEnd: 14 }}>
            <SectionHeading rtl={rtl}>{labels.education}</SectionHeading>
            {education.map((item) => (
              <div key={item.id} style={{ marginBlockEnd: 7, breakInside: "avoid" }}>
                <div><strong>{item.degree}</strong>{item.institution && <span>, {item.institution}</span>}</div>
                {(item.year || item.grade) && <div style={{ color: "#666", fontStyle: "italic" }}><bdi>{[item.year, item.grade].filter(Boolean).join("  |  ")}</bdi></div>}
              </div>
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section style={{ marginBlockEnd: 14 }}>
            <SectionHeading rtl={rtl}>{state.cvLanguage === "en" ? "Skills" : labels.skills}</SectionHeading>
            <ul style={{ paddingInlineStart: 18 }}>{skills.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        {(credentials.length > 0 || certifications.length > 0) && (
          <section style={{ marginBlockEnd: 14 }}>
            <SectionHeading rtl={rtl}>{state.cvLanguage === "en" ? "Certificates & Development" : labels.credentials}</SectionHeading>
            <ul style={{ paddingInlineStart: 18 }}>
              {credentials.map((item) => <li key={`sector-${item.authority}`}>{formatSectorCredential(item)}</li>)}
              {certifications.map((item) => <li key={item.id}><strong>{item.name}</strong>{item.issuer ? ` — ${item.issuer}` : ""}{item.date ? ` (${item.date})` : ""}</li>)}
            </ul>
          </section>
        )}

        {languages.length > 0 && <section style={{ marginBlockEnd: 14 }}><SectionHeading rtl={rtl}>{labels.languages}</SectionHeading><ul style={{ paddingInlineStart: 18 }}>{languages.map((item) => <li key={item.id}><strong>{item.language}</strong>{item.level ? ` — ${item.level}` : ""}</li>)}</ul></section>}
        {achievements.length > 0 && <section style={{ marginBlockEnd: 14 }}><SectionHeading rtl={rtl}>{labels.achievements}</SectionHeading>{achievements.map((item) => <div key={item.id} style={{ marginBlockEnd: 7, breakInside: "avoid" }}><strong>{item.title}</strong><div>{item.body}</div><span style={{ color: "#666", fontStyle: "italic" }}>{[item.awardingBody, item.year].filter(Boolean).join("  |  ")}</span></div>)}</section>}
        {volunteer.length > 0 && <section style={{ marginBlockEnd: 14 }}><SectionHeading rtl={rtl}>{labels.volunteer}</SectionHeading>{volunteer.map((item) => <div key={item.id} style={{ marginBlockEnd: 7, breakInside: "avoid" }}><strong>{item.role}</strong>{item.org && `, ${item.org}`}<div>{item.impact}</div><span style={{ color: "#666", fontStyle: "italic" }}>{item.dates}</span></div>)}</section>}
        {projects.length > 0 && <section style={{ marginBlockEnd: 14 }}><SectionHeading rtl={rtl}>{labels.projects}</SectionHeading>{projects.map((item) => <div key={item.id} style={{ marginBlockEnd: 7, breakInside: "avoid" }}><strong>{item.name}</strong><div>{item.description}</div><div>{item.outcomes}</div>{item.url && <div style={{ color: BLUE }}>{item.url}</div>}</div>)}</section>}
        {publications.length > 0 && <section style={{ marginBlockEnd: 14 }}><SectionHeading rtl={rtl}>{labels.publications}</SectionHeading>{publications.map((item) => <div key={item.id} style={{ marginBlockEnd: 7, breakInside: "avoid" }}><strong>{item.title}</strong>{item.outlet && ` — ${item.outlet}`}<div style={{ color: "#666", fontStyle: "italic" }}>{[item.date, item.url].filter(Boolean).join("  |  ")}</div></div>)}</section>}
        {memberships.length > 0 && <section style={{ marginBlockEnd: 14 }}><SectionHeading rtl={rtl}>{labels.memberships}</SectionHeading>{memberships.map((item) => <div key={item.id}><strong>{item.org}</strong>{item.level && ` — ${item.level}`}{item.year && ` (${item.year})`}</div>)}</section>}
      </main>
    </div>
  );
}
