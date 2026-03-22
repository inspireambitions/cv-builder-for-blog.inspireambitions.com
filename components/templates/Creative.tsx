"use client";

import type { CVState } from "@/lib/types";

export default function Creative({ state }: { state: CVState }) {
  const { personal, photo, summary, experience, education, certifications, skills, languages, achievements, volunteer, projects, publications, memberships } = state;

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

  const skillBarWidths = [90, 95, 85, 92, 88, 93, 87, 91, 86, 94];

  return (
    <div id="cv-render" className="w-[794px] min-h-[1123px] bg-white text-[#222]" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 14, display: "flex" }}>
      {/* Left Sidebar */}
      <div style={{ width: 210, flexShrink: 0, background: "linear-gradient(180deg, #2d1a44 0%, #140d22 100%)", padding: "32px 18px 28px", color: "#fff", display: "flex", flexDirection: "column", minHeight: 1123 }}>
        {/* Photo */}
        {photo && (
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <img
              src={photo}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover" }}
            />
          </div>
        )}

        {/* Name & Title */}
        {personal.name.trim() && (
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2, textAlign: "center" }}>
            {personal.name}
          </div>
        )}
        {personal.title.trim() && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4, textAlign: "center" }}>
            {personal.title}
          </div>
        )}

        {/* Contact */}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          {personal.email.trim() && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 6, wordBreak: "break-all" }}>
              <span style={{ marginRight: 6 }}>{"\u2709"}</span>{personal.email}
            </div>
          )}
          {personal.phone.trim() && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
              <span style={{ marginRight: 6 }}>{"\u260E"}</span>{personal.phone}
            </div>
          )}
          {personal.location.trim() && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
              <span style={{ marginRight: 6 }}>{"\uD83D\uDCCD"}</span>{personal.location}
            </div>
          )}
          {personal.linkedin.trim() && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 6, wordBreak: "break-all" }}>
              <span style={{ marginRight: 6 }}>{"\uD83D\uDD17"}</span>{personal.linkedin}
            </div>
          )}
        </div>

        {/* Skills */}
        {filledSkills.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <SidebarSectionHeading>Skills</SidebarSectionHeading>
            {filledSkills.map((skill, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>{skill}</div>
                <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${skillBarWidths[i % skillBarWidths.length]}%`, background: "linear-gradient(90deg, #d4a843 0%, #b08a2e 100%)", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {filledLanguages.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <SidebarSectionHeading>Languages</SidebarSectionHeading>
            {filledLanguages.map((l) => (
              <div key={l.id} style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>{l.language}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", marginLeft: 6 }}>{l.level}</span>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px 36px 32px 32px" }}>
        {/* Summary */}
        {summary.trim() && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Professional Summary</MainHeading>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333" }}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {filledExperience.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Work Experience</MainHeading>
            {filledExperience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: 16 }}>
                {exp.role.trim() && <div style={{ fontWeight: 700, fontSize: 15, color: "#2d1a44" }}>{exp.role}</div>}
                {exp.company.trim() && <div style={{ fontSize: 14, color: "#333" }}>{exp.company}</div>}
                {exp.companyDesc.trim() && <div style={{ fontSize: 12, fontStyle: "italic", color: "#7c5fa0", marginTop: 1 }}>{exp.companyDesc}</div>}
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
            <MainHeading>Education</MainHeading>
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
            <MainHeading>Certifications</MainHeading>
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

        {/* Achievements */}
        {filledAchievements.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Achievements</MainHeading>
            {filledAchievements.map((a) => (
              <div key={a.id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                {a.body.trim() && <div style={{ fontSize: 13, color: "#555" }}>{a.body}</div>}
                <div style={{ fontSize: 12, color: "#888" }}>
                  {[a.awardingBody, a.year].filter(s => s.trim()).join(" | ")}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Volunteer */}
        {filledVolunteer.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Volunteer</MainHeading>
            {filledVolunteer.map((v) => (
              <div key={v.id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v.role}</div>
                {v.org.trim() && <div style={{ fontSize: 13, color: "#555" }}>{v.org}</div>}
                {v.dates.trim() && <div style={{ fontSize: 12, color: "#888" }}>{v.dates}</div>}
                {v.impact.trim() && <div style={{ fontSize: 13, color: "#444", marginTop: 2 }}>{v.impact}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {filledProjects.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Projects</MainHeading>
            {filledProjects.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                {p.description.trim() && <div style={{ fontSize: 13, color: "#555" }}>{p.description}</div>}
                {p.url.trim() && <div style={{ fontSize: 12, color: "#2d1a44", wordBreak: "break-all" }}>{p.url}</div>}
                {p.outcomes.trim() && <div style={{ fontSize: 13, color: "#444", marginTop: 2 }}>{p.outcomes}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Publications */}
        {filledPublications.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Publications</MainHeading>
            {filledPublications.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {[p.outlet, p.date].filter(s => s.trim()).join(" | ")}
                </div>
                {p.url.trim() && <div style={{ fontSize: 12, color: "#2d1a44", wordBreak: "break-all" }}>{p.url}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Memberships */}
        {filledMemberships.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <MainHeading>Memberships</MainHeading>
            {filledMemberships.map((m) => (
              <div key={m.id} style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.org}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {[m.level, m.year].filter(s => s.trim()).join(" | ")}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function SidebarSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 3, marginBottom: 10 }}>
      {children}
    </h3>
  );
}

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#2d1a44", borderBottom: "1.5px solid #2d1a44", paddingBottom: 4, marginBottom: 12 }}>
      {children}
    </h2>
  );
}
