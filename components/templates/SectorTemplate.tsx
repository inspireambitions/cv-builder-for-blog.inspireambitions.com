"use client";

import type { CVState } from "@/lib/types";
import { TEMPLATE_CONFIG, SECTION_LABELS } from "@/lib/template-config";
import { formatSectorCredential, getSelectedSectorCredentials, getUAEHeaderParts } from "@/lib/uae";

export default function SectorTemplate({ state }: { state: CVState }) {
  const config = TEMPLATE_CONFIG[state.template];
  const labels = SECTION_LABELS[state.cvLanguage];
  const rtl = state.cvLanguage === "ar";
  const experiences = state.experience.filter((item) => item.role.trim() || item.company.trim());
  const education = state.education.filter((item) => item.degree.trim() || item.institution.trim());
  const credentials = getSelectedSectorCredentials(state);
  const showPhoto = config.photo !== "hidden" && Boolean(state.photo);
  const sideContent = state.skills.length || state.languages.some((item) => item.language.trim()) || credentials.length;

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ color: config.accent, borderBlockEnd: `1px solid ${config.accent}`, paddingBlockEnd: 5, marginBlockEnd: 12, fontSize: 14, fontWeight: 750, textTransform: rtl ? "none" : "uppercase" }}>{children}</h2>
  );

  return (
    <div id="cv-render" dir={rtl ? "rtl" : "ltr"} lang={state.cvLanguage} className="w-[794px] min-h-[1123px] bg-white text-[#202124]" style={{ fontFamily: rtl ? "Tahoma, Arial, sans-serif" : "Arial, sans-serif", fontSize: 13, lineHeight: rtl ? 1.7 : 1.5 }}>
      <header style={{ padding: "34px 40px 24px", borderBlockEnd: `3px solid ${config.accent}`, display: "flex", alignItems: "center", gap: 24 }}>
        {showPhoto && <img src={state.photo!} alt="" style={{ inlineSize: config.photo === "prominent" ? 104 : 82, blockSize: config.photo === "prominent" ? 112 : 82, objectFit: "cover", borderRadius: config.photo === "prominent" ? 4 : "50%" }} />}
        <div style={{ flex: 1 }}>
          <div style={{ color: config.accent, fontSize: 10, fontWeight: 800 }}>{config.eyebrow}</div>
          <div style={{ marginBlockStart: 5, fontFamily: config.heading === "serif" ? "Georgia, serif" : "Arial, sans-serif", fontSize: 31, fontWeight: 800 }}>{state.personal.name}</div>
          <div style={{ marginBlockStart: 4, color: config.accent, fontSize: 15, fontWeight: 650 }}>{state.personal.title}</div>
          <div style={{ marginBlockStart: 10, color: "#5f6368", fontSize: 11 }}><bdi>{[state.personal.email, state.personal.phone, state.personal.location, state.personal.linkedin].filter(Boolean).join("  |  ")}</bdi></div>
          {getUAEHeaderParts(state).length > 0 && <div style={{ marginBlockStart: 7, color: config.accent, fontSize: 10, fontWeight: 700 }}>{getUAEHeaderParts(state).join("  |  ")}</div>}
        </div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: config.sidebar && sideContent ? (rtl ? "1fr 2.25fr" : "2.25fr 1fr") : "1fr", minHeight: 940 }}>
        <main style={{ padding: "28px 36px 36px 40px", gridColumn: rtl && config.sidebar && sideContent ? 2 : 1 }}>
          {state.summary.trim() && <section style={{ marginBlockEnd: 23 }}><Heading>{labels.summary}</Heading><p>{state.summary}</p></section>}
          {experiences.length > 0 && <section style={{ marginBlockEnd: 23 }}><Heading>{labels.experience}</Heading>{experiences.map((item) => <article key={item.id} style={{ marginBlockEnd: 16 }}><div style={{ fontWeight: 750, fontSize: 14 }}>{item.role}</div><div style={{ color: config.accent, fontWeight: 650 }}>{item.company}</div><div style={{ color: "#666", fontSize: 11 }}><bdi>{[item.location, item.dates].filter(Boolean).join(" | ")}</bdi></div>{item.description && <ul style={{ paddingInlineStart: 18, marginBlockStart: 7 }}>{item.description.split("\n").filter(Boolean).map((line, index) => <li key={index}>{line}</li>)}</ul>}</article>)}</section>}
          {education.length > 0 && <section style={{ marginBlockEnd: 23 }}><Heading>{labels.education}</Heading>{education.map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.degree}</strong><div>{item.institution}</div><small><bdi>{[item.year, item.grade].filter(Boolean).join(" | ")}</bdi></small></div>)}</section>}
          {state.projects.some((item) => item.name.trim()) && <section><Heading>{labels.projects}</Heading>{state.projects.filter((item) => item.name.trim()).map((item) => <div key={item.id} style={{ marginBlockEnd: 9 }}><strong>{item.name}</strong><div>{item.description}</div><small>{item.outcomes}</small></div>)}</section>}
        </main>
        {config.sidebar && sideContent ? <aside style={{ background: config.soft, padding: "28px 24px", borderInlineStart: `1px solid ${config.accent}22`, gridColumn: rtl ? 1 : 2, gridRow: 1 }}>
          {credentials.length > 0 && <section style={{ marginBlockEnd: 22 }}><Heading>{labels.credentials}</Heading>{credentials.map((item) => <div key={item.authority} style={{ marginBlockEnd: 7, fontSize: 12 }}>{formatSectorCredential(item)}</div>)}</section>}
          {state.skills.length > 0 && <section style={{ marginBlockEnd: 22 }}><Heading>{labels.skills}</Heading>{state.skills.filter(Boolean).map((item) => <div key={item} style={{ paddingBlock: 5, borderBlockEnd: "1px solid #d9dadd" }}>{item}</div>)}</section>}
          {state.languages.some((item) => item.language.trim()) && <section><Heading>{labels.languages}</Heading>{state.languages.filter((item) => item.language.trim()).map((item) => <div key={item.id} style={{ marginBlockEnd: 5 }}><strong>{item.language}</strong> <span style={{ color: "#666" }}>{item.level}</span></div>)}</section>}
        </aside> : null}
      </div>
    </div>
  );
}
