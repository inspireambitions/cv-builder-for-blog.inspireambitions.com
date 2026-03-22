"use client";

import type { CVState } from "@/lib/types";

export default function Gulf({ state }: { state: CVState }) {
  const { personal, photo, summary, experience, education, certifications, skills, languages, achievements, volunteer, projects, publications, memberships } = state;

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

  const hasSidebar = filledSkills.length > 0 || filledLanguages.length > 0 || filledAchievements.length > 0 || filledVolunteer.length > 0 || filledProjects.length > 0 || filledPublications.length > 0 || filledMemberships.length > 0;

  return (
    <div id="cv-render" className="w-[794px] min-h-[1123px] bg-white text-[#222]" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 14 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a3320 0%, #234428 100%)", padding: "28px 40px 24px", display: "flex", alignItems: "center", gap: 20 }}>
        {photo && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={photo}
              alt="Profile"
              style={{ width: 85, height: 85, borderRadius: "50%", border: "3px solid #fff", objectFit: "cover" }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          {personal.name.trim() && (
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              {personal.name}
            </div>
          )}
          {personal.title.trim() && (
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
              {personal.title}
            </div>
          )}
          {contactParts.length > 0 && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.68)", marginTop: 8 }}>
              {contactParts.join("  |  ")}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: hasSidebar ? "3fr 1.4fr" : "1fr", minHeight: 0 }}>
        {/* Main Column */}
        <div style={{ padding: "28px 28px 32px 40px" }}>
          {/* Summary */}
          {summary.trim() && (
            <section style={{ marginBottom: 22 }}>
              <GulfHeading>Professional Summary</GulfHeading>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333" }}>{summary}</p>
            </section>
          )}

          {/* Experience */}
          {filledExperience.length > 0 && (
            <section style={{ marginBottom: 22 }}>
              <GulfHeading>Work Experience</GulfHeading>
              {filledExperience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: 16 }}>
                  {exp.role.trim() && <div style={{ fontWeight: 700, fontSize: 15, color: "#1a3320" }}>{exp.role}</div>}
                  {exp.company.trim() && <div style={{ fontSize: 14, color: "#333" }}>{exp.company}</div>}
                  {exp.companyDesc.trim() && <div style={{ fontSize: 12, fontStyle: "italic", color: "#4a7c54", marginTop: 1 }}>{exp.companyDesc}</div>}
                  {(exp.location.trim() || exp.dates.trim()) && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      {[exp.location, exp.dates].filter(Boolean).join("  |  ")}
                    </div>
                  )}
                  {exp.description.trim() && (
                    <ul style={{ margin: "6px 0 0 18px", padding: 0, listStyleType: "disc" }}>
                      {exp.description.split("\n").filter(l => l.trim()).map((line, i) => (
                        <li key={i} style={{ fontSize: 13, lineHeight: 1.5, color: "#444", marginBottom: 2 }}>{line.trim()}</li>
                      ))}
                    </ul>
                  )}
                  {exp.gap.trim() && (
                    <div style={{ fontSize: 12, fontStyle: "italic", color: "#777", marginTop: 4 }}>{exp.gap}</div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {filledEducation.length > 0 && (
            <section style={{ marginBottom: 22 }}>
              <GulfHeading>Education</GulfHeading>
              {filledEducation.map((edu) => (
                <div key={edu.id} style={{ marginBottom: 10 }}>
                  {edu.degree.trim() && <div style={{ fontWeight: 700, fontSize: 14 }}>{edu.degree}</div>}
                  {edu.institution.trim() && <div style={{ fontSize: 13, color: "#444" }}>{edu.institution}</div>}
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {[edu.year, edu.grade].filter(s => s.trim()).join("  |  ")}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {filledCerts.length > 0 && (
            <section style={{ marginBottom: 22 }}>
              <GulfHeading>Certifications</GulfHeading>
              {filledCerts.map((c) => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {[c.issuer, c.date, c.expiry ? `Exp: ${c.expiry}` : ""].filter(Boolean).join("  |  ")}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar */}
        {hasSidebar && (
          <div style={{ backgroundColor: "#f0f7f1", padding: "28px 20px 32px 20px", borderLeft: "1px solid #d4e6d7" }}>
            {/* Skills */}
            {filledSkills.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Skills</GulfSidebarHeading>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {filledSkills.map((skill, i) => (
                    <span key={i} style={{ backgroundColor: "#dcfce7", color: "#166534", borderRadius: 9999, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {filledLanguages.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Languages</GulfSidebarHeading>
                {filledLanguages.map((l) => (
                  <div key={l.id} style={{ fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{l.language}</span>
                    <span style={{ color: "#4a7c54", marginLeft: 6 }}>{l.level}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Achievements */}
            {filledAchievements.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Achievements</GulfSidebarHeading>
                {filledAchievements.map((a) => (
                  <div key={a.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                    {a.body.trim() && <div style={{ fontSize: 12, color: "#555" }}>{a.body}</div>}
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {[a.awardingBody, a.year].filter(s => s.trim()).join(" | ")}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Volunteer */}
            {filledVolunteer.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Volunteer</GulfSidebarHeading>
                {filledVolunteer.map((v) => (
                  <div key={v.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.role}</div>
                    {v.org.trim() && <div style={{ fontSize: 12, color: "#555" }}>{v.org}</div>}
                    {v.dates.trim() && <div style={{ fontSize: 11, color: "#888" }}>{v.dates}</div>}
                    {v.impact.trim() && <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{v.impact}</div>}
                  </div>
                ))}
              </section>
            )}

            {/* Projects */}
            {filledProjects.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Projects</GulfSidebarHeading>
                {filledProjects.map((p) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    {p.description.trim() && <div style={{ fontSize: 12, color: "#555" }}>{p.description}</div>}
                    {p.url.trim() && <div style={{ fontSize: 11, color: "#1a3320", wordBreak: "break-all" }}>{p.url}</div>}
                    {p.outcomes.trim() && <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{p.outcomes}</div>}
                  </div>
                ))}
              </section>
            )}

            {/* Publications */}
            {filledPublications.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Publications</GulfSidebarHeading>
                {filledPublications.map((p) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {[p.outlet, p.date].filter(s => s.trim()).join(" | ")}
                    </div>
                    {p.url.trim() && <div style={{ fontSize: 11, color: "#1a3320", wordBreak: "break-all" }}>{p.url}</div>}
                  </div>
                ))}
              </section>
            )}

            {/* Memberships */}
            {filledMemberships.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <GulfSidebarHeading>Memberships</GulfSidebarHeading>
                {filledMemberships.map((m) => (
                  <div key={m.id} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.org}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {[m.level, m.year].filter(s => s.trim()).join(" | ")}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GulfHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1a3320", borderBottom: "1.5px solid #1a3320", paddingBottom: 4, marginBottom: 12 }}>
      {children}
    </h2>
  );
}

function GulfSidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a3320", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #b8d4bc", paddingBottom: 3, marginBottom: 10 }}>
      {children}
    </h3>
  );
}
