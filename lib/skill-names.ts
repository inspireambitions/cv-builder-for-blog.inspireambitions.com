const names = [
  "Microsoft Office", "Microsoft Excel", "Microsoft Word", "Excel", "Word",
  "Opera PMS", "Opera Cloud", "Opera", "Protel", "Micros", "SAP", "Oracle", "Tally",
  "QuickBooks", "HACCP", "POS", "Salesforce", "AutoCAD", "Power BI", "Google Sheets",
  "PMS", "CRM", "ERP", "SQL", "CPR", "UAE", "GCC", "PPE", "HSE", "AWS", "ISO",
  "VAT", "CISSP", "FIFO", "FEFO", "CI/CD", "WhatsApp", "iOS", "HotSOS", "MS Excel",
];

const phrases: Record<string, string> = {
  "handling emails": "Email handling",
  "handling email": "Email handling",
  "verifying reservation": "Reservation checks",
  "verifying reservations": "Reservation checks",
  "using microsoft office": "Microsoft Office",
  "using excel": "Excel",
  "handling cash": "Cash handling",
  "taking guest calls": "Guest calls",
  ".net": ".NET",
};

const knownNames = new Map(names.map((name) => [name.toLowerCase(), name]));
const namedSystem = /\b(?:microsoft office|microsoft excel|microsoft word|excel|opera(?: pms| cloud)?|protel|micros|sap|oracle|tally|quickbooks|haccp|pos|salesforce|autocad|power bi|google sheets|whatsapp|hotsos)\b/i;
const capitalisedName = new RegExp(`\\b(?:${names.join("|")})\\b`, "gi");

export function hasNamedSystem(text: string) {
  return namedSystem.test(text);
}

export function uppercaseFirst(text: string) {
  return text.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
}

export function cleanAllCaps(text: string) {
  if (!/[A-Z]{2}/.test(text) || /[a-z]/.test(text)) return text;
  return text.toLowerCase().replace(capitalisedName, (word) => knownNames.get(word.toLowerCase()) ?? word);
}

export function cleanSkillName(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ").replace(/\.$/, "");
  const key = trimmed.toLowerCase();
  return Object.hasOwn(phrases, key) ? phrases[key]
    : knownNames.get(key) ?? uppercaseFirst(trimmed);
}
