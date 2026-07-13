export const COMPARISONS = {
  zety: {
    name: "Zety",
    summary: "Zety offers a guided global resume builder. Inspire Ambitions focuses on free Gulf-ready CVs, evidence controls and an ungated JPEG option.",
    source: "https://zety.com/pricing",
    sourceLabel: "Zety pricing",
    fact: "Zety's official pricing page lists TXT downloads in its free package and multiple-format downloads in paid packages.",
  },
  "resume-io": {
    name: "Resume.io",
    summary: "Resume.io has a broad international template library. Inspire Ambitions is built around UAE and Gulf application details and keeps the builder free.",
    source: "https://help.resume.io/en/articles/3784704",
    sourceLabel: "Resume.io download help",
    fact: "Resume.io states that DOCX availability depends on the template and plan, while its free options are limited.",
  },
  enhancv: {
    name: "Enhancv",
    summary: "Enhancv is a polished global resume product. Inspire Ambitions adds Gulf fields, Arabic document direction and editable Word export.",
    source: "https://enhancv.com/pricing/",
    sourceLabel: "Enhancv pricing and FAQ",
    fact: "Enhancv's official FAQ says its resumes download as PDF rather than Word documents.",
  },
  kickresume: {
    name: "Kickresume",
    summary: "Kickresume offers free and premium resume options. Inspire Ambitions is designed for Gulf job seekers and does not sell a premium tier.",
    source: "https://www.kickresume.com/en/help-center/general/",
    sourceLabel: "Kickresume help centre",
    fact: "Kickresume says free users can create and download CVs within its free customisation options, while premium features remain optional.",
  },
  canva: {
    name: "Canva",
    summary: "Canva is a flexible visual design tool. Inspire Ambitions is a focused CV workflow with ATS checks, Gulf fields and deterministic job matching.",
    source: "https://www.canva.com/create/resumes/",
    sourceLabel: "Canva resume builder",
    fact: "Canva's official page describes PDF, JPG and PNG exports and a broad visual template editor.",
  },
} as const;

export type ComparisonSlug = keyof typeof COMPARISONS;
