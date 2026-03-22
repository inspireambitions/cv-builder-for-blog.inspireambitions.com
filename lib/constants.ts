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
  {
    key: "corp" as const,
    name: "Corporate / Traditional",
    desc: "Navy header, 2-column layout. Best for: Finance, Law, Consulting, Government.",
    color: "bg-navy-800",
  },
  {
    key: "min" as const,
    name: "Modern Minimal",
    desc: "Clean white design, generous spacing. Best for: Tech, Startups, Product, Design.",
    color: "bg-gray-700",
  },
  {
    key: "gulf" as const,
    name: "Gulf / UAE Style",
    desc: "Green header with photo. Best for: GCC/MENA roles where photo is expected.",
    color: "bg-green-800",
  },
  {
    key: "cre" as const,
    name: "Creative / Bold",
    desc: "Purple sidebar with photo. Best for: Marketing, Media, Creative Industries.",
    color: "bg-purple-800",
  },
] as const;

export const PRICES = {
  pdf: 500,        // $5.00 in cents
  word: 500,       // $5.00
  coverLetter: 200, // $2.00
  roast: 200,      // $2.00 per credit
  annual: 8640,    // $86.40/yr
} as const;
