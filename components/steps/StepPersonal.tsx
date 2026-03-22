"use client";

import { useState, useRef } from "react";
import { useCVState } from "@/lib/state";
import { PHONE_PLACEHOLDERS } from "@/lib/constants";
import {
  validateEmail,
  validateLinkedIn,
  validatePhone,
  validateImageUpload,
} from "@/lib/validators";

interface FieldStatus {
  valid?: boolean;
  warning?: string;
  error?: string;
}

export default function StepPersonal() {
  const { state, updatePersonal, updateField } = useCVState();
  const { personal, template, geo } = state;
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [emailStatus, setEmailStatus] = useState<FieldStatus>({});
  const [phoneStatus, setPhoneStatus] = useState<FieldStatus>({});
  const [linkedinStatus, setLinkedinStatus] = useState<FieldStatus>({});
  const [photoError, setPhotoError] = useState<string | null>(null);

  const showPhoto = template === "gulf" || template === "cre";

  function handleEmailBlur() {
    const result = validateEmail(personal.email);
    setEmailStatus({
      valid: result.valid,
      warning: result.warning,
      error: !result.valid && personal.email ? result.warning : undefined,
    });
  }

  function handlePhoneBlur() {
    const result = validatePhone(personal.phone);
    setPhoneStatus({
      valid: result.valid,
      warning: result.warning,
      error: !result.valid && personal.phone ? result.warning : undefined,
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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setPhotoError(validation.error ?? "Invalid image");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField({ photo: reader.result as string });
    };
    reader.onerror = () => {
      setPhotoError("Failed to read image file");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Personal Details
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          This information appears at the top of your CV
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={personal.name}
            onChange={(e) => updatePersonal({ name: e.target.value })}
            placeholder="e.g. Sarah Al-Mansoori"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
          />
        </div>

        {/* Professional Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Professional Title
          </label>
          <input
            type="text"
            value={personal.title}
            onChange={(e) => updatePersonal({ title: e.target.value })}
            placeholder="e.g. Senior Project Manager"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            onBlur={handleEmailBlur}
            placeholder="firstname.lastname@gmail.com"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow ${
              emailStatus.error
                ? "border-red-400"
                : emailStatus.warning
                  ? "border-amber-400"
                  : "border-gray-300"
            }`}
          />
          {emailStatus.error && (
            <p className="mt-1 text-sm text-red-600">{emailStatus.error}</p>
          )}
          {emailStatus.warning && !emailStatus.error && (
            <p className="mt-1 text-sm text-amber-600">
              {emailStatus.warning}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={personal.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            onBlur={handlePhoneBlur}
            placeholder={PHONE_PLACEHOLDERS[geo] ?? PHONE_PLACEHOLDERS.global}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow ${
              phoneStatus.error
                ? "border-red-400"
                : phoneStatus.warning
                  ? "border-amber-400"
                  : "border-gray-300"
            }`}
          />
          {phoneStatus.error && (
            <p className="mt-1 text-sm text-red-600">{phoneStatus.error}</p>
          )}
          {phoneStatus.warning && !phoneStatus.error && (
            <p className="mt-1 text-sm text-amber-600">
              {phoneStatus.warning}
            </p>
          )}
        </div>

        {/* City / Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            City / Country
          </label>
          <input
            type="text"
            value={personal.location}
            onChange={(e) => updatePersonal({ location: e.target.value })}
            placeholder="e.g. Dubai, UAE"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            LinkedIn URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={personal.linkedin}
              onChange={(e) => updatePersonal({ linkedin: e.target.value })}
              onBlur={handleLinkedinBlur}
              placeholder="https://linkedin.com/in/your-name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow ${
                linkedinStatus.error
                  ? "border-red-400"
                  : linkedinStatus.valid && personal.linkedin
                    ? "border-green-400"
                    : "border-gray-300"
              }`}
            />
            {linkedinStatus.valid && personal.linkedin && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-600 flex items-center gap-1">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Valid
              </span>
            )}
          </div>
          {linkedinStatus.error && (
            <p className="mt-1 text-sm text-red-600">
              {linkedinStatus.error}
            </p>
          )}
        </div>
      </div>

      {/* Photo Upload */}
      {showPhoto && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Professional Photo
          </label>
          <div className="flex items-center gap-6">
            {/* Circular preview */}
            <div
              onClick={() => photoInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gold-400 transition-colors bg-gray-50 shrink-0"
            >
              {state.photo ? (
                <img
                  src={state.photo}
                  alt="Photo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-sm font-medium text-gold-600 hover:text-gold-700"
              >
                {state.photo ? "Change photo" : "Upload photo"}
              </button>
              <p className="mt-1 text-xs text-gray-500">
                JPEG or PNG, max 5 MB. Will be displayed in a circle.
              </p>
              {photoError && (
                <p className="mt-1 text-sm text-red-600">{photoError}</p>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Director Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          Recruiters see your email before your CV.
          firstname.lastname@gmail.com is the gold standard. Avoid nicknames,
          birth years, or numbers.
        </p>
      </div>
    </div>
  );
}
