"use client";

import { useState } from "react";
import { useCVState } from "@/lib/state";
import type {
  AchievementEntry,
  VolunteerEntry,
  ProjectEntry,
  PublicationEntry,
  MembershipEntry,
} from "@/lib/types";

function genId(prefix: string) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

// ── Accordion wrapper ──
function AccordionSection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {count > 0 && (
            <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {count} {count === 1 ? title.toLowerCase().replace(/s$/, "").split(" ").pop() : title.toLowerCase().split(" ").pop()}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// ── Add button ──
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      {label}
    </button>
  );
}

// ── Remove button ──
function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
    >
      Remove
    </button>
  );
}

// ── HR Tip inline ──
function HRTipInline({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
      <p className="text-sm text-amber-900">{text}</p>
    </div>
  );
}

const INPUT_CLASS =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow";
const TEXTAREA_CLASS =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow resize-y";

export default function StepExtras() {
  const { state, updateField } = useCVState();

  // Accordion open state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    achievements: false,
    volunteer: false,
    projects: false,
    publications: false,
    memberships: false,
  });

  function toggle(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ── 1. Achievements ──
  const achievements = state.achievements;

  function updateAchievement(
    id: string,
    field: keyof AchievementEntry,
    value: string
  ) {
    updateField({
      achievements: achievements.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  }

  function addAchievement() {
    updateField({
      achievements: [
        ...achievements,
        { id: genId("ach"), title: "", awardingBody: "", year: "", body: "" },
      ],
    });
    setOpenSections((prev) => ({ ...prev, achievements: true }));
  }

  function removeAchievement(id: string) {
    updateField({ achievements: achievements.filter((a) => a.id !== id) });
  }

  // ── 2. Volunteer ──
  const volunteer = state.volunteer;

  function updateVolunteer(
    id: string,
    field: keyof VolunteerEntry,
    value: string
  ) {
    updateField({
      volunteer: volunteer.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    });
  }

  function addVolunteer() {
    updateField({
      volunteer: [
        ...volunteer,
        { id: genId("vol"), role: "", org: "", dates: "", impact: "" },
      ],
    });
    setOpenSections((prev) => ({ ...prev, volunteer: true }));
  }

  function removeVolunteer(id: string) {
    updateField({ volunteer: volunteer.filter((v) => v.id !== id) });
  }

  // ── 3. Projects ──
  const projects = state.projects;

  function updateProject(
    id: string,
    field: keyof ProjectEntry,
    value: string
  ) {
    updateField({
      projects: projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  }

  function addProject() {
    updateField({
      projects: [
        ...projects,
        {
          id: genId("proj"),
          name: "",
          description: "",
          url: "",
          outcomes: "",
        },
      ],
    });
    setOpenSections((prev) => ({ ...prev, projects: true }));
  }

  function removeProject(id: string) {
    updateField({ projects: projects.filter((p) => p.id !== id) });
  }

  // ── 4. Publications ──
  const publications = state.publications;

  function updatePublication(
    id: string,
    field: keyof PublicationEntry,
    value: string
  ) {
    updateField({
      publications: publications.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  }

  function addPublication() {
    updateField({
      publications: [
        ...publications,
        { id: genId("pub"), title: "", outlet: "", date: "", url: "" },
      ],
    });
    setOpenSections((prev) => ({ ...prev, publications: true }));
  }

  function removePublication(id: string) {
    updateField({ publications: publications.filter((p) => p.id !== id) });
  }

  // ── 5. Memberships ──
  const memberships = state.memberships;

  function updateMembership(
    id: string,
    field: keyof MembershipEntry,
    value: string
  ) {
    updateField({
      memberships: memberships.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  }

  function addMembership() {
    updateField({
      memberships: [
        ...memberships,
        { id: genId("mem"), org: "", level: "", year: "" },
      ],
    });
    setOpenSections((prev) => ({ ...prev, memberships: true }));
  }

  function removeMembership(id: string) {
    updateField({ memberships: memberships.filter((m) => m.id !== id) });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Additional Sections
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Optional sections that can strengthen your CV
        </p>
      </div>

      <div className="space-y-4">
        {/* ── 1. Achievements & Awards ── */}
        <AccordionSection
          title="Achievements & Awards"
          count={achievements.length}
          open={openSections.achievements}
          onToggle={() => toggle("achievements")}
        >
          <HRTipInline text="Awards, patents, speaking engagements, and media features all belong here." />

          {achievements.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeAchievement(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={entry.title}
                    onChange={(e) =>
                      updateAchievement(entry.id, "title", e.target.value)
                    }
                    placeholder="e.g. Employee of the Year"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Awarding Body
                  </label>
                  <input
                    type="text"
                    value={entry.awardingBody}
                    onChange={(e) =>
                      updateAchievement(
                        entry.id,
                        "awardingBody",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Deloitte"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year
                  </label>
                  <input
                    type="text"
                    value={entry.year}
                    onChange={(e) =>
                      updateAchievement(entry.id, "year", e.target.value)
                    }
                    placeholder="e.g. 2023"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Brief Description
                </label>
                <textarea
                  value={entry.body}
                  onChange={(e) =>
                    updateAchievement(entry.id, "body", e.target.value)
                  }
                  rows={2}
                  placeholder="Describe the achievement and its significance"
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          ))}

          <AddButton label="Add Achievement" onClick={addAchievement} />
        </AccordionSection>

        {/* ── 2. Volunteer Work ── */}
        <AccordionSection
          title="Volunteer Work"
          count={volunteer.length}
          open={openSections.volunteer}
          onToggle={() => toggle("volunteer")}
        >
          <HRTipInline text="82% of employers say volunteering positively influences hiring decisions (Deloitte)." />

          {volunteer.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeVolunteer(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role
                  </label>
                  <input
                    type="text"
                    value={entry.role}
                    onChange={(e) =>
                      updateVolunteer(entry.id, "role", e.target.value)
                    }
                    placeholder="e.g. Fundraising Lead"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organisation
                  </label>
                  <input
                    type="text"
                    value={entry.org}
                    onChange={(e) =>
                      updateVolunteer(entry.id, "org", e.target.value)
                    }
                    placeholder="e.g. Red Cross"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Dates
                  </label>
                  <input
                    type="text"
                    value={entry.dates}
                    onChange={(e) =>
                      updateVolunteer(entry.id, "dates", e.target.value)
                    }
                    placeholder="e.g. Jan 2021 – Present"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Impact Description
                </label>
                <textarea
                  value={entry.impact}
                  onChange={(e) =>
                    updateVolunteer(entry.id, "impact", e.target.value)
                  }
                  rows={2}
                  placeholder="Describe the impact of your volunteer work"
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          ))}

          <AddButton label="Add Volunteer Entry" onClick={addVolunteer} />
        </AccordionSection>

        {/* ── 3. Personal Projects ── */}
        <AccordionSection
          title="Personal Projects"
          count={projects.length}
          open={openSections.projects}
          onToggle={() => toggle("projects")}
        >
          <HRTipInline text="Especially important for career changers and recent graduates." />

          {projects.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeProject(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) =>
                      updateProject(entry.id, "name", e.target.value)
                    }
                    placeholder="e.g. Open Source Data Dashboard"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={entry.url}
                    onChange={(e) =>
                      updateProject(entry.id, "url", e.target.value)
                    }
                    placeholder="e.g. https://github.com/username/project"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={entry.description}
                  onChange={(e) =>
                    updateProject(entry.id, "description", e.target.value)
                  }
                  rows={2}
                  placeholder="Describe the project and technologies used"
                  className={TEXTAREA_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Key Outcomes
                </label>
                <textarea
                  value={entry.outcomes}
                  onChange={(e) =>
                    updateProject(entry.id, "outcomes", e.target.value)
                  }
                  rows={2}
                  placeholder="e.g. 500+ GitHub stars, featured on Hacker News"
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          ))}

          <AddButton label="Add Project" onClick={addProject} />
        </AccordionSection>

        {/* ── 4. Publications, Media & Speaking ── */}
        <AccordionSection
          title="Publications, Media & Speaking"
          count={publications.length}
          open={openSections.publications}
          onToggle={() => toggle("publications")}
        >
          {publications.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removePublication(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={entry.title}
                    onChange={(e) =>
                      updatePublication(entry.id, "title", e.target.value)
                    }
                    placeholder="e.g. The Future of Remote Work"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Outlet / Event
                  </label>
                  <input
                    type="text"
                    value={entry.outlet}
                    onChange={(e) =>
                      updatePublication(entry.id, "outlet", e.target.value)
                    }
                    placeholder="e.g. Forbes, TEDx Dubai"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="text"
                    value={entry.date}
                    onChange={(e) =>
                      updatePublication(entry.id, "date", e.target.value)
                    }
                    placeholder="e.g. October 2023"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={entry.url}
                    onChange={(e) =>
                      updatePublication(entry.id, "url", e.target.value)
                    }
                    placeholder="e.g. https://example.com/article"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          ))}

          <AddButton label="Add Publication" onClick={addPublication} />
        </AccordionSection>

        {/* ── 5. Professional Memberships ── */}
        <AccordionSection
          title="Professional Memberships"
          count={memberships.length}
          open={openSections.memberships}
          onToggle={() => toggle("memberships")}
        >
          {memberships.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeMembership(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organisation Name
                  </label>
                  <input
                    type="text"
                    value={entry.org}
                    onChange={(e) =>
                      updateMembership(entry.id, "org", e.target.value)
                    }
                    placeholder="e.g. CIPD, SHRM, PMI"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Membership Level
                  </label>
                  <input
                    type="text"
                    value={entry.level}
                    onChange={(e) =>
                      updateMembership(entry.id, "level", e.target.value)
                    }
                    placeholder="e.g. Fellow, Associate, Member"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year Joined
                  </label>
                  <input
                    type="text"
                    value={entry.year}
                    onChange={(e) =>
                      updateMembership(entry.id, "year", e.target.value)
                    }
                    placeholder="e.g. 2019"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          ))}

          <AddButton label="Add Membership" onClick={addMembership} />
        </AccordionSection>
      </div>
    </div>
  );
}
