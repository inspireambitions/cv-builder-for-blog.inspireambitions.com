"use client";

import type { CVState } from "@/lib/types";

export default function Minimal({ state }: { state: CVState }) {
  const { personal, summary, experience, education, certifications, skills, languages, achievements, volunteer, projects, publications, memberships } = state;

  const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean);

  const filledExperience = experience.filter(e => e.role.trim() || e.company.trim());
  const filledEducation = education.filter(e => e.degree.trim() || e.institution.trim());
  const filledCerts = certifications.filter(c => c.name.trim());
  const filledSkills = skills.filter(s => s.trim());
  const filledLanguages = languages.filter(l => l.language.trim());
  const filledAchievements = achievements.filter(a => a.title.trim());
  const filledVolunteer = volunteer.filter(v => v.role.trim() || v.org.trim());
  const filledProjects = projects.filter(p => p.name.trim());
  const filledPublications = publications.filter(p => p.title.trim());
  const filledMemberships = memberships.filter(m => m.org.trim());

  const hasExtras = filledAchievements.length > 0 || filledVolunteer.length > 0 || filledProjects.length > 0 || filledPublications.length > 0 || filledMemberships.length > 0;

  return (
    <div id="cv-render" className="w-[794px] min-h-[1123px] bg-white" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 14, color: "#2d2d2d", padding: "48px 56px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        {personal.name.trim() && (
          <div style={{ fontSize: 32, fontWeight: 300, color: "#111", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            {personal.name}
          </div>
        )}
        {personal.title.trim() && (
          <div style={{ fontSize: 16, color: "#6b7280", marginTop: 4 }}>
            {personal.title}
          </div>
        )}
        {contactParts.length > 0 && (
          <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            {contactParts.join("  \u00b7  ")}
          </div>
        )}
        <div style={{ height: 1, backgroundColor: "#e5e7eb", marginTop: 20 }} />
      </div>

      {/* Body: 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {/* Left Column */}
        <div>
          {/* Summary */}
          {summary.trim() && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Summary</MinimalHeading>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "#444" }}>{summary}</p>
            </section>
          )}

          {/* Experience */}
          {filledExperience.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Experience</MinimalHeading>
              {filledExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: 16 }}>
                  {exp.role.trim() && <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{exp.role}</div>}
                  {exp.company.trim() && <div style={{ fontSize: 13, color: "#555" }}>{exp.company}</div>}
                  {exp.companyDesc.trim() && <div style={{ fontSize: 12, fontStyle: "italic", color: "#777" }}>{exp.companyDesc}</div>}
                  {(exp.location.trim() || exp.dates.trim()) && (
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                      {[exp.location, exp.dates].filter(Boolean).join("  \u00b7  ")}
                    </div>
                  )}
                  {exp.description.trim() && (
                    <ul style={{ margin: "5px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                      {exp.description.split("\n").filter(l => l.trim()).map((line, i) => (
                        <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: "#444", marginBottom: 2 }}>{line.trim()}</li>
                      ))}
                    </ul>
                  )}
                  {exp.gap.trim() && (
                    <div style={{ fontSize: 12, fontStyle: "italic", color: "#999", marginTop: 3 }}>{exp.gap}</div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {filledEducation.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Education</MinimalHeading>
              {filledEducation.map((edu) => (
                <div key={edu.id} style={{ marginBottom: 10 }}>
                  {edu.degree.trim() && <div style={{ fontWeight: 600, fontSize: 14 }}>{edu.degree}</div>}
                  {edu.institution.trim() && <div style={{ fontSize: 13, color: "#555" }}>{edu.institution}</div>}
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {[edu.year, edu.grade].filter(s => s.trim()).join("  \u00b7  ")}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Skills */}
          {filledSkills.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Skills</MinimalHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {filledSkills.map((skill, i) => (
                  <span key={i} style={{ backgroundColor: "#f2f2f6", borderRadius: 4, padding: "4px 12px", fontSize: 13, color: "#333" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {filledLanguages.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Languages</MinimalHeading>
              {filledLanguages.map((l) => (
                <div key={l.id} style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{l.language}</span>
                  <span style={{ color: "#888", marginLeft: 8 }}>{l.level}</span>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {filledCerts.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Certifications</MinimalHeading>
              {filledCerts.map((c) => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {[c.issuer, c.date, c.expiry ? `Exp: ${c.expiry}` : ""].filter(Boolean).join("  \u00b7  ")}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Achievements */}
          {filledAchievements.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Achievements</MinimalHeading>
              {filledAchievements.map((a) => (
                <div key={a.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                  {a.body.trim() && <div style={{ fontSize: 12, color: "#666" }}>{a.body}</div>}
                  <div style={{ fontSize: 11, color: "#999" }}>
                    {[a.awardingBody, a.year].filter(s => s.trim()).join(" \u00b7 ")}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Volunteer */}
          {filledVolunteer.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Volunteer</MinimalHeading>
              {filledVolunteer.map((v) => (
                <div key={v.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{v.role}</div>
                  {v.org.trim() && <div style={{ fontSize: 12, color: "#666" }}>{v.org}</div>}
                  {v.dates.trim() && <div style={{ fontSize: 11, color: "#999" }}>{v.dates}</div>}
                  {v.impact.trim() && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{v.impact}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {filledProjects.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Projects</MinimalHeading>
              {filledProjects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  {p.description.trim() && <div style={{ fontSize: 12, color: "#666" }}>{p.description}</div>}
                  {p.url.trim() && <div style={{ fontSize: 11, color: "#555", wordBreak: "break-all" }}>{p.url}</div>}
                  {p.outcomes.trim() && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{p.outcomes}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Publications */}
          {filledPublications.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Publications</MinimalHeading>
              {filledPublications.map((p) => (
                <div key={p.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {[p.outlet, p.date].filter(s => s.trim()).join(" \u00b7 ")}
                  </div>
                  {p.url.trim() && <div style={{ fontSize: 11, color: "#555", wordBreak: "break-all" }}>{p.url}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Memberships */}
          {filledMemberships.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <MinimalHeading>Memberships</MinimalHeading>
              {filledMemberships.map((m) => (
                <div key={m.id} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.org}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {[m.level, m.year].filter(s => s.trim()).join(" \u00b7 ")}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function MinimalHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 12 }}>
      {children}
    </h2>
  );
}
