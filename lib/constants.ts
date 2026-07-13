export const GCC_MENA_CODES = [
  "AE", "SA", "QA", "KW", "BH", "OM",       // GCC
  "EG", "JO", "LB", "IQ", "SY", "PS",       // Levant
  "YE", "LY", "TN", "DZ", "MA", "SD",       // North Africa
];

export const STEPS = [
  { index: 0, label: "Start", key: "start" },
  { index: 1, label: "Template", key: "template" },
  { index: 2, label: "Personal Details", key: "personal" },
  { index: 3, label: "Professional Summary", key: "summary" },
  { index: 4, label: "Work Experience", key: "experience" },
  { index: 5, label: "Education & Certs", key: "education" },
  { index: 6, label: "Skills & Languages", key: "skills" },
  { index: 7, label: "Extras", key: "extras" },
  { index: 8, label: "CV Score & Download", key: "score" },
] as const;

export const PHONE_PLACEHOLDERS: Record<string, string> = {
  gulf: "+971 50 123 4567",
  global: "+44 7700 900000",
};

export const LANGUAGE_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
] as const;

export const TEMPLATE_INFO = [
  { key: "classic" as const, name: "Classic GCC", desc: "Balanced Gulf format for broad professional use.", color: "bg-navy-800" },
  { key: "site" as const, name: "Site", desc: "Construction and engineering, with licences and projects first.", color: "bg-slate-800" },
  { key: "service" as const, name: "Service", desc: "Hospitality and F&B, with languages and employers prominent.", color: "bg-emerald-800" },
  { key: "care" as const, name: "Care", desc: "Healthcare, with DHA, DOH, MOH and clinical skills prioritised.", color: "bg-teal-800" },
  { key: "ledger" as const, name: "Ledger", desc: "Banking and finance, conservative and compliance-led.", color: "bg-blue-950" },
  { key: "crew" as const, name: "Crew", desc: "Aviation and service roles, with photo and languages supported.", color: "bg-sky-900" },
  { key: "stack" as const, name: "Stack", desc: "Technology roles, with skills and projects surfaced early.", color: "bg-zinc-900" },
  { key: "move" as const, name: "Move", desc: "Logistics and retail, with licences, systems and availability.", color: "bg-orange-900" },
  { key: "corner" as const, name: "Corner", desc: "Executive and management CV with board-level authority.", color: "bg-stone-900" },
] as const;

export const PRICES = {
  pdf: 500,        // $5.00 in cents
  word: 500,       // $5.00
  coverLetter: 200, // $2.00
  roast: 200,      // $2.00 per credit
  annual: 8640,    // $86.40/yr
} as const;
