"use client";

import { useId } from "react";
import { useCVState } from "@/lib/state";
import { useLocale } from "@/lib/locale";
import { PHONE_PLACEHOLDERS } from "@/lib/constants";
import {
  ARABIC_PROFICIENCY_OPTIONS,
  NATIONALITY_OPTIONS,
  NOC_OPTIONS,
  VISA_STATUS_OPTIONS,
} from "@/lib/uae";
import { Eye, Mail, UserRound } from "lucide-react";
import { PhoneField, LocationFields } from "@/components/shared/CVContactFields";
import PhotoEditor from "@/components/shared/PhotoEditor";

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-[#c8ccd3] bg-white px-4 text-base text-[#1a2744] outline-none transition focus:border-[#806017] focus:ring-2 focus:ring-[#806017]/20";
const iconInputClass = `${inputClass} ps-12`;

export default function GuidedPersonal() {
  const { state, updateField, updatePersonal } = useCVState();
  const { personal, mobilePersonalPage, geo } = state;
  const { t } = useLocale();
  const instanceId = useId();
  const optionLabel = (option: string) => t(option ? `personalUi.option.${option}` : "personalUi.empty");

  return (
    <div className="space-y-6 text-[#1a2744]">
      {mobilePersonalPage === 0 && (
        <>
          <div>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[#1a2744]">
              {t("personalUi.heading")}
            </h1>
            <p className="mt-2 text-base leading-6 text-[#586174]">
              {t("personalUi.intro")}
            </p>
          </div>

          <div className="space-y-5">
            <label htmlFor={`${instanceId}-name`} className="block text-sm font-semibold">
              {t("personalUi.mobileName")}
              <span className="relative block">
                <UserRound className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 translate-y-[-35%] text-[#806017]" aria-hidden="true" />
                <input id={`${instanceId}-name`} data-cv-fix="name" autoComplete="name" dir="auto" value={personal.name} onChange={(event) => updatePersonal({ name: event.target.value })} placeholder={t("personalUi.mobileNameExample")} className={iconInputClass} />
              </span>
            </label>
            <PhoneField phone={personal.phone} onChange={(phone) => updatePersonal({ phone })} placeholder={PHONE_PLACEHOLDERS[geo]} />
            <label htmlFor={`${instanceId}-email`} className="block text-sm font-semibold">
              {t("personalUi.mobileEmail")}
              <span className="relative block">
                <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 translate-y-[-35%] text-[#806017]" aria-hidden="true" />
                <input id={`${instanceId}-email`} type="email" inputMode="email" autoComplete="email" dir="ltr" value={personal.email} onChange={(event) => updatePersonal({ email: event.target.value })} placeholder={t("personalUi.mobileEmailExample")} className={iconInputClass} />
              </span>
            </label>
            <LocationFields value={personal.location} onChange={(location) => updatePersonal({ location })} />
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#d8c895] bg-white shadow-sm" aria-label={t("personalUi.livePreview")}>
            <div className="flex items-center gap-2 border-b border-[#ebe4cf] bg-[#faf7ee] px-4 py-3 text-sm font-semibold text-[#1a2744]">
              <Eye className="h-5 w-5 text-[#2f6b5e]" aria-hidden="true" /> {t("personalUi.seePreview")}
            </div>
            <div className="p-4">
              <p className="font-serif text-xl font-bold text-[#1a2744]">
                {personal.name ? <bdi>{personal.name}</bdi> : t("personalUi.yourName")}
              </p>
              <p className="mt-1 break-words text-xs text-[#687083]">
                {personal.phone && <bdi dir="ltr">{personal.phone}</bdi>}
                {personal.phone && personal.email && <span aria-hidden="true"> • </span>}
                {personal.email && <bdi dir="ltr">{personal.email}</bdi>}
                {!personal.phone && !personal.email && t("personalUi.noContacts")}
              </p>
              <div className="mt-4 h-2 w-3/4 rounded-full bg-[#e9ebef]" />
              <div className="mt-2 h-2 w-full rounded-full bg-[#f0f1f3]" />
            </div>
          </section>
        </>
      )}

      {mobilePersonalPage === 1 && (
        <>
          <div>
            <p className="text-sm font-semibold text-[#806017]">{t("personalUi.nextJob")}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">{t("personalUi.jobQuestion")}</h1>
            <p className="mt-2 text-base leading-6 text-[#586174]">
              {t("personalUi.jobHint")}
            </p>
          </div>
          <div className="space-y-5">
            <label className="block text-sm font-semibold">
              {t("personalUi.targetJob")}
              <input
                value={personal.title}
                onChange={(event) => updatePersonal({ title: event.target.value })}
                placeholder={t("personalUi.targetExample")}
                dir="auto"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              {t("personalUi.mobileLinkedin")} <span className="font-normal text-[#6b7280]">{t("personalUi.optionalParenthetical")}</span>
              <input
                type="url"
                inputMode="url"
                autoComplete="url"
                value={personal.linkedin}
                onChange={(event) => updatePersonal({ linkedin: event.target.value })}
                placeholder={t("personalUi.mobileLinkedinExample")}
                dir="ltr"
                className={inputClass}
              />
            </label>
          </div>
        </>
      )}

      {mobilePersonalPage === 2 && (
        <>
          <div>
            <p className="text-sm font-semibold text-[#806017]">{t("personalUi.optionalDetails")}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">{t("personalUi.gulfQuestion")}</h1>
            <p className="mt-2 text-base leading-6 text-[#586174]">
              {t("personalUi.gulfHint")}
            </p>
          </div>

          <details className="rounded-2xl border border-[#d9dde3] bg-white p-4" open>
            <summary className="cursor-pointer text-base font-bold">{t("personalUi.visaGroup")}</summary>
            <div className="mt-4 space-y-5">
              <label className="block text-sm font-semibold">
                {t("personalUi.mobileVisa")}
                <select
                  value={personal.visa_status}
                  onChange={(event) => updatePersonal({ visa_status: event.target.value as typeof personal.visa_status })}
                  className={inputClass}
                >
                  {VISA_STATUS_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{optionLabel(option)}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                {t("personalUi.mobileNotice")}
                <input value={personal.notice_period} onChange={(event) => updatePersonal({ notice_period: event.target.value })} placeholder={t("personalUi.mobileNoticeExample")} dir="auto" className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                {t("personalUi.mobileLicence")}
                <input value={personal.driving_license} onChange={(event) => updatePersonal({ driving_license: event.target.value })} placeholder={t("personalUi.mobileLicenceExample")} dir="auto" className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                {t("personalUi.noc")}
                <select value={personal.noc_available} onChange={(event) => updatePersonal({ noc_available: event.target.value as typeof personal.noc_available })} className={inputClass}>
                  {NOC_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{optionLabel(option)}</option>)}
                </select>
              </label>
            </div>
          </details>

          <details className="rounded-2xl border border-[#d9dde3] bg-white p-4">
            <summary className="cursor-pointer text-base font-bold">{t("personalUi.languageDetails")}</summary>
            <div className="mt-4 space-y-5">
              <label className="block text-sm font-semibold">
                {t("personalUi.nationality")}
                <input list="mobile-nationality-options" value={personal.nationality} onChange={(event) => updatePersonal({ nationality: event.target.value })} placeholder={t("personalUi.nationalityHint")} dir="auto" className={inputClass} />
                <datalist id="mobile-nationality-options">{NATIONALITY_OPTIONS.map((option) => <option key={option} value={option} label={optionLabel(option)} />)}</datalist>
              </label>
              <label className="block text-sm font-semibold">
                {t("personalUi.arabicLevel")}
                <select value={personal.arabic_proficiency} onChange={(event) => updatePersonal({ arabic_proficiency: event.target.value as typeof personal.arabic_proficiency })} className={inputClass}>
                  {ARABIC_PROFICIENCY_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{optionLabel(option)}</option>)}
                </select>
              </label>
            </div>
          </details>

          <p className="rounded-xl bg-[#eef7f4] p-4 text-sm leading-6 text-[#2f6b5e]">
            {t("personalUi.optionalNote")}
          </p>

          <PhotoEditor compact />
        </>
      )}

      <input type="hidden" value={mobilePersonalPage} readOnly aria-hidden="true" />
      <button type="button" className="sr-only" onClick={() => updateField({ mobilePersonalPage: 0 })}>{t("personalUi.restart")}</button>
    </div>
  );
}
