"use client";

import { useCVState } from "@/lib/state";
import type { EduEntry, CertEntry } from "@/lib/types";

function generateEduId() {
  return "edu-" + Math.random().toString(36).slice(2, 9);
}

function generateCertId() {
  return "cert-" + Math.random().toString(36).slice(2, 9);
}

const EMPTY_EDU: Omit<EduEntry, "id"> = {
  degree: "",
  institution: "",
  year: "",
  grade: "",
};

const EMPTY_CERT: Omit<CertEntry, "id"> = {
  name: "",
  issuer: "",
  date: "",
  expiry: "",
};

export default function StepEducation() {
  const { state, updateField } = useCVState();
  const eduEntries = state.education;
  const certEntries = state.certifications;

  // --- Education helpers ---
  function updateEdu(id: string, field: keyof EduEntry, value: string) {
    updateField({
      education: eduEntries.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  }

  function addEdu() {
    updateField({
      education: [...eduEntries, { ...EMPTY_EDU, id: generateEduId() }],
    });
  }

  function removeEdu(id: string) {
    updateField({
      education: eduEntries.filter((e) => e.id !== id),
    });
  }

  // --- Certification helpers ---
  function updateCert(id: string, field: keyof CertEntry, value: string) {
    updateField({
      certifications: certEntries.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  }

  function addCert() {
    updateField({
      certifications: [...certEntries, { ...EMPTY_CERT, id: generateCertId() }],
    });
  }

  function removeCert(id: string) {
    updateField({
      certifications: certEntries.filter((e) => e.id !== id),
    });
  }

  return (
    <div className="space-y-10">
      {/* ── Education Section ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add your qualifications starting with the most recent
          </p>
        </div>

        <div className="space-y-6">
          {eduEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Qualification {index + 1}
                </h3>
                {eduEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEdu(entry.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Degree / Qualification */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Degree / Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={entry.degree}
                    onChange={(e) =>
                      updateEdu(entry.id, "degree", e.target.value)
                    }
                    placeholder="e.g. BSc Computer Science"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={entry.institution}
                    onChange={(e) =>
                      updateEdu(entry.id, "institution", e.target.value)
                    }
                    placeholder="e.g. University of Manchester"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                  />
                </div>

                {/* Year Completed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year Completed
                  </label>
                  <input
                    type="text"
                    value={entry.year}
                    onChange={(e) =>
                      updateEdu(entry.id, "year", e.target.value)
                    }
                    placeholder="e.g. 2018"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                  />
                </div>

                {/* Grade / GPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Grade / GPA{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={entry.grade}
                    onChange={(e) =>
                      updateEdu(entry.id, "grade", e.target.value)
                    }
                    placeholder="e.g. First Class Honours / 3.8 GPA"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Education button */}
        <button
          type="button"
          onClick={addEdu}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          Add Education
        </button>
      </div>

      {/* ── Professional Certifications Section ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Professional Certifications
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Industry certifications, licences, and professional qualifications
          </p>
        </div>

        {certEntries.length > 0 && (
          <div className="space-y-6">
            {certEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Certification {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeCert(entry.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Certification Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Certification Name
                    </label>
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) =>
                        updateCert(entry.id, "name", e.target.value)
                      }
                      placeholder="e.g. CIPD Level 7, PMP, AWS Solutions Architect"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                    />
                  </div>

                  {/* Issuing Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Issuing Body
                    </label>
                    <input
                      type="text"
                      value={entry.issuer}
                      onChange={(e) =>
                        updateCert(entry.id, "issuer", e.target.value)
                      }
                      placeholder="e.g. PMI, CIPD, AWS"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                    />
                  </div>

                  {/* Date Obtained */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date Obtained
                    </label>
                    <input
                      type="text"
                      value={entry.date}
                      onChange={(e) =>
                        updateCert(entry.id, "date", e.target.value)
                      }
                      placeholder="e.g. March 2022"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={entry.expiry}
                      onChange={(e) =>
                        updateCert(entry.id, "expiry", e.target.value)
                      }
                      placeholder="e.g. March 2025 or N/A"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Certification button */}
        <button
          type="button"
          onClick={addCert}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          Add Certification
        </button>
      </div>

      {/* HR Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="font-semibold text-amber-800 text-sm">
          HR Director Tip
        </p>
        <p className="mt-1 text-sm text-amber-900">
          Professional certifications like CIPD, PMP, SHRM, and CFA often carry
          more weight than your university name in hiring decisions. Always list
          them prominently.
        </p>
      </div>
    </div>
  );
}
