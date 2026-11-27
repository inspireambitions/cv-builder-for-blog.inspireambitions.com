"use client";

import { useId, useState } from "react";
import { useLocale } from "@/lib/locale";
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
  const { locale, t } = useLocale();
  const legacyCountName = count === 1
    ? title.toLowerCase().replace(/s$/, "").split(" ").pop()
    : title.toLowerCase().split(" ").pop();
  const countLabel = locale === "en" ? `${count} ${legacyCountName}` : t("extrasUi.count", { count });
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 rounded-lg bg-gray-50 p-4 text-start hover:bg-gray-100 transition-colors"
        >
          <span className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">{title}</span>
            {count > 0 && (
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {countLabel}
              </span>
            )}
          </span>
          <svg
            aria-hidden="true"
            className={`w-5 h-5 shrink-0 text-gray-500 motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
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
      </h3>
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
        aria-hidden="true"
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
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
    >
      {t("form.remove")}
    </button>
  );
}

// ── HR Tip inline ──
function HRTipInline({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border-s-4 border-amber-400 p-3 rounded-e-lg">
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
  const { t } = useLocale();
  const instanceId = useId();

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
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-8">
      <div>
        <h2 id={`${instanceId}-heading`} className="text-lg font-semibold text-gray-900">
          {t("extrasUi.heading")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("extrasUi.hint")}
        </p>
      </div>

      <div className="space-y-4">
        {/* ── 1. Achievements & Awards ── */}
        <AccordionSection
          title={t("extras.achievements")}
          count={achievements.length}
          open={openSections.achievements}
          onToggle={() => toggle("achievements")}
        >
          <HRTipInline text={t("extrasUi.awardTip")} />

          {achievements.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeAchievement(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${instanceId}-achievements-${index}-title`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.title")}
                  </label>
                  <input id={`${instanceId}-achievements-${index}-title`} dir="auto"
                    type="text"
                    value={entry.title}
                    onChange={(e) =>
                      updateAchievement(entry.id, "title", e.target.value)
                    }
                    placeholder={t("extrasUi.awardExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-achievements-${index}-awardingBody`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.awardingBody")}
                  </label>
                  <input id={`${instanceId}-achievements-${index}-awardingBody`} dir="auto"
                    type="text"
                    value={entry.awardingBody}
                    onChange={(e) =>
                      updateAchievement(
                        entry.id,
                        "awardingBody",
                        e.target.value
                      )
                    }
                    placeholder={t("extrasUi.awardingBodyExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-achievements-${index}-year`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.year")}
                  </label>
                  <input id={`${instanceId}-achievements-${index}-year`} dir="ltr" inputMode="numeric"
                    type="text"
                    value={entry.year}
                    onChange={(e) =>
                      updateAchievement(entry.id, "year", e.target.value)
                    }
                    placeholder={t("extrasUi.yearExample")}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${instanceId}-achievements-${index}-briefDescription`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("extrasUi.briefDescription")}
                </label>
                <textarea id={`${instanceId}-achievements-${index}-briefDescription`} dir="auto"
                  value={entry.body}
                  onChange={(e) =>
                    updateAchievement(entry.id, "body", e.target.value)
                  }
                  rows={2}
                  placeholder={t("extrasUi.achievementExample")}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          ))}

          <AddButton label={t("extrasUi.addAchievement")} onClick={addAchievement} />
        </AccordionSection>

        {/* ── 2. Volunteer Work ── */}
        <AccordionSection
          title={t("extras.volunteer")}
          count={volunteer.length}
          open={openSections.volunteer}
          onToggle={() => toggle("volunteer")}
        >
          <HRTipInline text={t("extrasUi.volunteerTip")} />

          {volunteer.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeVolunteer(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${instanceId}-volunteer-${index}-role`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.role")}
                  </label>
                  <input id={`${instanceId}-volunteer-${index}-role`} dir="auto"
                    type="text"
                    value={entry.role}
                    onChange={(e) =>
                      updateVolunteer(entry.id, "role", e.target.value)
                    }
                    placeholder={t("extrasUi.volunteerRoleExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-volunteer-${index}-organisation`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.organisation")}
                  </label>
                  <input id={`${instanceId}-volunteer-${index}-organisation`} dir="auto"
                    type="text"
                    value={entry.org}
                    onChange={(e) =>
                      updateVolunteer(entry.id, "org", e.target.value)
                    }
                    placeholder={t("extrasUi.volunteerOrgExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-volunteer-${index}-dates`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.dates")}
                  </label>
                  <input id={`${instanceId}-volunteer-${index}-dates`} dir="auto"
                    type="text"
                    value={entry.dates}
                    onChange={(e) =>
                      updateVolunteer(entry.id, "dates", e.target.value)
                    }
                    placeholder={t("extrasUi.volunteerDateExample")}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${instanceId}-volunteer-${index}-impact`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("extrasUi.impact")}
                </label>
                <textarea id={`${instanceId}-volunteer-${index}-impact`} dir="auto"
                  value={entry.impact}
                  onChange={(e) =>
                    updateVolunteer(entry.id, "impact", e.target.value)
                  }
                  rows={2}
                  placeholder={t("extrasUi.volunteerImpactExample")}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          ))}

          <AddButton label={t("extrasUi.addVolunteer")} onClick={addVolunteer} />
        </AccordionSection>

        {/* ── 3. Personal Projects ── */}
        <AccordionSection
          title={t("extras.projects")}
          count={projects.length}
          open={openSections.projects}
          onToggle={() => toggle("projects")}
        >
          <HRTipInline text={t("extrasUi.projectTip")} />

          {projects.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeProject(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${instanceId}-projects-${index}-projectName`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.projectName")}
                  </label>
                  <input id={`${instanceId}-projects-${index}-projectName`} dir="auto"
                    type="text"
                    value={entry.name}
                    onChange={(e) =>
                      updateProject(entry.id, "name", e.target.value)
                    }
                    placeholder={t("extrasUi.projectExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-projects-${index}-url`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.url")}{" "}
                    <span className="text-gray-400 font-normal">{t("form.optional")}</span>
                  </label>
                  <input id={`${instanceId}-projects-${index}-url`} dir="ltr" inputMode="url"
                    type="text"
                    value={entry.url}
                    onChange={(e) =>
                      updateProject(entry.id, "url", e.target.value)
                    }
                    placeholder={t("extrasUi.projectUrlExample")}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${instanceId}-projects-${index}-description`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("extrasUi.description")}
                </label>
                <textarea id={`${instanceId}-projects-${index}-description`} dir="auto"
                  value={entry.description}
                  onChange={(e) =>
                    updateProject(entry.id, "description", e.target.value)
                  }
                  rows={2}
                  placeholder={t("extrasUi.projectDescriptionExample")}
                  className={TEXTAREA_CLASS}
                />
              </div>
              <div>
                <label htmlFor={`${instanceId}-projects-${index}-outcomes`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("extrasUi.outcomes")}
                </label>
                <textarea id={`${instanceId}-projects-${index}-outcomes`} dir="auto"
                  value={entry.outcomes}
                  onChange={(e) =>
                    updateProject(entry.id, "outcomes", e.target.value)
                  }
                  rows={2}
                  placeholder={t("extrasUi.outcomesExample")}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          ))}

          <AddButton label={t("extrasUi.addProject")} onClick={addProject} />
        </AccordionSection>

        {/* ── 4. Publications, Media & Speaking ── */}
        <AccordionSection
          title={t("extras.publications")}
          count={publications.length}
          open={openSections.publications}
          onToggle={() => toggle("publications")}
        >
          {publications.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removePublication(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${instanceId}-publications-${index}-title`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.title")}
                  </label>
                  <input id={`${instanceId}-publications-${index}-title`} dir="auto"
                    type="text"
                    value={entry.title}
                    onChange={(e) =>
                      updatePublication(entry.id, "title", e.target.value)
                    }
                    placeholder={t("extrasUi.publicationTitleExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-publications-${index}-outlet`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.outlet")}
                  </label>
                  <input id={`${instanceId}-publications-${index}-outlet`} dir="auto"
                    type="text"
                    value={entry.outlet}
                    onChange={(e) =>
                      updatePublication(entry.id, "outlet", e.target.value)
                    }
                    placeholder={t("extrasUi.outletExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-publications-${index}-date`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.date")}
                  </label>
                  <input id={`${instanceId}-publications-${index}-date`} dir="auto"
                    type="text"
                    value={entry.date}
                    onChange={(e) =>
                      updatePublication(entry.id, "date", e.target.value)
                    }
                    placeholder={t("extrasUi.dateExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-publications-${index}-url`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.url")}{" "}
                    <span className="text-gray-400 font-normal">{t("form.optional")}</span>
                  </label>
                  <input id={`${instanceId}-publications-${index}-url`} dir="ltr" inputMode="url"
                    type="text"
                    value={entry.url}
                    onChange={(e) =>
                      updatePublication(entry.id, "url", e.target.value)
                    }
                    placeholder={t("extrasUi.publicationUrlExample")}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          ))}

          <AddButton label={t("extrasUi.addPublication")} onClick={addPublication} />
        </AccordionSection>

        {/* ── 5. Professional Memberships ── */}
        <AccordionSection
          title={t("extras.memberships")}
          count={memberships.length}
          open={openSections.memberships}
          onToggle={() => toggle("memberships")}
        >
          {memberships.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-end">
                <RemoveButton onClick={() => removeMembership(entry.id)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor={`${instanceId}-memberships-${index}-organisationName`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.organisationName")}
                  </label>
                  <input id={`${instanceId}-memberships-${index}-organisationName`} dir="auto"
                    type="text"
                    value={entry.org}
                    onChange={(e) =>
                      updateMembership(entry.id, "org", e.target.value)
                    }
                    placeholder={t("extrasUi.professionalOrgExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-memberships-${index}-membershipLevel`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.membershipLevel")}
                  </label>
                  <input id={`${instanceId}-memberships-${index}-membershipLevel`} dir="auto"
                    type="text"
                    value={entry.level}
                    onChange={(e) =>
                      updateMembership(entry.id, "level", e.target.value)
                    }
                    placeholder={t("extrasUi.levelExample")}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-memberships-${index}-yearJoined`} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("extrasUi.yearJoined")}
                  </label>
                  <input id={`${instanceId}-memberships-${index}-yearJoined`} dir="ltr" inputMode="numeric"
                    type="text"
                    value={entry.year}
                    onChange={(e) =>
                      updateMembership(entry.id, "year", e.target.value)
                    }
                    placeholder={t("extrasUi.yearJoinedExample")}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          ))}

          <AddButton label={t("extrasUi.addMembership")} onClick={addMembership} />
        </AccordionSection>
      </div>
    </section>
  );
}
