import type { TemplateType } from "./types";

export type TemplateConfig = {
  id: TemplateType;
  accent: string;
  soft: string;
  heading: "serif" | "sans";
  sidebar: boolean;
  photo: "hidden" | "optional" | "prominent";
  eyebrow: string;
};

export const TEMPLATE_CONFIG: Record<TemplateType, TemplateConfig> = {
  "ats-clean": { id: "ats-clean", accent: "#1155cc", soft: "#ffffff", heading: "sans", sidebar: false, photo: "hidden", eyebrow: "ATS CLEAN" },
  classic: { id: "classic", accent: "#1a2744", soft: "#f3f5f8", heading: "serif", sidebar: true, photo: "optional", eyebrow: "GCC PROFESSIONAL" },
  site: { id: "site", accent: "#263238", soft: "#edf0f1", heading: "sans", sidebar: true, photo: "hidden", eyebrow: "ENGINEERING & DELIVERY" },
  service: { id: "service", accent: "#285c4d", soft: "#edf5f1", heading: "serif", sidebar: true, photo: "prominent", eyebrow: "HOSPITALITY & SERVICE" },
  care: { id: "care", accent: "#176b6b", soft: "#eaf6f5", heading: "sans", sidebar: true, photo: "optional", eyebrow: "HEALTHCARE PROFESSIONAL" },
  ledger: { id: "ledger", accent: "#172f55", soft: "#f1f3f7", heading: "serif", sidebar: false, photo: "hidden", eyebrow: "BANKING & FINANCE" },
  crew: { id: "crew", accent: "#164b70", soft: "#edf5fa", heading: "sans", sidebar: true, photo: "prominent", eyebrow: "AVIATION & CABIN SERVICE" },
  stack: { id: "stack", accent: "#27272a", soft: "#f4f4f5", heading: "sans", sidebar: true, photo: "hidden", eyebrow: "TECHNOLOGY & PRODUCT" },
  move: { id: "move", accent: "#704214", soft: "#f8f3ec", heading: "sans", sidebar: true, photo: "optional", eyebrow: "LOGISTICS & OPERATIONS" },
  corner: { id: "corner", accent: "#352f2b", soft: "#f5f2ef", heading: "serif", sidebar: false, photo: "optional", eyebrow: "EXECUTIVE LEADERSHIP" },
};

export const SECTION_LABELS = {
  en: {
    summary: "Professional Profile",
    experience: "Professional Experience",
    education: "Education",
    credentials: "Certifications & Credentials",
    skills: "Core Expertise",
    languages: "Languages",
    projects: "Selected Projects",
    achievements: "Achievements & Awards",
    volunteer: "Volunteer Work",
    publications: "Publications, Media & Speaking",
    memberships: "Professional Memberships",
    careerNote: "Career note",
  },
  ar: {
    summary: "الملف المهني",
    experience: "الخبرة المهنية",
    education: "التعليم",
    credentials: "الشهادات والتراخيص",
    skills: "الخبرات الأساسية",
    languages: "اللغات",
    projects: "مشاريع مختارة",
    achievements: "الإنجازات والجوائز",
    volunteer: "العمل التطوعي",
    publications: "المنشورات والإعلام والتحدث",
    memberships: "العضويات المهنية",
    careerNote: "ملاحظة مهنية",
  },
} as const;
