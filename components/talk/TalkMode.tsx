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
import { buildPlainSummary } from "@/lib/plain-summary";
import { experienceDateText, MONTHS } from "@/lib/experience-dates";
import { recommendTemplateForTitle } from "@/lib/template-recommendation";
import { TEMPLATE_INFO } from "@/lib/constants";
import { getMissingCVItems } from "@/lib/score";
import { getRoleExamples } from "@/lib/role-examples";
import { detectGeo } from "@/lib/geo";
import { trackToolEvent } from "@/lib/analytics";
import LanguageToggle from "@/components/shared/LanguageToggle";

const PhotoEditor = dynamic(() => import("@/components/shared/PhotoEditor"));
const SectorTemplate = dynamic(() => import("@/components/templates/SectorTemplate"));
const ATSCleanTemplate = dynamic(() => import("@/components/templates/ATSCleanTemplate"));
const DownloadModal = dynamic(() => import("@/components/modals/DownloadModal"));
const control = "min-h-12 rounded-lg border border-gray-300 bg-white px-4 py-3 text-start text-base text-ink transition-colors hover:border-accent active:bg-gray-100 disabled:opacity-60";
const field = "mt-2 min-h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-ink";
const LANGUAGES = [{ code: "en", label: "English" }, { code: "ar", label: "العربية" }, { code: "hi", label: "हिन्दी" }, { code: "ur", label: "اردو" }, { code: "tl", label: "Tagalog" }] as const;
const LEVELS: { label: string; value: LangEntry["level"] }[] = [{ label: "Basic", value: "Basic" }, { label: "Good", value: "Conversational" }, { label: "Very good", value: "Fluent" }, { label: "Native", value: "Native" }];
const CITIES = ["Dubai, UAE", "Abu Dhabi, UAE", "Doha, Qatar", "Riyadh, Saudi Arabia", "Muscat, Oman", "Manama, Bahrain", "Kuwait City, Kuwait"];
const SCHOOLS = ["No formal school", "Primary school", "Secondary school", "High school", "Diploma or certificate", "University", "Other"];

const SKILLS = ["Teamwork", "Time keeping", "Safety checks", "Customer service"];
const ERROR = "We could not write this right now. Your answers are saved. Tap the sentences instead.";

export default function TalkMode() {
  const { state, setState, updateField, updatePersonal, hydrated, restoredAt, dismissRestoreBanner } = useCVState();
  const { locale, setLocale, dir } = useLocale();
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
  const [allDesigns, setAllDesigns] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ownSkill, setOwnSkill] = useState("");
  const [ownLanguage, setOwnLanguage] = useState("");
  const [editingBullet, setEditingBullet] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);
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
    if (current.kind !== "summary") return;
    setState((previous) => previous.talk?.summaryInitialized ? previous : { ...previous, summary: previous.summary || buildPlainSummary(previous), talk: { ...(previous.talk ?? defaultTalkProgress), summaryInitialized: true } });
  }, [current.kind, setState]);
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
    patchTalk({ questionId: id });
  }
  function next(skip = false) {
    if (!skip && current.kind === "family" && !talk.families[job.id]) { setError("Choose your work, or choose Other work."); return; }
    if (!skip && current.kind === "title" && !job.role.trim()) { setError("Add your job title."); return; }
    if (!skip && current.kind === "design" && !state.templateConfirmed) { setError("Choose a design before you continue."); return; }
    if (!skip && current.kind === "summary" && talk.summarySuggestion !== undefined) { setError("Keep the suggested words, or remove them first."); return; }
    if (!skip && (current.kind === "start" || current.kind === "end")) {
      const start = current.kind === "start";
      const month = start ? job.startMonth : job.endMonth;
      const year = start ? job.startYear : job.endYear;
      if (Boolean(month) !== Boolean(year)) { setError("Choose both a month and a year."); return; }
      if (!start && month && year && job.startMonth && job.startYear && Number(year) * 12 + Number(month) < Number(job.startYear) * 12 + Number(job.startMonth)) { setError("Your end date comes before your start date."); return; }
    }
    if (!skip && current.kind === "contact" && state.personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.personal.email.trim())) { setError("Check the email address, or leave it blank."); return; }
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
  async function write(kind: "bullets" | "summary") {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 12000);
    setBusy(true); setError("");
    const source = kind === "bullets" ? job.description : JSON.stringify(summaryAnswers(state));
    try {
      const response = await fetch(`/api/talk/${kind}`, { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(kind === "bullets" ? { familyKey: family.key, jobTitle: job.role, inputLang: locale, text: job.description } : { answers: summaryAnswers(state), inputLang: locale }) });
      const data = await response.json();
      if (!response.ok) throw new Error("unavailable");
      if (controller.signal.aborted) return;
      if (kind === "bullets" && Array.isArray(data.bullets) && data.bullets.every((line: unknown) => typeof line === "string")) {
        setState((previous) => {
          const entry = previous.experience.find((item) => item.id === job.id);
          if (entry?.description !== source) return previous;
          return { ...previous, talk: { ...(previous.talk ?? defaultTalkProgress), suggestions: { ...(previous.talk?.suggestions ?? {}), [job.id]: data.bullets.map((text: string) => ({ text, status: "pending" })) } } };
        });
      } else if (kind === "summary" && typeof data.summary === "string") {
        setState((previous) => JSON.stringify(summaryAnswers(previous)) === source ? { ...previous, talk: { ...(previous.talk ?? defaultTalkProgress), summarySuggestion: data.summary } } : previous);
      } else throw new Error("invalid");
    } catch {
      if (abort.current === controller) setError(ERROR);
    } finally {
      window.clearTimeout(timer);
      if (abort.current === controller) setBusy(false);
    }
  }
  function decideBullet(index: number, status: "kept" | "removed") {
    const value = talk.suggestions[job.id]?.[index];
    if (!value) return;
    setState((previous) => ({ ...previous,
      experience: status === "kept" ? previous.experience.map((entry) => entry.id === job.id ? { ...entry, description: appendExperienceSentence(entry.description, value.text) } : entry) : previous.experience,
      talk: { ...(previous.talk ?? defaultTalkProgress), suggestions: { ...(previous.talk?.suggestions ?? {}), [job.id]: (previous.talk?.suggestions[job.id] ?? []).map((item, i) => i === index ? { ...item, status } : item) } },
    }));
    if (status === "kept") trackToolEvent(editingBullet === index ? "talk_bullets_changed" : "talk_bullets_accepted", { lang: locale });
    setEditingBullet(null);
  }
  const missing = getMissingCVItems(state);
  function finish() {
    if (!missing.length && !talk.completed) { patchTalk({ completed: true }); trackToolEvent("talk_mode_completed", { lang: locale }); }
    setDownload(true);
  }
  const recommended = [...new Set([recommendTemplateForTitle(state.personal.title), "ats-clean", "classic"])] as CVState["template"][];
  if (recommended.length < 3) recommended.push("service");
  const summaries = talk.summarySuggestion ?? state.summary;
  const roleSkill = getRoleExamples(state.experience[0]?.role ?? state.personal.title).skill;
  const selectedDuties = job?.description.split("\n").map((line) => line.replace(/^[•-]\s*/, "").trim()) ?? [];
  const isDone = current.kind === "done";

  return <div className="talk-mode min-h-screen bg-ground" dir={dir}>
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span dir="ltr" data-testid="brand" className="font-bold text-ink">Inspire Ambitions</span>
        <LanguageToggle />
      </div>
    </header>
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:pt-8">
      {restoredAt && <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4"><p>Your CV is saved on this device.</p><button className={`${control} mt-3`} onClick={dismissRestoreBanner}>Continue</button></div>}
      {locale !== "en" && <p className="mb-4 text-sm text-ink-muted" lang="en">This test version uses English questions. Full translations come next.</p>}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted" data-testid="talk-progress">Question {questionIndex + 1} of about {questions.length}</p>
        <button className={control} onClick={() => setPreview(!preview)}><Eye className="me-2 inline h-4 w-4" aria-hidden="true" />{preview ? "Close my CV" : "See my CV"}</button>
      </div>
      {preview && <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3" aria-label="Your CV preview"><div className="origin-top-left" style={{ zoom: "0.36" }}>{state.template === "ats-clean" ? <ATSCleanTemplate state={state} /> : <SectorTemplate state={state} />}</div></div>}
      <div className="mb-5 flex items-start gap-3"><BriefcaseBusiness className="mt-1 h-6 w-6 shrink-0 text-accent" aria-hidden="true" /><h1 ref={heading} tabIndex={-1} className="text-balance text-2xl font-bold text-ink focus:outline-none" lang="en">{current.question}</h1></div>
      <div className="space-y-4" lang="en">
        {current.kind === "language" && <div className="grid gap-3">{LANGUAGES.map((item) => <button key={item.code} className={control} aria-pressed={locale === item.code} onClick={() => setLocale(item.code as Locale)}>{item.label}</button>)}</div>}
        {current.kind === "family" && <div className="grid gap-3 sm:grid-cols-2">{getRoleFamilies().map((item) => <button key={item.key} className={control} aria-pressed={talk.families[job.id] === item.key} onClick={() => patchTalk({ families: { ...talk.families, [job.id]: item.key } })}>{item.key === "general" ? "Other work" : item.label}</button>)}</div>}
        {current.kind === "title" && <><div className="grid gap-3">{getTalkTitles(family.key).map((title) => <button key={title} className={control} aria-pressed={job.role === title} onClick={() => { patchJob({ role: title }); if (jobIndex === 0 && (!state.personal.title || state.personal.title === job.role)) updatePersonal({ title }); }}>{title}</button>)}</div><label className="block">Your job title<input className={field} value={job.role} autoComplete="organization-title" enterKeyHint="next" onChange={(event) => { const title = event.target.value; patchJob({ role: title }); if (jobIndex === 0 && (!state.personal.title || state.personal.title === job.role)) updatePersonal({ title }); }} /></label></>}
        {current.kind === "company" && <><label className="block">Company name<input className={field} value={job.company} autoComplete="organization" onChange={(event) => patchJob({ company: event.target.value })} /></label><button className={control} onClick={() => patchJob({ company: "", companyDesc: "Prefer not to say" })}>I prefer not to say</button>{job.companyDesc && <><p>Choose a workplace description. Keep the name private.</p><div className="grid gap-3">{getTalkWorkplaces(family.key).map((name) => <button key={name} className={control} aria-pressed={job.companyDesc === name} onClick={() => patchJob({ company: "", companyDesc: name })}>{name}</button>)}</div></>}</>}
        {current.kind === "location" && <><div className="grid gap-3 sm:grid-cols-2">{CITIES.map((city) => <button key={city} className={control} aria-pressed={job.location === city} onClick={() => patchJob({ location: city })}>{city}</button>)}</div><label className="block">City and country<input className={field} value={job.location} autoComplete="off" onChange={(event) => patchJob({ location: event.target.value })} /></label></>}
        {(current.kind === "start" || current.kind === "end") && <div className="grid grid-cols-2 gap-3"><label>Month<select aria-label="Month" className={field} value={(current.kind === "start" ? job.startMonth : job.endMonth) ?? ""} onChange={(event) => patchJob(current.kind === "start" ? { startMonth: event.target.value } : { endMonth: event.target.value })}><option value="">Choose month</option>{MONTHS.map((month, i) => <option value={i + 1} key={month}>{month}</option>)}</select></label><label>Year<select aria-label="Year" className={field} value={(current.kind === "start" ? job.startYear : job.endYear) ?? ""} onChange={(event) => patchJob(current.kind === "start" ? { startYear: event.target.value } : { endYear: event.target.value })}><option value="">Choose year</option>{Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((year) => <option key={year}>{year}</option>)}</select></label></div>}
        {current.kind === "current" && <div className="grid grid-cols-2 gap-3">{[true, false].map((value) => <button key={String(value)} className={control} aria-pressed={job.current === value} onClick={() => patchJob({ current: value })}>{value ? "Yes" : "No"}</button>)}</div>}
        {(current.kind === "duties" || current.kind === "proud") && <><p>Choose only lines that are true for you.</p><div className="grid gap-3">{(current.kind === "duties" ? getTalkSentences(family.key) : getTalkAchievements(family.key)).map((line) => <button key={line} className={control} aria-pressed={selectedDuties.includes(line)} onClick={() => selectedDuties.includes(line) ? patchJob({ description: selectedDuties.filter((item) => item !== line).join("\n") }) : appendDuty(line)}>{selectedDuties.includes(line) && <Check className="me-2 inline h-4 w-4" aria-hidden="true" />}{line}</button>)}</div><label className="block">Say it in my words<textarea aria-label="Say it in my words" className={`${field} min-h-32`} value={job.description} maxLength={4000} onChange={(event) => patchJob({ description: event.target.value })} /></label><p className="text-sm text-ink-muted">Your lines save as you type. Check suggested lines before adding.</p><button className={control} disabled={busy || !job.description.trim()} onClick={() => write("bullets")}>Help me write these lines</button>{(talk.suggestions[job.id] ?? []).map((item, i) => item.status !== "removed" && <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">{editingBullet === i ? <label>Change this line<textarea className={`${field} min-h-24`} value={item.text} onChange={(event) => patchTalk({ suggestions: { ...talk.suggestions, [job.id]: talk.suggestions[job.id].map((line, index) => index === i ? { ...line, text: event.target.value } : line) } })} /></label> : <p>{item.text}</p>}{item.status === "kept" ? <p className="mt-3">Added to your CV</p> : <div className="mt-3 grid grid-cols-3 gap-2"><button className={control} onClick={() => decideBullet(i, "kept")}>Keep</button><button className={control} onClick={() => setEditingBullet(i)}>Change</button><button className={control} onClick={() => decideBullet(i, "removed")}>Remove</button></div>}</div>)}</>}
        {current.kind === "another" && <div className="grid grid-cols-2 gap-3"><button className={control} onClick={addJob}>Yes, add a job</button><button className={control} onClick={() => { trackToolEvent("talk_question_answered", { questionId: "another", lang: locale }); go("school"); }}>No, next</button></div>}
        {current.kind === "school" && <div className="grid gap-3">{SCHOOLS.map((level) => <button key={level} className={control} aria-pressed={state.education[0]?.degree === level} onClick={() => updateField({ education: [{ ...(state.education[0] ?? { id: "edu-1", institution: "", year: "", grade: "" }), degree: level === "No formal school" ? "" : level }, ...state.education.slice(1)] })}>{level}</button>)}</div>}
        {current.kind === "school-details" && <>{(["degree", "institution", "year"] as const).map((key) => <label className="block" key={key}>{key === "degree" ? "School level or course" : key === "institution" ? "School or training centre" : "Year"}<input className={field} value={state.education[0]?.[key] ?? ""} onChange={(event) => updateField({ education: state.education.map((entry, i) => i === 0 ? { ...entry, [key]: event.target.value } : entry) })} /></label>)}</>}
        {current.kind === "skills" && <><p>Choose skills you use. Add your own if needed.</p><div className="grid gap-3 sm:grid-cols-2">{[...new Set([...(roleSkill === "A skill you use at work" ? [] : [roleSkill]), ...SKILLS, ...state.skills])].map((skill) => <button key={skill} className={control} aria-pressed={state.skills.includes(skill)} onClick={() => toggleSkill(skill)}>{skill}</button>)}</div><label className="block">Your own skill<input className={field} value={ownSkill} maxLength={100} onChange={(event) => setOwnSkill(event.target.value)} /></label><button className={control} disabled={!ownSkill.trim()} onClick={() => { if (!state.skills.includes(ownSkill.trim())) toggleSkill(ownSkill.trim()); setOwnSkill(""); }}>Add skill</button></>}
        {current.kind === "languages" && <><div className="grid gap-3 sm:grid-cols-2">{["English", "Arabic", "Hindi", "Urdu", "Tagalog", ...state.languages.map((entry) => entry.language)].filter((value, i, values) => value && values.indexOf(value) === i).map((name) => <button key={name} className={control} aria-pressed={state.languages.some((entry) => entry.language === name)} onClick={() => toggleLanguage(name)}>{name}</button>)}</div><label className="block">Another language<input className={field} value={ownLanguage} onChange={(event) => setOwnLanguage(event.target.value)} /></label><button className={control} disabled={!ownLanguage.trim()} onClick={() => { if (!state.languages.some((entry) => entry.language === ownLanguage.trim())) toggleLanguage(ownLanguage.trim()); setOwnLanguage(""); }}>Add language</button>{state.languages.filter((entry) => entry.language).map((entry) => <fieldset key={entry.id}><legend className="mb-2">Your level in {entry.language}</legend><div className="grid grid-cols-2 gap-3">{LEVELS.map((level) => <button key={level.value} className={control} aria-pressed={entry.level === level.value} onClick={() => updateField({ languages: state.languages.map((item) => item.id === entry.id ? { ...item, level: level.value } : item) })}>{level.label}</button>)}</div></fieldset>)}</>}
        {current.kind === "visa" && <><p>For Gulf jobs. Skip if this does not apply.</p><div className="grid gap-3">{(["Employment", "Visit", "Golden", "Investor", "Cancelled", "Outside UAE", "Prefer not to say"] as const).map((status) => <button key={status} className={control} aria-pressed={state.personal.visa_status === status} onClick={() => updatePersonal({ visa_status: status })}>{status}</button>)}</div></>}
        {current.kind === "notice" && <><p>Choose when you could start a new job.</p><div className="grid gap-3">{["Now", "1 week", "1 month", "2 months or more"].map((value) => <button key={value} className={control} aria-pressed={state.personal.notice_period === value} onClick={() => updatePersonal({ notice_period: value })}>{value}</button>)}</div></>}
        {current.kind === "licence" && <><p>Only add a licence you hold now.</p><label className="block">Driving licence<input className={field} value={state.personal.driving_license} placeholder="For example, UAE light vehicle" onChange={(event) => updatePersonal({ driving_license: event.target.value })} /></label><button className={control} onClick={() => updatePersonal({ driving_license: "" })}>No driving licence</button></>}
        {current.kind === "letter" && <><p>Letter from your sponsor allowing you to change job (NOC).</p><div className="grid gap-3">{(["Yes", "No", "Not applicable"] as const).map((value) => <button key={value} className={control} aria-pressed={state.personal.noc_available === value} onClick={() => updatePersonal({ noc_available: value })}>{value}</button>)}</div></>}
        {current.kind === "contact" && <><label className="block">Your name<input className={field} autoComplete="name" value={state.personal.name} onChange={(event) => updatePersonal({ name: event.target.value })} /></label><label className="block">Phone, with country code<input className={field} dir="ltr" type="tel" autoComplete="tel" placeholder={state.geo === "gulf" ? "+971" : "+44"} value={state.personal.phone} onChange={(event) => updatePersonal({ phone: event.target.value })} /></label><label className="block">Email (optional)<input className={field} dir="ltr" type="email" autoComplete="email" value={state.personal.email} onChange={(event) => { updatePersonal({ email: event.target.value }); patchTalk({ noEmail: false }); }} /></label><button className={control} aria-pressed={talk.noEmail} onClick={() => { updatePersonal({ email: "" }); patchTalk({ noEmail: true }); }}>I do not use email</button>{talk.noEmail && <p>The free picture download needs no email.</p>}<label className="block">Where you live (optional)<input className={field} autoComplete="address-level2" value={state.personal.location} onChange={(event) => updatePersonal({ location: event.target.value })} /></label></>}
        {current.kind === "photo" && <PhotoEditor compact />}
        {current.kind === "summary" && <><p>We wrote this about you using your answers.</p><label className="block">About you<textarea aria-label="About you" className={`${field} min-h-32`} value={summaries} onChange={(event) => talk.summarySuggestion !== undefined ? patchTalk({ summarySuggestion: event.target.value }) : updateField({ summary: event.target.value })} /></label><div className="grid gap-3"><button className={control} onClick={() => { setState((previous) => ({ ...previous, summary: summaries, talk: { ...(previous.talk ?? defaultTalkProgress), summarySuggestion: undefined, questionId: "design" } })); trackToolEvent("talk_question_answered", { questionId: "summary", lang: locale }); }}>Keep these words</button>{talk.summarySuggestion !== undefined && <button className={control} onClick={() => patchTalk({ summarySuggestion: undefined })}>Remove suggested words</button>}<button className={control} disabled={busy} onClick={() => write("summary")}>Help me write this</button></div><p className="text-sm text-ink-muted">You can change any words above. Keep only true facts.</p></>}
        {current.kind === "design" && <><div className="grid gap-3">{TEMPLATE_INFO.filter((item) => allDesigns || recommended.includes(item.key)).map((item) => <button key={item.key} className={control} aria-pressed={state.template === item.key && state.templateConfirmed} onClick={() => updateField({ template: item.key, templateConfirmed: true })}><strong>{item.name}</strong><span className="mt-1 block text-sm text-ink-muted">{item.key === recommended[0] ? "Suggested for your work" : "Choose this CV layout"}</span></button>)}</div><button className={control} onClick={() => setAllDesigns(!allDesigns)}>{allDesigns ? "Show three designs" : "See all designs"}</button></>}
        {isDone && <><div className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="text-xl font-bold">{missing.length ? `Almost there: ${missing.length} things missing` : "Your CV is ready"}</h2>{missing.map((item) => <button key={item.key} className={`${control} mt-3 block w-full`} onClick={() => go(item.key === "job" ? `${state.experience[0].id}-title` : "contact")}>{item.label}</button>)}<p className="mt-3">Check your details, then choose a file to download.</p><button className="mt-4 min-h-12 w-full rounded-lg bg-accent px-4 py-3 font-bold text-white" onClick={finish}>Download my CV</button></div>{talk.noEmail && <p>The free picture download needs no email.</p>}</>}
        {busy && <div role="status" className="space-y-2"><p>Writing suggestions. You can keep using your own words.</p><div className="h-4 rounded-lg bg-gray-200 motion-safe:animate-pulse" /><div className="h-4 w-3/4 rounded-lg bg-gray-200 motion-safe:animate-pulse" /></div>}
        {error && <p className="rounded-lg border border-gray-300 bg-white p-4" role="alert">{error}</p>}
      </div>
      <div className="mt-8 border-t border-gray-200 pt-4">
        <p className="mb-3 text-sm text-ink-muted" data-testid="talk-save">Changes save on this device.</p>
        <div className="grid grid-cols-2 gap-3"><button className={control} disabled={questionIndex === 0} onClick={() => go(questions[questionIndex - 1].id)}><ArrowLeft className={`me-2 inline h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} aria-hidden="true" />Back</button>{!isDone && current.kind !== "another" && <button className="min-h-12 rounded-lg bg-accent px-4 py-3 font-bold text-white disabled:opacity-60" disabled={!hydrated} onClick={() => { if (current.kind === "summary" && !state.summary) updateField({ summary: summaries }); next(); }}>Save and continue<ArrowRight className={`ms-2 inline h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} aria-hidden="true" /></button>}</div>
        {current.optional && <button className={`${control} mt-3 w-full text-center`} onClick={() => next(true)}>Skip for now</button>}
        <button className={`${control} mt-3 w-full text-center`} onClick={() => { abort.current?.abort(); updateField({ builderMode: "full", step: 1 }); }}>Full form</button>
      </div>
    </main>
    {isDone && !preview && <div hidden aria-hidden="true">{state.template === "ats-clean" ? <ATSCleanTemplate state={state} /> : <SectorTemplate state={state} />}</div>}
    <DownloadModal isOpen={download} onClose={() => setDownload(false)} />
  </div>;
}

function summaryAnswers(state: CVState) {
  return { title: state.personal.title, experience: state.experience.map(({ role, company, companyDesc, location, dates, description }) => ({ role, company, companyDesc, location, dates, description })), skills: state.skills, languages: state.languages.map(({ language, level }) => ({ language, level })) };
}
