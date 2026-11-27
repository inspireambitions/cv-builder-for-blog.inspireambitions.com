"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Eye } from "lucide-react";
import { useCVState } from "@/lib/state";
import { useLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";
import type { CVState, ExpEntry, LangEntry } from "@/lib/types";
import { defaultTalkProgress, getTalkFamily, getTalkQuestions, getTalkTitles, getTalkWorkplaces, getTalkAchievements, newTalkJob } from "@/lib/talk-flow";
import { appendExperienceSentence, getRoleFamilies, getTalkSentences } from "@/lib/role-suggestions";
import { finishCV } from "@/lib/cv-finish";
import { checkCV, reviewIssueLabel, type CVIssue } from "@/lib/cv-quality";
import { JobDetailQuestions } from "@/components/shared/RoleSentenceSuggestions";
import { PhoneField, LocationFields } from "@/components/shared/CVContactFields";
import { findBannedCVPhrase } from "@/lib/banned-phrases";
import { experienceDateText, MONTHS } from "@/lib/experience-dates";
import { recommendTemplateForTitle } from "@/lib/template-recommendation";
import { TEMPLATE_INFO } from "@/lib/constants";
import { getRoleExamplesForFamily } from "@/lib/role-examples";
import { talkBasicChoiceKey } from "@/lib/locales/talk-basic-choices";
import { talkWorkChoiceKey } from "@/lib/locales/talk-work-choices";
import { detectGeo } from "@/lib/geo";
import { trackToolEvent } from "@/lib/analytics";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { languageOptions, visibleLanguageOptions } from "@/lib/ui-languages";
import { getTalkTranslationExamples } from "@/lib/talk-translation-evidence";

const PhotoEditor = dynamic(() => import("@/components/shared/PhotoEditor"));
const SectorTemplate = dynamic(() => import("@/components/templates/SectorTemplate"));
const ATSCleanTemplate = dynamic(() => import("@/components/templates/ATSCleanTemplate"));
const DownloadModal = dynamic(() => import("@/components/modals/DownloadModal"));
const control = "min-h-12 rounded-lg border border-gray-300 bg-white px-4 py-3 text-start text-base text-ink transition-colors hover:border-accent active:bg-gray-100 disabled:opacity-60";
const field = "mt-2 min-h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-ink";
const LEVELS: { label: string; value: LangEntry["level"] }[] = [{ label: "Basic", value: "Basic" }, { label: "Good", value: "Conversational" }, { label: "Very good", value: "Fluent" }, { label: "Native", value: "Native" }];
const CITIES = ["Dubai, UAE", "Abu Dhabi, UAE", "Doha, Qatar", "Riyadh, Saudi Arabia", "Muscat, Oman", "Manama, Bahrain", "Kuwait City, Kuwait"];
const SCHOOLS = ["No formal school", "Primary school", "Secondary school", "High school", "Diploma or certificate", "University", "Other"];

const SKILLS = ["Teamwork", "Time keeping", "Safety checks", "Customer service"];
const firstWorkTypes = ["housekeeping", "kitchen-steward", "food-service", "driver", "security", "cleaning", "front-office", "reservations", "general"];

export default function TalkMode() {
  const { state, setState, updateField, updatePersonal, hydrated, restoredAt, dismissRestoreBanner } = useCVState();
  const { locale, setLocale, dir, t } = useLocale();
  const talk = state.talk ?? defaultTalkProgress;
  const questions = getTalkQuestions(state);
  const questionIndex = Math.max(0, questions.findIndex((item) => item.id === talk.questionId));
  const current = questions[questionIndex];
  const jobIndex = current.jobIndex ?? 0;
  const job = state.experience[jobIndex];
  const family = getTalkFamily(state, jobIndex);
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const [preview, setPreview] = useState(false);
  const [download, setDownload] = useState(false);
  const [returnToCheck, setReturnToCheck] = useState(false);
  const [allDesigns, setAllDesigns] = useState(false);
  const [allWorkTypes, setAllWorkTypes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ownSkill, setOwnSkill] = useState("");
  const [ownLanguage, setOwnLanguage] = useState("");
  const [editingBullet, setEditingBullet] = useState<number | null>(null);
  // Interface text and suggested sentences can be in the selected UI language.
  // Their saved CV values stay English; choose a different language for typed text.
  const inputLang = talk.answerLanguages?.[job?.id] ?? "en";

  useEffect(() => {
    if (hydrated && !started.current) {
      started.current = true;
      trackToolEvent("talk_mode_started", { lang: locale });
    }
  }, [hydrated, locale]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
    return () => { abort.current?.abort(); abort.current = null; };
  }, [current.id]);
  useEffect(() => {
    let active = true;
    detectGeo().then((geo) => { if (active) updateField({ geo }); });
    return () => { active = false; };
  }, [updateField]);

  function patchTalk(partial: Partial<typeof talk>) {
    setState((previous) => ({ ...previous, talk: { ...(previous.talk ?? defaultTalkProgress), ...partial } }));
  }
  function patchJob(partial: Partial<ExpEntry>) {
    setState((previous) => ({ ...previous, experience: previous.experience.map((entry, index) => {
      if (index !== jobIndex) return entry;
      const next = { ...entry, ...partial };
      return { ...next, dates: experienceDateText(next) };
    }) }));
  }
  function appendDuty(line: string) {
    setState((previous) => ({ ...previous, experience: previous.experience.map((entry, index) => index === jobIndex ? { ...entry, description: appendExperienceSentence(entry.description, line) } : entry) }));
  }
  function go(id: string) {
    abort.current?.abort();
    abort.current = null;
    setBusy(false);
    setError("");
    setEditingBullet(null);
    if (id === "done") setReturnToCheck(false);
    patchTalk({ questionId: id });
  }
  function next(skip = false) {
    if (!skip && current.kind === "family" && !talk.families[job.id]) { setError(t("talk.chooseFamily")); return; }
    if (!skip && current.kind === "title" && !job.role.trim()) { setError(t("talk.addTitle")); return; }
    if (!skip && current.kind === "design" && !state.templateConfirmed) { setError(t("talk.chooseDesign")); return; }
    if (!skip && (current.kind === "start" || current.kind === "end")) {
      const start = current.kind === "start";
      const month = start ? job.startMonth : job.endMonth;
      const year = start ? job.startYear : job.endYear;
      if (Boolean(month) !== Boolean(year)) { setError(t("talk.bothDates")); return; }
      if (!start && month && year && job.startMonth && job.startYear && Number(year) * 12 + Number(month) < Number(job.startYear) * 12 + Number(job.startMonth)) { setError(t("talk.dateOrder")); return; }
    }
    if (!skip && current.kind === "contact" && state.personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.personal.email.trim())) { setError(t("talk.checkEmail")); return; }
    trackToolEvent(skip ? "talk_question_skipped" : "talk_question_answered", { questionId: current.kind, lang: locale });
    const nextQuestion = questions[questionIndex + 1];
    if (nextQuestion) go(nextQuestion.id);
  }
  function addJob() {
    const existing = state.experience[jobIndex + 1];
    if (existing) { go(`${existing.id}-family`); return; }
    const added = newTalkJob();
    setState((previous) => ({ ...previous, experience: [...previous.experience, added], talk: { ...(previous.talk ?? defaultTalkProgress), questionId: `${added.id}-family` } }));
    trackToolEvent("talk_question_answered", { questionId: "another", lang: locale });
  }
  function toggleSkill(value: string) {
    setState((previous) => ({ ...previous, skills: previous.skills.includes(value) ? previous.skills.filter((skill) => skill !== value) : [...previous.skills, value] }));
  }
  function toggleLanguage(value: string) {
    setState((previous) => ({ ...previous, languages: previous.languages.some((entry) => entry.language === value) ? previous.languages.filter((entry) => entry.language !== value) : [...previous.languages.filter((entry) => entry.language), { id: `lang-${crypto.randomUUID()}`, language: value, level: "" }] }));
  }
  async function writeBullets() {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 12000);
    setBusy(true); setError("");
    const source = job.description;
    try {
      const response = await fetch("/api/talk/bullets", { method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ familyKey: family.key, jobTitle: job.role, inputLang, text: source }) });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (response.status === 422 && data.code === "unsupported_translation") {
        setError(t("talk.noSafeTranslation"));
        return;
      }
      if (!response.ok) throw new Error("unavailable");
      if (Array.isArray(data.bullets) && data.bullets.every((line: unknown) => typeof line === "string")) {
        const originals: unknown = data.sourceLines;
        const translated = data.method === "catalogue_translation";
        if (translated && (!Array.isArray(originals) || originals.length !== data.bullets.length
          || !originals.every((line: unknown) => typeof line === "string"))) throw new Error("invalid");
        setState((previous) => {
          const entry = previous.experience.find((item) => item.id === job.id);
          if (entry?.description !== source) return previous;
          return { ...previous, talk: { ...(previous.talk ?? defaultTalkProgress), suggestions: { ...(previous.talk?.suggestions ?? {}), [job.id]: (data.bullets as string[]).flatMap((text, index) => findBannedCVPhrase(text) ? [] : [{
            text, status: "pending",
            original: translated && Array.isArray(originals) ? { text: originals[index] as string, lang: inputLang } : undefined,
          }]) } } };
        });
      } else throw new Error("invalid");
    } catch {
      if (abort.current === controller) setError(t("talk.aiUnavailable"));
    } finally {
      window.clearTimeout(timer);
      if (abort.current === controller) setBusy(false);
    }
  }
  function decideBullet(index: number, status: "kept" | "removed") {
    const value = talk.suggestions[job.id]?.[index];
    if (!value) return;
    setState((previous) => {
      const entry = previous.experience.find((item) => item.id === job.id);
      if (!entry) return previous;
      let description = entry.description;
      if (status === "kept" && value.original) {
        const lines = description.split(/\r\n|[\r\n\u2028\u2029]/u);
        const sourceIndex = lines.findIndex((line) => line.trim() === value.original?.text);
        if (sourceIndex < 0) return previous;
        lines[sourceIndex] = value.text;
        description = lines.join("\n");
      } else if (status === "kept") description = appendExperienceSentence(description, value.text);
      return { ...previous,
        experience: previous.experience.map((item) => item.id === job.id ? { ...item, description } : item),
        talk: { ...(previous.talk ?? defaultTalkProgress), suggestions: { ...(previous.talk?.suggestions ?? {}), [job.id]: (previous.talk?.suggestions[job.id] ?? []).map((item, i) => i === index ? { ...item, status } : item) } },
      };
    });
    if (status === "kept") trackToolEvent(editingBullet === index ? "talk_bullets_changed" : "talk_bullets_accepted", { lang: locale });
    setEditingBullet(null);
  }
  const finished = current.kind === "summary" || current.kind === "done" ? finishCV(state).cv : undefined;
  const missing = current.kind === "done" && finished ? checkCV(finished) : [];
  const basicMissing = missing.filter((issue) => issue.basic).length;
  function fix(issue: CVIssue) {
    setReturnToCheck(true);
    if (issue.step === 1) { go("contact"); return; }
    if (issue.step === 4) { go("languages"); return; }
    const job = state.experience.find((entry) => issue.field?.startsWith(`${entry.id}-`));
    if (job && issue.field?.endsWith("-dates")) { go(`${job.id}-start`); return; }
    if (job && issue.field?.endsWith("-description")) { go(`${job.id}-duties`); return; }
    updateField({ builderMode: "full", step: issue.step });
  }
  function finish() {
    if (!talk.completed) { patchTalk({ completed: true }); trackToolEvent("talk_mode_completed", { lang: locale }); }
    setDownload(true);
  }
  const recommended = [...new Set([recommendTemplateForTitle(state.personal.title), "ats-clean", "classic"])] as CVState["template"][];
  if (recommended.length < 3) recommended.push("service");
  const summaries = finished?.summary ?? "";
  const skillFamily = getTalkFamily(state, 0).key;
  const roleSkill = getRoleExamplesForFamily(skillFamily).skill;
  const displayChoice = (original: string) => {
    const key = talkBasicChoiceKey(original) ?? talkWorkChoiceKey(original);
    return key ? t(key) : original;
  };
  const selectedDuties = job?.description.split("\n").map((line) => line.replace(/^[•-]\s*/, "").trim()) ?? [];
  const isDone = current.kind === "done";
  const workTypes = allWorkTypes ? getRoleFamilies() : [...new Set([...firstWorkTypes, family.key])]
    .flatMap((key) => getRoleFamilies().filter((item) => item.key === key));

  return <div className="talk-mode min-h-screen bg-ground" dir={dir}>
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span lang="en" dir="ltr" data-testid="brand" className="font-bold text-ink">{t("brand.inspireAmbitions")}</span>
        <LanguageToggle />
      </div>
    </header>
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:pt-8">
      {restoredAt && <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4"><p>{t("talk.savedCV")}</p><button className={`${control} mt-3`} onClick={dismissRestoreBanner}>{t("talk.continue")}</button></div>}
      {locale !== "en" && <p className="mb-4 text-sm text-ink-muted">{t("talk.draft")}</p>}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted" data-testid="talk-progress">{t("talk.progress", { current: questionIndex + 1, total: questions.length })}</p>
        <button className={control} onClick={() => setPreview(!preview)}><Eye className="me-2 inline h-4 w-4" aria-hidden="true" />{t(preview ? "talk.closeCV" : "talk.seeCV")}</button>
      </div>
      {preview && <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3" aria-label={t("talk.preview")}><div className="origin-top-left" style={{ zoom: "0.36" }}>{state.template === "ats-clean" ? <ATSCleanTemplate state={state} /> : <SectorTemplate state={state} />}</div></div>}
      <div className="mb-5 flex items-start gap-3"><BriefcaseBusiness className="mt-1 h-6 w-6 shrink-0 text-accent" aria-hidden="true" /><h1 ref={heading} tabIndex={-1} className="text-balance text-2xl font-bold text-ink focus:outline-none" lang={locale}>{t(`talk.question.${current.kind}`)}</h1></div>
      <div className="space-y-4" lang={locale}>
        {current.kind === "language" && <div className="grid gap-3">{visibleLanguageOptions.map((item) => <button key={item.value} className={control} lang={item.value} aria-pressed={locale === item.value} onClick={() => setLocale(item.value as Locale)}>{item.label}</button>)}</div>}
        {current.kind === "family" && <><div className="grid gap-3 sm:grid-cols-2">{workTypes.map((item) => <button key={item.key} className={control} aria-pressed={talk.families[job.id] === item.key} onClick={() => { patchJob({ roleFamily: item.key === "general" ? undefined : item.key });
          patchTalk({ families: { ...talk.families, [job.id]: item.key } }); }}>{item.key === "general" ? t("talk.otherWork") : t(`role.label.${item.key}`)}</button>)}</div>
          <button type="button" className={control} aria-expanded={allWorkTypes} onClick={() => setAllWorkTypes(!allWorkTypes)}>{t(allWorkTypes ? "talk.fewerWork" : "talk.moreWork")}</button>
        </>}
        {current.kind === "title" && <><div className="grid gap-3">{getTalkTitles(family.key).map((title) => <button key={title} className={control} aria-pressed={job.role === title} onClick={() => { patchJob({ role: title }); if (jobIndex === 0 && (!state.personal.title || state.personal.title === job.role)) updatePersonal({ title }); }}>{displayChoice(title)}</button>)}</div><label className="block">{t("talk.jobTitle")}<input dir="auto" className={field} value={job.role} autoComplete="organization-title" enterKeyHint="next" onChange={(event) => { const title = event.target.value; patchJob({ role: title }); if (jobIndex === 0 && (!state.personal.title || state.personal.title === job.role)) updatePersonal({ title }); }} /></label></>}
        {current.kind === "company" && <><label className="block">{t("talk.company")}<input dir="auto" className={field} value={job.company} autoComplete="organization" onChange={(event) => patchJob({ company: event.target.value })} /></label><button className={control} onClick={() => patchJob({ company: "", companyDesc: "Prefer not to say" })}>{t("talk.companyPrivate")}</button>{job.companyDesc && <><p>{t("talk.companyDescription")}</p><div className="grid gap-3">{getTalkWorkplaces(family.key).map((name) => <button key={name} className={control} aria-pressed={job.companyDesc === name} onClick={() => patchJob({ company: "", companyDesc: name })}>{displayChoice(name)}</button>)}</div></>}</>}
        {current.kind === "location" && <><div className="grid gap-3 sm:grid-cols-2">{CITIES.map((city) => <button key={city} className={control} aria-pressed={job.location === city} onClick={() => patchJob({ location: city })}>{displayChoice(city)}</button>)}</div><label className="block">{t("talk.cityCountry")}<input dir="auto" className={field} value={job.location} autoComplete="off" onChange={(event) => patchJob({ location: event.target.value })} /></label></>}
        {(current.kind === "start" || current.kind === "end") && <div className="grid grid-cols-2 gap-3"><label>{t("talk.month")}<select aria-label={t("talk.month")} className={field} value={(current.kind === "start" ? job.startMonth : job.endMonth) ?? ""} onChange={(event) => patchJob(current.kind === "start" ? { startMonth: event.target.value } : { endMonth: event.target.value })}><option value="">{t("dates.chooseMonth")}</option>{MONTHS.map((month, i) => <option value={i + 1} key={month}>{t(`month.${i + 1}`)}</option>)}</select></label><label>{t("talk.year")}<select aria-label={t("talk.year")} dir="ltr" className={field} value={(current.kind === "start" ? job.startYear : job.endYear) ?? ""} onChange={(event) => patchJob(current.kind === "start" ? { startYear: event.target.value } : { endYear: event.target.value })}><option value="">{t("dates.chooseYear")}</option>{Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((year) => <option key={year}>{year}</option>)}</select></label></div>}
        {current.kind === "current" && <div className="grid grid-cols-2 gap-3">{[true, false].map((value) => <button key={String(value)} className={control} aria-pressed={job.current === value} onClick={() => patchJob({ current: value })}>{t(value ? "talk.yes" : "talk.no")}</button>)}</div>}
        {(current.kind === "duties" || current.kind === "proud") && <>
          <label className="block">
            {t("talk.answerLanguage")}
            <select value={inputLang} className={field} onChange={(event) => {
              abort.current?.abort();
              abort.current = null;
              setBusy(false);
              setError("");
              patchTalk({ answerLanguages: { ...talk.answerLanguages, [job.id]: event.target.value as Locale } });
            }}>
              {languageOptions.map((option) => <option key={option.value} value={option.value} lang={option.value}>{option.label}</option>)}
            </select>
          </label>
          <p lang={locale}>{t("talk.trueLines")}</p>
          <div className="grid gap-3">
            {(inputLang === "en"
              ? (current.kind === "duties" ? getTalkSentences(family.key) : getTalkAchievements(family.key))
              : current.kind === "duties" ? getTalkTranslationExamples(family.key, inputLang) : []).map((line, index) =>
                <button key={line} className={control} lang={inputLang === "en" ? locale : inputLang} dir="auto" aria-pressed={selectedDuties.includes(line)}
                  onClick={() => selectedDuties.includes(line) ? patchJob({ description: selectedDuties.filter((item) => item !== line).join("\n") }) : appendDuty(line)}>
                  {selectedDuties.includes(line) && <Check className="me-2 inline h-4 w-4" aria-hidden="true" />}
                  {inputLang !== "en" ? line : current.kind === "duties" ? t(`role.sentence.${family.key}.${index}`) : displayChoice(line)}
                </button>
            )}
          </div>
          <label className="block" lang={locale} htmlFor="talk-duty-answer">{t("talk.ownWords")}
            <textarea id="talk-duty-answer" aria-label={t("talk.ownWords")} className={`${field} min-h-32`} value={job.description} maxLength={4000} lang={inputLang} dir="auto"
              onChange={(event) => patchJob({ description: event.target.value })} />
          </label>
          {current.kind === "duties" && inputLang === "en" && <JobDetailQuestions familyKey={family.key} value={job.description} onChange={(description) => patchJob({ description })} />}
          <p className="text-sm text-ink-muted" lang={locale}>{t("talk.linesSaved")}</p>
          <button className={control} lang={locale} disabled={busy || !job.description.trim()} onClick={writeBullets}>
            {t(inputLang === "en" ? "talk.helpLines" : "talk.showEnglish")}
          </button>
          {(talk.suggestions[job.id] ?? []).map((item, index) => {
            if (item.status === "removed") return null;
            const original = item.original;
            if (original && item.status === "pending" &&
              !job.description.split(/\r\n|[\r\n\u2028\u2029]/u).some((line) => line.trim() === original.text)) return null;
            return <div key={index} className="rounded-xl border border-gray-200 bg-white p-4" lang={locale}>
              {original && <>
                <p className="text-sm font-semibold">{t("talk.originalWords")}</p>
                <p dir="auto" lang={original.lang}>{original.text}</p>
                <p className="mt-3 text-sm font-semibold">{t("talk.englishWords")}</p>
              </>}
              {!original && editingBullet === index
                ? <label>{t("talk.changeLine")}<textarea className={`${field} min-h-24`} dir="auto" value={item.text}
                    onChange={(event) => patchTalk({ suggestions: { ...talk.suggestions, [job.id]: talk.suggestions[job.id].map((line, i) => i === index ? { ...line, text: event.target.value } : line) } })} /></label>
                : <p lang="en" dir="ltr">{item.text}</p>}
              {item.status === "kept" ? <p className="mt-3">{t("talk.added")}</p>
                : <div className="mt-3 flex flex-wrap gap-2">
                  <button className={control} onClick={() => decideBullet(index, "kept")}>{t(original ? "talk.replaceEnglish" : "talk.keep")}</button>
                  {!original && <button className={control} onClick={() => setEditingBullet(index)}>{t("talk.change")}</button>}
                  <button className={control} onClick={() => decideBullet(index, "removed")}>{t("talk.remove")}</button>
                </div>}
            </div>;
          })}
        </>}
        {current.kind === "another" && <div className="grid grid-cols-2 gap-3"><button className={control} onClick={addJob}>{t("talk.addJob")}</button><button className={control} onClick={() => { trackToolEvent("talk_question_answered", { questionId: "another", lang: locale }); go("school"); }}>{t("talk.noNext")}</button></div>}
        {current.kind === "school" && <div className="grid gap-3">{SCHOOLS.map((level) => <button key={level} className={control} aria-pressed={state.education[0]?.degree === level} onClick={() => updateField({ education: [{ ...(state.education[0] ?? { id: "edu-1", institution: "", year: "", grade: "" }), degree: level === "No formal school" ? "" : level }, ...state.education.slice(1)] })}>{displayChoice(level)}</button>)}</div>}
        {current.kind === "school-details" && <>{(["degree", "institution", "year"] as const).map((key) => <label className="block" key={key}>{t(key === "degree" ? "talk.schoolCourse" : key === "institution" ? "talk.schoolCentre" : "talk.year")}<input className={field} value={state.education[0]?.[key] ?? ""} onChange={(event) => updateField({ education: state.education.map((entry, i) => i === 0 ? { ...entry, [key]: event.target.value } : entry) })} /></label>)}</>}
        {current.kind === "skills" && <><p>{t("talk.skillsChoose")}</p><div className="grid gap-3 sm:grid-cols-2">{[...new Set([...(roleSkill === "A skill you use at work" ? [] : [roleSkill]), ...SKILLS, ...state.skills])].map((skill) => <button key={skill} className={control} dir="auto" aria-pressed={state.skills.includes(skill)} onClick={() => toggleSkill(skill)}>{skill === roleSkill ? t(`example.skill.${skillFamily}`) : displayChoice(skill)}</button>)}</div><label className="block">{t("talk.ownSkill")}<input dir="auto" className={field} value={ownSkill} maxLength={100} onChange={(event) => setOwnSkill(event.target.value)} /></label><button className={control} disabled={!ownSkill.trim()} onClick={() => { if (!state.skills.includes(ownSkill.trim())) toggleSkill(ownSkill.trim()); setOwnSkill(""); }}>{t("talk.addSkill")}</button></>}
        {current.kind === "languages" && <><div className="grid gap-3 sm:grid-cols-2">{["English", "Arabic", "Hindi", "Urdu", "Tagalog", ...state.languages.map((entry) => entry.language)].filter((value, i, values) => value && values.indexOf(value) === i).map((name) => <button key={name} className={control} dir="auto" aria-pressed={state.languages.some((entry) => entry.language === name)} onClick={() => toggleLanguage(name)}>{displayChoice(name)}</button>)}</div><label className="block">{t("talk.anotherLanguage")}<input dir="auto" className={field} value={ownLanguage} onChange={(event) => setOwnLanguage(event.target.value)} /></label><button className={control} disabled={!ownLanguage.trim()} onClick={() => { if (!state.languages.some((entry) => entry.language === ownLanguage.trim())) toggleLanguage(ownLanguage.trim()); setOwnLanguage(""); }}>{t("talk.addLanguage")}</button>{state.languages.filter((entry) => entry.language).map((entry) => <fieldset key={entry.id}><legend className="mb-2">{t("talk.levelIn", { language: displayChoice(entry.language) })}</legend><div className="grid grid-cols-2 gap-3">{LEVELS.map((level) => <button key={level.value} className={control} aria-pressed={entry.level === level.value} onClick={() => updateField({ languages: state.languages.map((item) => item.id === entry.id ? { ...item, level: level.value } : item) })}>{displayChoice(level.label)}</button>)}</div></fieldset>)}</>}
        {current.kind === "visa" && <><p>{t("talk.gulfOnly")}</p><div className="grid gap-3">{(["Employment", "Visit", "Golden", "Investor", "Cancelled", "Outside UAE", "Prefer not to say"] as const).map((status) => <button key={status} className={control} aria-pressed={state.personal.visa_status === status} onClick={() => updatePersonal({ visa_status: status })}>{displayChoice(status)}</button>)}</div></>}
        {current.kind === "notice" && <><p>{t("talk.noticeStart")}</p><div className="grid gap-3">{["Now", "1 week", "1 month", "2 months or more"].map((value) => <button key={value} className={control} aria-pressed={state.personal.notice_period === value} onClick={() => updatePersonal({ notice_period: value })}>{displayChoice(value)}</button>)}</div></>}
        {current.kind === "licence" && <><p>{t("talk.currentLicence")}</p><label className="block">{t("personalUi.mobileLicence")}<input dir="auto" className={field} value={state.personal.driving_license} placeholder={t("personalUi.mobileLicenceExample")} onChange={(event) => updatePersonal({ driving_license: event.target.value })} /></label><button className={control} onClick={() => updatePersonal({ driving_license: "" })}>{t("talk.noLicence")}</button></>}
        {current.kind === "letter" && <><p>{t("talk.nocExplain")}</p><div className="grid gap-3">{(["Yes", "No", "Not applicable"] as const).map((value) => <button key={value} className={control} aria-pressed={state.personal.noc_available === value} onClick={() => updatePersonal({ noc_available: value })}>{displayChoice(value)}</button>)}</div></>}
        {current.kind === "contact" && <><label className="block">{t("personalUi.yourName")}<input dir="auto" className={field} autoComplete="name" value={state.personal.name} onChange={(event) => updatePersonal({ name: event.target.value })} /></label><PhoneField phone={state.personal.phone} onChange={(phone) => updatePersonal({ phone })} placeholder={state.geo === "gulf" ? "+971" : "+44"} /><label className="block">{t("talk.emailOptional")}<input className={field} dir="ltr" type="email" autoComplete="email" value={state.personal.email} onChange={(event) => { updatePersonal({ email: event.target.value }); patchTalk({ noEmail: false }); }} /></label><button className={control} aria-pressed={talk.noEmail} onClick={() => { updatePersonal({ email: "" }); patchTalk({ noEmail: true }); }}>{t("talk.noEmail")}</button>{talk.noEmail && <p>{t("talk.pictureFree")}</p>}<LocationFields value={state.personal.location} onChange={(location) => updatePersonal({ location })} /></>}
        {current.kind === "photo" && <PhotoEditor compact />}
        {current.kind === "summary" && <section className="space-y-4" dir={dir} lang={locale}>
          <p>{t("talk.profileFacts")}</p>
          <div role="region" aria-label={t("talk.profileAbout")}>
            <h2 className="text-sm font-semibold">{t("talk.profileAbout")}</h2>
            <p className="mt-2 whitespace-pre-line rounded-lg border border-gray-300 bg-white p-4 text-base text-ink"
              dir={state.cvLanguage === "ar" ? "rtl" : "ltr"} lang={state.cvLanguage}>{summaries}</p>
          </div>
          <p className="text-sm text-ink-muted">{t("talk.profileUpdate")}</p>
          <button className={control} onClick={() => next()}>{t("talk.profileKeep")}</button>
        </section>}
        {current.kind === "design" && <><div className="grid gap-3">{TEMPLATE_INFO.filter((item) => allDesigns || recommended.includes(item.key)).map((item) => <button key={item.key} className={control} aria-pressed={state.template === item.key && state.templateConfirmed} onClick={() => updateField({ template: item.key, templateConfirmed: true })}><strong>{item.name}</strong><span className="mt-1 block text-sm text-ink-muted">{t(item.key === recommended[0] ? "talk.designRecommended" : "talk.designChoose")}</span></button>)}</div><button className={control} onClick={() => setAllDesigns(!allDesigns)}>{t(allDesigns ? "talk.designThree" : "talk.designAll")}</button></>}
        {isDone && <><div className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="text-xl font-bold">{t(missing.length === 1 ? "review.one" : missing.length ? "review.many" : "review.ready", { count: missing.length })}</h2>{missing.map((item) => <button key={item.id} className={`${control} mt-3 block w-full`} onClick={() => fix(item)}> {reviewIssueLabel(item, t)}</button>)}<p className="mt-3">{t("review.readyHelp")}</p><button className="mt-4 min-h-12 w-full rounded-lg bg-accent px-4 py-3 font-bold text-white" onClick={finish}>{t("review.download")}</button></div>{talk.noEmail && <p>{t("talk.pictureFree")}</p>}</>}
        {busy && <div role="status" className="space-y-2"><p>{t("talk.writing")}</p><div className="h-4 rounded-lg bg-gray-200 motion-safe:animate-pulse" /><div className="h-4 w-3/4 rounded-lg bg-gray-200 motion-safe:animate-pulse" /></div>}
        {error && <p className="rounded-lg border border-gray-300 bg-white p-4" role="alert">{error}</p>}
      </div>
      <div className="mt-8 border-t border-gray-200 pt-4">
        <p className="mb-3 text-sm text-ink-muted" data-testid="talk-save">{t("talk.saved")}</p>
        <div className="grid grid-cols-2 gap-3"><button className={control} disabled={questionIndex === 0} onClick={() => go(questions[questionIndex - 1].id)}><ArrowLeft className={`me-2 inline h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} aria-hidden="true" />{t("talk.back")}</button>{!isDone && current.kind !== "another" && <button className="min-h-12 rounded-lg bg-accent px-4 py-3 font-bold text-white disabled:opacity-60" disabled={!hydrated} onClick={() => next()}>{t("talk.saveContinue")}<ArrowRight className={`ms-2 inline h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} aria-hidden="true" /></button>}</div>
        {!isDone && returnToCheck && <button type="button" className={`${control} mt-3 w-full text-center font-semibold`} onClick={() => go("done")}>{t("builder.returnToCheck")}</button>}
        {current.optional && <button className={`${control} mt-3 w-full text-center`} onClick={() => next(true)}>{t("talk.skip")}</button>}
        <button className={`${control} mt-3 w-full text-center`} onClick={() => { abort.current?.abort(); updateField({ builderMode: "full", step: 1 }); }}>{t("talk.fullForm")}</button>
      </div>
    </main>
    {isDone && !preview && <div hidden aria-hidden="true">{state.template === "ats-clean" ? <ATSCleanTemplate state={state} /> : <SectorTemplate state={state} />}</div>}
    <DownloadModal basicMissing={basicMissing} isOpen={download} onClose={() => setDownload(false)} />
  </div>;
}
