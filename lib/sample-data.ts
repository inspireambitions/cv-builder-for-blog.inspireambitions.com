import type { CVState } from "./types";

export const sampleCVState: CVState = {
  step: 8,
  template: "corp",
  geo: "global",
  photo: null,
  personal: {
    name: "Sarah Al-Rashid",
    title: "Senior Programme Manager | PMP, PRINCE2",
    email: "sarah.alrashid@email.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    linkedin: "https://linkedin.com/in/sarah-alrashid",
  },
  summary:
    "Results-driven Programme Manager with 10+ years delivering complex transformation initiatives across the GCC. Led portfolios valued at $120M+ across financial services, infrastructure, and government sectors. Proven track record of reducing delivery timelines by 23% through agile adoption and building high-performing cross-functional teams of 50+. CIPD and PMP certified with deep expertise in stakeholder management at C-suite level.",
  experience: [
    {
      id: "exp-1",
      role: "Senior Programme Manager",
      company: "AECOM",
      companyDesc:
        "A $14B global infrastructure consulting firm operating in 150+ countries",
      location: "Dubai, UAE",
      dates: "Mar 2021 \u2013 Present",
      description:
        "\u2022 Led a $45M smart city infrastructure programme across 3 UAE municipalities, delivering 2 months ahead of schedule\n\u2022 Managed cross-functional team of 52 engineers, architects, and consultants across Dubai, Abu Dhabi, and Riyadh\n\u2022 Reduced programme costs by 18% ($8.1M saved) through vendor consolidation and process automation\n\u2022 Presented quarterly progress reports to C-suite stakeholders including government ministry representatives",
      gap: "",
    },
    {
      id: "exp-2",
      role: "Project Manager",
      company: "Deloitte Middle East",
      companyDesc:
        "Big Four professional services firm with 4,000+ employees across the MENA region",
      location: "Dubai, UAE",
      dates: "Jun 2017 \u2013 Feb 2021",
      description:
        "\u2022 Delivered 12 digital transformation projects for banking and government clients, total value $32M\n\u2022 Built and mentored a team of 8 project coordinators, 3 of whom were promoted within 18 months\n\u2022 Introduced agile methodology to the Dubai office, reducing average project delivery time by 23%\n\u2022 Achieved 98% client satisfaction score across all managed engagements",
      gap: "",
    },
    {
      id: "exp-3",
      role: "Business Analyst",
      company: "Emirates NBD",
      companyDesc:
        "Leading banking group in the MENA region with $190B+ in assets",
      location: "Dubai, UAE",
      dates: "Sep 2014 \u2013 May 2017",
      description:
        "\u2022 Analysed and mapped 40+ business processes for the retail banking digital transformation programme\n\u2022 Reduced customer onboarding time from 5 days to same-day through process redesign\n\u2022 Collaborated with IT teams to define requirements for a $4M core banking system upgrade",
      gap: "",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "MBA, International Business",
      institution: "London Business School",
      year: "2014",
      grade: "Distinction",
    },
    {
      id: "edu-2",
      degree: "BSc Computer Science",
      institution: "American University of Sharjah",
      year: "2011",
      grade: "3.8 GPA",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Project Management Professional (PMP)",
      issuer: "PMI",
      date: "2018",
      expiry: "2027",
    },
    {
      id: "cert-2",
      name: "PRINCE2 Practitioner",
      issuer: "AXELOS",
      date: "2019",
      expiry: "",
    },
    {
      id: "cert-3",
      name: "CIPD Level 7 (Strategic People Management)",
      issuer: "CIPD",
      date: "2022",
      expiry: "",
    },
  ],
  skills: [
    "Programme Management",
    "Agile & Scrum",
    "Stakeholder Management",
    "Risk Management",
    "Budget Control",
    "Digital Transformation",
    "Team Leadership",
    "Vendor Management",
    "Business Analysis",
    "Strategic Planning",
  ],
  languages: [
    { id: "lang-1", language: "English", level: "Native" },
    { id: "lang-2", language: "Arabic", level: "Native" },
    { id: "lang-3", language: "French", level: "Professional" },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "GCC Project Leader of the Year",
      body: "Awarded for delivering the Abu Dhabi Smart Infrastructure Programme under budget and ahead of schedule.",
      awardingBody: "PMI MENA Chapter",
      year: "2023",
    },
    {
      id: "ach-2",
      title: "Keynote Speaker \u2014 Future of Work Summit",
      body: "Presented to 800+ attendees on agile transformation in government organisations.",
      awardingBody: "GITEX Global",
      year: "2022",
    },
  ],
  volunteer: [
    {
      id: "vol-1",
      role: "Career Mentor",
      org: "Toastmasters UAE",
      dates: "2020 \u2013 Present",
      impact:
        "Mentored 15+ young professionals on career development and public speaking. 8 mentees secured promotions within 12 months.",
    },
  ],
  projects: [],
  publications: [
    {
      id: "pub-1",
      title:
        "Agile in the Gulf: Adapting Western Frameworks for MENA Culture",
      outlet: "Harvard Business Review Arabia",
      date: "2023",
      url: "",
    },
  ],
  memberships: [
    {
      id: "mem-1",
      org: "Project Management Institute (PMI)",
      level: "Senior Member",
      year: "2018",
    },
    {
      id: "mem-2",
      org: "Chartered Institute of Personnel and Development (CIPD)",
      level: "Chartered Fellow",
      year: "2022",
    },
  ],
  score: null,
  plan: "free",
};
