"use client";

import { useCVState } from "@/lib/state";
import { PHONE_PLACEHOLDERS } from "@/lib/constants";
import {
  ARABIC_PROFICIENCY_OPTIONS,
  NATIONALITY_OPTIONS,
  NOC_OPTIONS,
  VISA_STATUS_OPTIONS,
} from "@/lib/uae";
import { Eye, Mail, Phone, UserRound } from "lucide-react";

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-[#c8ccd3] bg-white px-4 text-base text-[#1a2744] outline-none transition focus:border-[#806017] focus:ring-2 focus:ring-[#806017]/20";
const iconInputClass = `${inputClass} ps-12`;

export default function GuidedPersonal() {
  const { state, updateField, updatePersonal } = useCVState();
  const { personal, mobilePersonalPage, geo } = state;

  return (
    <div className="space-y-6 text-[#1a2744]">
      {mobilePersonalPage === 0 && (
        <>
          <div>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[#1a2744]">
              How can employers contact you?
            </h1>
            <p className="mt-2 text-base leading-6 text-[#586174]">
              Add the details employers will use to contact you.
            </p>
          </div>

          <div className="space-y-5">
            <label className="block text-sm font-semibold">
              Full name
              <span className="relative block">
                <UserRound className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 translate-y-[-35%] text-[#806017]" aria-hidden="true" />
                <input autoComplete="name" value={personal.name} onChange={(event) => updatePersonal({ name: event.target.value })} placeholder="For example, Amina Yusuf" className={iconInputClass} />
              </span>
            </label>
            <label className="block text-sm font-semibold">
              Phone number
              <span className="relative block">
                <Phone className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 translate-y-[-35%] text-[#806017]" aria-hidden="true" />
                <input type="tel" inputMode="tel" autoComplete="tel" value={personal.phone} onChange={(event) => updatePersonal({ phone: event.target.value })} placeholder={PHONE_PLACEHOLDERS[geo]} className={iconInputClass} />
              </span>
            </label>
            <label className="block text-sm font-semibold">
              Email address
              <span className="relative block">
                <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 translate-y-[-35%] text-[#806017]" aria-hidden="true" />
                <input type="email" inputMode="email" autoComplete="email" value={personal.email} onChange={(event) => updatePersonal({ email: event.target.value })} placeholder="name@email.com" className={iconInputClass} />
              </span>
            </label>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#d8c895] bg-white shadow-sm" aria-label="Live CV preview">
            <div className="flex items-center gap-2 border-b border-[#ebe4cf] bg-[#faf7ee] px-4 py-3 text-sm font-semibold text-[#1a2744]">
              <Eye className="h-5 w-5 text-[#2f6b5e]" aria-hidden="true" /> See your CV preview
            </div>
            <div className="p-4">
              <p className="font-serif text-xl font-bold text-[#1a2744]">
                {personal.name || "Your name"}
              </p>
              <p className="mt-1 text-xs text-[#687083]">
                {[personal.phone, personal.email].filter(Boolean).join("  •  ") || "Your phone and email will appear here"}
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
            <p className="text-sm font-semibold text-[#806017]">Your next job</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">What job do you want next?</h1>
            <p className="mt-2 text-base leading-6 text-[#586174]">
              We use this to guide your CV and recommend a suitable design later.
            </p>
          </div>
          <div className="space-y-5">
            <label className="block text-sm font-semibold">
              Target job
              <input
                value={personal.title}
                onChange={(event) => updatePersonal({ title: event.target.value })}
                placeholder="For example, Executive Housekeeper"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              Current city or country
              <input
                autoComplete="address-level2"
                value={personal.location}
                onChange={(event) => updatePersonal({ location: event.target.value })}
                placeholder="For example, Dubai, UAE"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              LinkedIn profile <span className="font-normal text-[#6b7280]">(optional)</span>
              <input
                type="url"
                inputMode="url"
                autoComplete="url"
                value={personal.linkedin}
                onChange={(event) => updatePersonal({ linkedin: event.target.value })}
                placeholder="linkedin.com/in/your-name"
                className={inputClass}
              />
            </label>
          </div>
        </>
      )}

      {mobilePersonalPage === 2 && (
        <>
          <div>
            <p className="text-sm font-semibold text-[#806017]">Optional details</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">Are you applying in the Gulf?</h1>
            <p className="mt-2 text-base leading-6 text-[#586174]">
              Add what helps your application. You can leave every field blank.
            </p>
          </div>

          <details className="rounded-2xl border border-[#d9dde3] bg-white p-4" open>
            <summary className="cursor-pointer text-base font-bold">Availability and visa</summary>
            <div className="mt-4 space-y-5">
              <label className="block text-sm font-semibold">
                Visa status
                <select
                  value={personal.visa_status}
                  onChange={(event) => updatePersonal({ visa_status: event.target.value as typeof personal.visa_status })}
                  className={inputClass}
                >
                  {VISA_STATUS_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{option || "Leave blank"}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Notice period
                <input value={personal.notice_period} onChange={(event) => updatePersonal({ notice_period: event.target.value })} placeholder="For example, immediate or 30 days" className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                Driving licence
                <input value={personal.driving_license} onChange={(event) => updatePersonal({ driving_license: event.target.value })} placeholder="For example, UAE light vehicle" className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                NOC available
                <select value={personal.noc_available} onChange={(event) => updatePersonal({ noc_available: event.target.value as typeof personal.noc_available })} className={inputClass}>
                  {NOC_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{option || "Leave blank"}</option>)}
                </select>
              </label>
            </div>
          </details>

          <details className="rounded-2xl border border-[#d9dde3] bg-white p-4">
            <summary className="cursor-pointer text-base font-bold">Language and personal details</summary>
            <div className="mt-4 space-y-5">
              <label className="block text-sm font-semibold">
                Nationality
                <input list="mobile-nationality-options" value={personal.nationality} onChange={(event) => updatePersonal({ nationality: event.target.value })} placeholder="Leave blank if you prefer" className={inputClass} />
                <datalist id="mobile-nationality-options">{NATIONALITY_OPTIONS.map((option) => <option key={option} value={option} />)}</datalist>
              </label>
              <label className="block text-sm font-semibold">
                Arabic level
                <select value={personal.arabic_proficiency} onChange={(event) => updatePersonal({ arabic_proficiency: event.target.value as typeof personal.arabic_proficiency })} className={inputClass}>
                  {ARABIC_PROFICIENCY_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{option || "Leave blank"}</option>)}
                </select>
              </label>
            </div>
          </details>

          <p className="rounded-xl bg-[#eef7f4] p-4 text-sm leading-6 text-[#2f6b5e]">
            These details are optional. Your CV will work without them.
          </p>
        </>
      )}

      <input type="hidden" value={mobilePersonalPage} readOnly aria-hidden="true" />
      <button type="button" className="sr-only" onClick={() => updateField({ mobilePersonalPage: 0 })}>Start personal details again</button>
    </div>
  );
}
