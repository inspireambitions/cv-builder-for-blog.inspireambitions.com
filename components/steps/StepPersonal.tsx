"use client";

import { useId, useState } from "react";
import { useCVState } from "@/lib/state";
import { useLocale } from "@/lib/locale";
import { PHONE_PLACEHOLDERS } from "@/lib/constants";
import type { SectorCredentialAuthority } from "@/lib/types";
import {
  ARABIC_PROFICIENCY_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
  NOC_OPTIONS,
  SECTOR_CREDENTIAL_OPTIONS,
  VISA_STATUS_OPTIONS,
} from "@/lib/uae";
import { validateEmail, validateLinkedIn } from "@/lib/validators";
import { PhoneField, LocationFields } from "@/components/shared/CVContactFields";
import GuidedPersonal from "./GuidedPersonal";
import PhotoEditor from "@/components/shared/PhotoEditor";

interface FieldStatus {
  valid?: boolean;
  warning?: string;
  error?: string;
}

export default function StepPersonal() {
  const { state, updatePersonal } = useCVState();
  const { personal, geo } = state;
  const { t } = useLocale();
  const instanceId = useId();
  const fieldId = (name: string) => `${instanceId}-${name}`;
  const optionLabel = (option: string) => t(option ? `personalUi.option.${option}` : "personalUi.skip");
  const credentialLabel = (authority: SectorCredentialAuthority) =>
    authority === "Other" ? optionLabel(authority) : <bdi dir="ltr">{authority}</bdi>;

  const [emailStatus, setEmailStatus] = useState<FieldStatus>({});
  const [linkedinStatus, setLinkedinStatus] = useState<FieldStatus>({});
  const selectedCredentialAuthorities = new Set(
    personal.sector_credentials.map((credential) => credential.authority)
  );

  function toggleCredential(authority: SectorCredentialAuthority) {
    const exists = selectedCredentialAuthorities.has(authority);
    updatePersonal({
      sector_credentials: exists
        ? personal.sector_credentials.filter(
            (credential) => credential.authority !== authority
          )
        : [
            ...personal.sector_credentials,
            { authority, license_no: "", expiry_date: "" },
          ],
    });
  }

  function updateCredential(
    authority: SectorCredentialAuthority,
    patch: Partial<{ license_no: string; expiry_date: string }>
  ) {
    updatePersonal({
      sector_credentials: personal.sector_credentials.map((credential) =>
        credential.authority === authority
          ? { ...credential, ...patch }
          : credential
      ),
    });
  }

  function handleEmailBlur() {
    const result = validateEmail(personal.email);
    setEmailStatus({
      valid: result.valid,
      warning: result.warning,
      error: !result.valid && personal.email ? result.warning : undefined,
    });
  }


  function handleLinkedinBlur() {
    const result = validateLinkedIn(personal.linkedin);
    setLinkedinStatus({
      valid: result.valid,
      warning: result.warning,
      error: !result.valid ? result.warning : undefined,
    });
  }

  return (
    <>
      <div className="sm:hidden">
        <GuidedPersonal />
      </div>
      <div className="hidden space-y-8 sm:block">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t("personalUi.desktopTitle")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("personalUi.desktopIntro")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor={fieldId("name")} className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("personalUi.name")}
          </label>
          <input
            data-cv-fix="name"
            id={fieldId("name")}
            type="text"
            autoComplete="name"
            dir="auto"
            value={personal.name}
            onChange={(e) => updatePersonal({ name: e.target.value })}
            placeholder={t("personalUi.nameExample")}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
          />
        </div>

        {/* Professional Title */}
        <div>
          <label htmlFor={fieldId("title")} className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("personalUi.title")}
          </label>
          <input
            id={fieldId("title")}
            type="text"
            dir="auto"
            value={personal.title}
            onChange={(e) => updatePersonal({ title: e.target.value })}
            placeholder={t("personalUi.titleExample")}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor={fieldId("email")} className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("personalUi.email")}
          </label>
          <input
            id={fieldId("email")}
            type="email"
            autoComplete="email"
            dir="ltr"
            aria-invalid={Boolean(emailStatus.error)}
            aria-describedby={emailStatus.error || emailStatus.warning ? fieldId("email-feedback") : undefined}
            value={personal.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            onBlur={handleEmailBlur}
            placeholder={t("personalUi.emailExample")}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow ${
              emailStatus.error
                ? "border-red-400"
                : emailStatus.warning
                  ? "border-amber-400"
                  : "border-gray-300"
            }`}
          />
          {emailStatus.error && (
            <p id={fieldId("email-feedback")} className="mt-1 text-sm text-red-600">{t("personalUi.emailInvalid")}</p>
          )}
          {emailStatus.warning && !emailStatus.error && (
            <p id={fieldId("email-feedback")} className="mt-1 text-sm text-amber-600">
              {t("personalUi.emailWarning")}
            </p>
          )}
        </div>

        <PhoneField phone={personal.phone} onChange={(phone) => updatePersonal({ phone })} placeholder={PHONE_PLACEHOLDERS[geo] ?? PHONE_PLACEHOLDERS.global} />
        <LocationFields value={personal.location} onChange={(location) => updatePersonal({ location })} />

        {/* LinkedIn */}
        <div>
          <label htmlFor={fieldId("linkedin")} className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("personalUi.linkedin")}
          </label>
          <div className="relative">
            <input
              id={fieldId("linkedin")}
              type="url"
              autoComplete="url"
              dir="ltr"
              aria-invalid={Boolean(linkedinStatus.error)}
              aria-describedby={linkedinStatus.error ? fieldId("linkedin-feedback") : undefined}
              value={personal.linkedin}
              onChange={(e) => updatePersonal({ linkedin: e.target.value })}
              onBlur={handleLinkedinBlur}
              placeholder={t("personalUi.linkedinExample")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow ${
                linkedinStatus.error
                  ? "border-red-400"
                  : linkedinStatus.valid && personal.linkedin
                    ? "border-green-400"
                    : "border-gray-300"
              }`}
            />
            {linkedinStatus.valid && personal.linkedin && (
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-green-600 flex items-center gap-1 bg-white">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("personalUi.valid")}
              </span>
            )}
          </div>
          {linkedinStatus.error && (
            <p id={fieldId("linkedin-feedback")} className="mt-1 text-sm text-red-600">
              {t("personalUi.linkedinInvalid")}
            </p>
          )}
        </div>
      </div>

      {/* UAE & GCC optional details */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {t("personalUi.gulfDetails")}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {t("personalUi.desktopGulfHint")}
            </p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {t("personalUi.optional")}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={fieldId("visa")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.visa")}
            </label>
            <select
              id={fieldId("visa")}
              value={personal.visa_status}
              onChange={(e) =>
                updatePersonal({
                  visa_status: e.target.value as typeof personal.visa_status,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            >
              {VISA_STATUS_OPTIONS.map((option) => (
                <option key={option || "blank"} value={option}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={fieldId("notice")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.notice")}
            </label>
            <input
              id={fieldId("notice")}
              type="text"
              dir="auto"
              value={personal.notice_period}
              onChange={(e) =>
                updatePersonal({ notice_period: e.target.value })
              }
              placeholder={t("personalUi.noticeExample")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label htmlFor={fieldId("availability")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.availability")}
            </label>
            <input
              id={fieldId("availability")}
              type="date"
              value={personal.availability_date}
              onChange={(e) =>
                updatePersonal({ availability_date: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label htmlFor={fieldId("licence")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.licence")}
            </label>
            <input
              id={fieldId("licence")}
              type="text"
              dir="auto"
              value={personal.driving_license}
              onChange={(e) => updatePersonal({ driving_license: e.target.value })}
              placeholder={t("personalUi.licenceExample")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label htmlFor={fieldId("noc")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.noc")}
            </label>
            <select
              id={fieldId("noc")}
              value={personal.noc_available}
              onChange={(e) =>
                updatePersonal({
                  noc_available: e.target.value as typeof personal.noc_available,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            >
              {NOC_OPTIONS.map((option) => (
                <option key={option || "blank"} value={option}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={fieldId("nationality")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.nationality")}
            </label>
            <input
              id={fieldId("nationality")}
              type="text"
              dir="auto"
              list="nationality-options"
              value={personal.nationality}
              onChange={(e) => updatePersonal({ nationality: e.target.value })}
              placeholder={t("personalUi.nationalityExample")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            />
            <datalist id="nationality-options">
              {NATIONALITY_OPTIONS.map((option) => (
                <option key={option} value={option} label={optionLabel(option)} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor={fieldId("arabic")} className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("personalUi.arabic")}
            </label>
            <select
              id={fieldId("arabic")}
              value={personal.arabic_proficiency}
              onChange={(e) =>
                updatePersonal({
                  arabic_proficiency:
                    e.target.value as typeof personal.arabic_proficiency,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            >
              {ARABIC_PROFICIENCY_OPTIONS.map((option) => (
                <option key={option || "blank"} value={option}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={personal.include_date_of_birth}
                onChange={(e) =>
                  updatePersonal({ include_date_of_birth: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
              />
              {t("personalUi.includeDob")}
            </label>
            <input
              type="date"
              aria-label={t("personalUi.dob")}
              value={personal.date_of_birth}
              onChange={(e) =>
                updatePersonal({ date_of_birth: e.target.value })
              }
              disabled={!personal.include_date_of_birth}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={personal.include_marital_status}
                onChange={(e) =>
                  updatePersonal({ include_marital_status: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
              />
              {t("personalUi.includeMarital")}
            </label>
            <select
              aria-label={t("personalUi.marital")}
              value={personal.marital_status}
              onChange={(e) =>
                updatePersonal({
                  marital_status:
                    e.target.value as typeof personal.marital_status,
                })
              }
              disabled={!personal.include_marital_status}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
            >
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <option key={option || "blank"} value={option}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="block text-sm font-medium text-gray-700 mb-2">
            {t("personalUi.credentials")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {SECTOR_CREDENTIAL_OPTIONS.map((authority) => (
              <button
                key={authority}
                type="button"
                aria-pressed={selectedCredentialAuthorities.has(authority)}
                onClick={() => toggleCredential(authority)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                  selectedCredentialAuthorities.has(authority)
                    ? "bg-emerald-700 text-white ring-emerald-700"
                    : "bg-white text-gray-700 ring-gray-200 hover:ring-emerald-300"
                }`}
              >
                {credentialLabel(authority)}
              </button>
            ))}
          </div>

          {personal.sector_credentials.length > 0 && (
            <div className="mt-4 space-y-3">
              {personal.sector_credentials.map((credential) => (
                <div
                  key={credential.authority}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-100 bg-white p-3 sm:grid-cols-[90px_1fr_1fr]"
                >
                  <div className="flex items-center text-sm font-semibold text-emerald-800">
                    {credentialLabel(credential.authority)}
                  </div>
                  <input
                    type="text"
                    value={credential.license_no}
                    onChange={(e) =>
                      updateCredential(credential.authority, {
                        license_no: e.target.value,
                      })
                    }
                    aria-label={t("personalUi.licenceNumber")}
                    placeholder={t("personalUi.licenceNumber")}
                    dir="auto"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                  />
                  <input
                    type="date"
                    aria-label={t("personalUi.expiry")}
                    value={credential.expiry_date}
                    onChange={(e) =>
                      updateCredential(credential.authority, {
                        expiry_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PhotoEditor />

      {/* HR Tip */}
      <div className="bg-amber-50 border-s-4 border-amber-400 p-4 rounded-e-lg">
        <p className="font-semibold text-amber-800 text-sm">
          {t("personalUi.tip")}
        </p>
        <p className="mt-1 text-sm text-amber-900">
          {t("personalUi.tipText")}
        </p>
      </div>
      </div>
    </>
  );
}
