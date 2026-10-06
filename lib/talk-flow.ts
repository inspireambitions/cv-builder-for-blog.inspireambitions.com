import type { CVState, ExpEntry } from "./types";
import { getRoleFamilies, getRoleSuggestionGroup } from "./role-suggestions";

export const TALK_MODE_ENABLED = process.env.NEXT_PUBLIC_TALK_MODE === "true";
export type TalkKind = "language" | "family" | "title" | "company" | "location" | "start" | "current" | "end" | "duties" | "proud" | "another" | "school" | "school-details" | "skills" | "languages" | "visa" | "notice" | "licence" | "letter" | "contact" | "photo" | "summary" | "design" | "done";
export type TalkProgress = {
  questionId: string;
  families: Record<string, string>;
  suggestions: Record<string, { text: string; status: "pending" | "kept" | "removed" }[]>;
  noEmail: boolean;
  completed?: boolean;
  summaryInitialized?: boolean;
  summarySuggestion?: string;
};
export type TalkQuestion = { id: string; kind: TalkKind; question: string; optional: boolean; jobIndex?: number };
export const defaultTalkProgress: TalkProgress = { questionId: "language", families: {}, suggestions: {}, noEmail: false };

export function getTalkWorkplaces(key: string): string[] {
  if (["kitchen-steward", "housekeeping", "food-service", "culinary", "front-office"].includes(key)) return ["International hotel", "Local hotel", "Restaurant", "Resort", "Other workplace"];
  const specific: Record<string, string[]> = {
    healthcare: ["Hospital", "Clinic", "Care home"],
    construction: ["Building company", "Construction site", "Maintenance company"],
    warehouse: ["Warehouse", "Distribution centre", "Factory"],
    driver: ["Transport company", "Delivery company", "Private employer"],
    security: ["Security company", "Hotel", "Office building"],
    cleaning: ["Cleaning company", "Hotel", "Private home"],
    "retail-sales": ["Shop", "Supermarket", "Sales office"],
  };
  return [...(specific[key] ?? ["Local company", "International company", "Office"]), "Other workplace"];
}

export function getTalkAchievements(key: string): string[] {
  const shared = ["Trained new staff", "Promoted", "Employee of the month"];
  const specific: Record<string, string> = {
    housekeeping: "Good guest reviews", "kitchen-steward": "Helped during busy service",
    "food-service": "Good guest reviews", culinary: "Helped during busy service",
    "front-office": "Good guest reviews", healthcare: "Good patient feedback",
    "retail-sales": "Good customer feedback", "customer-service": "Good customer feedback",
    warehouse: "Helped with stock checks", construction: "Reported a safety risk",
    driver: "Good customer feedback", security: "Reported a safety risk",
  };
  return [...shared, specific[key] ?? "Good feedback"];
}

const JOB_QUESTIONS: { kind: TalkKind; question: string; optional: boolean }[] = [
  { kind: "family", question: "What work do you do?", optional: false },
  { kind: "title", question: "What is your job title?", optional: false },
  { kind: "company", question: "Where do you work?", optional: true },
  { kind: "location", question: "Which city and country?", optional: true },
  { kind: "start", question: "When did you start?", optional: true },
  { kind: "current", question: "Do you still work there?", optional: true },
  { kind: "end", question: "When did you leave?", optional: true },
  { kind: "duties", question: "What do you do each day?", optional: true },
  { kind: "proud", question: "What are you proud of?", optional: true },
  { kind: "another", question: "Did you have a job before this?", optional: false },
];
const FINAL_QUESTIONS: { kind: TalkKind; question: string; optional: boolean }[] = [
  { kind: "school", question: "What is your highest school level?", optional: true },
  { kind: "school-details", question: "Would you like to add school details?", optional: true },
  { kind: "skills", question: "Which skills do you have?", optional: true },
  { kind: "languages", question: "Which languages do you speak?", optional: true },
  { kind: "visa", question: "What is your visa status?", optional: true },
  { kind: "notice", question: "When can you start?", optional: true },
  { kind: "licence", question: "Do you have a driving licence?", optional: true },
  { kind: "letter", question: "Can your sponsor let you change jobs?", optional: true },
  { kind: "contact", question: "How can companies contact you?", optional: true },
  { kind: "photo", question: "Would you like to add a photo?", optional: true },
  { kind: "summary", question: "Does this sound like you?", optional: true },
  { kind: "design", question: "Which design do you like?", optional: false },
  { kind: "done", question: "Would you like to download your CV?", optional: false },
];

export function getTalkQuestions(state: CVState): TalkQuestion[] {
  const questions: TalkQuestion[] = [{ id: "language", kind: "language", question: "Which language do you want to use?", optional: false }];
  state.experience.forEach((job, jobIndex) => JOB_QUESTIONS.forEach((item) => {
    if (item.kind === "end" && job.current !== false) return;
    questions.push({ ...item, id: `${job.id}-${item.kind}`, jobIndex });
  }));
  FINAL_QUESTIONS.forEach((item) => {
    if (item.kind === "school-details" && !state.education.some((entry) => entry.degree.trim())) return;
    questions.push({ ...item, id: item.kind });
  });
  return questions;
}

export function getTalkFamily(state: CVState, jobIndex = 0) {
  const job = state.experience[jobIndex];
  const key = job && state.talk?.families[job.id];
  return getRoleFamilies().find((group) => group.key === key) ?? getRoleSuggestionGroup(job?.role ?? "", state.personal.title);
}

const TITLES: Record<string, string[]> = {
  housekeeping: ["Room Attendant", "Housekeeping Supervisor", "Executive Housekeeper"],
  "kitchen-steward": ["Kitchen Steward", "Galley Steward", "Stewarding Supervisor"],
  "food-service": ["Waiter", "F&B Captain", "Restaurant Supervisor"],
  culinary: ["Commis Chef", "Cook", "Chef de Partie"],
  hr: ["HR Assistant", "HR Officer", "HR Manager"],
  driver: ["Driver", "Delivery Driver", "Bus Driver"],
  security: ["Security Guard", "Security Officer", "Security Supervisor"],
  cleaning: ["Cleaner", "Cleaning Supervisor"],
  "front-office": ["Front Desk Agent", "Receptionist", "Front Office Supervisor"],
  administration: ["Office Assistant", "Administrator"],
  "retail-sales": ["Shop Assistant", "Cashier", "Sales Assistant"],
  "customer-service": ["Customer Service Agent", "Call Centre Agent"],
  warehouse: ["Warehouse Assistant", "Storekeeper"],
  construction: ["Site Worker", "Electrician", "Plumber"],
  healthcare: ["Healthcare Assistant", "Nurse"],
  finance: ["Accounts Assistant", "Accountant"],
  education: ["Teaching Assistant", "Teacher"],
  technology: ["IT Support Assistant", "Software Developer"],
};
export function getTalkTitles(key: string) {
  return TITLES[key] ?? [];
}
export function newTalkJob(): ExpEntry {
  return { id: `exp-${crypto.randomUUID()}`, role: "", company: "", companyDesc: "", location: "", dates: "", description: "", gap: "" };
}

export function normalizeTalk(value: unknown, experience: ExpEntry[]): TalkProgress {
  if (!value || typeof value !== "object") return { ...defaultTalkProgress };
  const incoming = value as Partial<TalkProgress>;
  const ids = new Set(experience.map((job) => job.id));
  const families = Object.fromEntries(Object.entries(incoming.families ?? {}).filter(([id, key]) => ids.has(id) && typeof key === "string" && getRoleFamilies().some((family) => family.key === key)));
  const suggestions = Object.fromEntries(Object.entries(incoming.suggestions ?? {}).filter(([id, list]) => ids.has(id) && Array.isArray(list)).map(([id, list]) => [id, list.filter((item) => item && typeof item.text === "string" && ["pending", "kept", "removed"].includes(item.status)).slice(0, 5)]));
  return { questionId: typeof incoming.questionId === "string" ? incoming.questionId : "language", families, suggestions, noEmail: incoming.noEmail === true, completed: incoming.completed === true, summaryInitialized: incoming.summaryInitialized === true, summarySuggestion: typeof incoming.summarySuggestion === "string" ? incoming.summarySuggestion.slice(0, 2000) : undefined };
}
