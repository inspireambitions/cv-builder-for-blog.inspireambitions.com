export type Locale = "en" | "ar";

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "header.tagline": "Built by an HR Director",
    "header.cvBuilder": "CV Builder",

    // Start / Hero
    "hero.badge": "Built by an HR Director",
    "hero.headline": "Build a CV That Gets You Hired",
    "hero.subheadline":
      "The world's most HR-credible CV builder. Free JPEG export. No watermark. No credit card.",
    "hero.buildCta": "Build My CV — Free",
    "hero.uploadCta": "Upload & AI Improve",
    "hero.trust1": "Free forever",
    "hero.trust2": "No sign-up",
    "hero.trust3": "HR Director approved",
    "hero.trust4": "GCC/MENA optimised",
    "hero.templatesTitle": "4 Professional Templates — Choose Your Style",
    "hero.whyTitle": "Why InspireAmbitions?",

    // Features
    "feature.hrApproved": "HR Director Approved",
    "feature.hrApprovedDesc":
      "Every tip, prompt, and scoring criterion written by a practising HR Director who screens CVs daily.",
    "feature.freeExport": "Free JPEG Export",
    "feature.freeExportDesc":
      "Download your CV as a high-resolution image. No watermark. No credit card. No catch.",
    "feature.gulfReady": "Gulf/MENA Ready",
    "feature.gulfReadyDesc":
      "The only CV builder with a dedicated GCC template. Photo support, Arabic-friendly layouts.",
    "feature.aiPowered": "AI-Powered",
    "feature.aiPoweredDesc":
      "Upload your existing CV and our AI rewrites it with achievement-focused language.",
    "feature.livePreview": "Live Preview",
    "feature.livePreviewDesc":
      "See your CV update in real-time as you type. What you see is what you get.",
    "feature.forgottenSections": "Commonly Forgotten Sections",
    "feature.forgottenSectionsDesc":
      "We prompt you for achievements, volunteering, certifications, and memberships that 68-95% of candidates miss.",

    // Template names
    "template.corp": "Corporate / Traditional",
    "template.corpDesc": "Best for: Finance, Law, Consulting, Government",
    "template.min": "Modern Minimal",
    "template.minDesc": "Best for: Tech, Startups, Product, Design",
    "template.gulf": "Gulf / UAE Style",
    "template.gulfDesc": "Best for: GCC/MENA roles where photo is expected",
    "template.gulfBadge": "Popular in GCC",
    "template.cre": "Creative / Bold",
    "template.creDesc": "Best for: Marketing, Media, Creative Industries",

    // Steps
    "step.template": "Template",
    "step.personal": "Personal Details",
    "step.summary": "Professional Summary",
    "step.experience": "Work Experience",
    "step.education": "Education & Certs",
    "step.skills": "Skills & Languages",
    "step.extras": "Extras",
    "step.score": "CV Score & Download",

    // Personal Details (Step 2)
    "personal.title": "Personal Details",
    "personal.subtitle":
      "Let's start with the basics. Recruiters see this first.",
    "personal.name": "Full Name",
    "personal.profTitle": "Professional Title",
    "personal.email": "Email Address",
    "personal.phone": "Phone Number",
    "personal.location": "City / Country",
    "personal.linkedin": "LinkedIn URL",
    "personal.photo": "Profile Photo",
    "personal.photoHint": "Recommended for this template",

    // Summary (Step 3)
    "summary.title": "Professional Summary",
    "summary.target": "Aim for 300\u2013600 characters",
    "summary.prompt1": "Who are you professionally?",
    "summary.prompt2": "What is your biggest achievement?",
    "summary.prompt3": "What role are you targeting?",

    // Experience (Step 4)
    "experience.title": "Work Experience",
    "experience.role": "Job Title",
    "experience.company": "Company Name",
    "experience.companyDesc": "Company Description",
    "experience.location": "Location",
    "experience.dates": "Period",
    "experience.achievements": "Key Achievements",
    "experience.gap": "Employment Gap Explanation",
    "experience.gapOptional": "(optional)",
    "experience.add": "Add Experience",
    "experience.remove": "Remove",

    // Education (Step 5)
    "education.title": "Education",
    "education.degree": "Degree / Qualification",
    "education.institution": "Institution",
    "education.year": "Year Completed",
    "education.grade": "Grade / GPA",
    "education.certsTitle": "Professional Certifications",
    "education.certName": "Certification Name",
    "education.certIssuer": "Issuing Body",
    "education.certDate": "Date Obtained",
    "education.certExpiry": "Expiry Date",
    "education.addEdu": "Add Education",
    "education.addCert": "Add Certification",

    // Skills (Step 6)
    "skills.title": "Skills",
    "skills.placeholder": "Type a skill and press Enter",
    "skills.add": "Add",
    "skills.count": "skills added",
    "skills.langTitle": "Languages",
    "skills.langName": "Language",
    "skills.langLevel": "Proficiency",
    "skills.addLang": "Add Language",

    // Extras (Step 7)
    "extras.title": "Extras \u2014 Commonly Forgotten Sections",
    "extras.achievements": "Achievements & Awards",
    "extras.volunteer": "Volunteer Work",
    "extras.projects": "Personal Projects",
    "extras.publications": "Publications, Media & Speaking",
    "extras.memberships": "Professional Memberships",

    // Score (Step 8)
    "score.title": "Your CV Score",
    "score.download": "Download Your CV",
    "score.roast": "AI CV Roast",
    "score.roastDesc": "Get brutally honest HR feedback on your CV",
    "score.coverLetter": "Generate Cover Letter",
    "score.coverLetterDesc":
      "AI-powered cover letter tailored to your experience",
    "score.mockInterview": "Mock Interview",
    "score.mockInterviewDesc": "Practice with an AI recruiter. Annual Plan includes 1 live session with an HR specialist on weekends.",

    // Navigation
    "nav.back": "Back",
    "nav.next": "Next Step",
    "nav.preview": "Live Preview",
    "nav.close": "Close",

    // Download modal
    "download.title": "Download Your CV",
    "download.subtitle":
      "Choose your preferred format. JPEG is always free.",
    "download.jpeg": "JPEG Image",
    "download.jpegDesc":
      "High-resolution image. Perfect for sharing online.",
    "download.pdf": "PDF Document",
    "download.pdfDesc":
      "ATS-friendly format. Recommended for job applications.",
    "download.word": "Word Document",
    "download.wordDesc": "Editable .docx format. Easy to customize further.",
    "download.free": "FREE",
    "download.included": "INCLUDED",
    "download.payDownload": "Pay & Download",
    "download.annualUpsell": "Save with the Annual Plan \u2014 $86.40/year",

    // Toast
    "toast.saved": "Progress saved",

    // HR Tips
    "tip.label": "HR Director Tip",
    "tip.email":
      "Recruiters see your email before your CV. firstname.lastname@gmail.com is the gold standard. Avoid nicknames, birth years, or numbers.",
    "tip.summary":
      "A weak summary: \u2018Experienced professional seeking new opportunities.\u2019 A strong summary: \u2018Senior Project Manager with 8 years delivering $50M+ infrastructure programmes across the GCC. Reduced delivery timelines by 23% through agile methodology adoption at AECOM.\u2019",
    "tip.experience":
      "Use the Action + Number + Outcome formula. Weak: \u2018Managed a team.\u2019 Strong: \u2018Led a cross-functional team of 15, delivering a $3M digital transformation project 2 weeks ahead of schedule.\u2019",
    "tip.education":
      "Professional certifications like CIPD, PMP, SHRM, and CFA often carry more weight than your university name in hiring decisions. Always list them prominently.",
    "tip.skills":
      "Mirror the exact keywords from the job description. If the posting says \u2018stakeholder management\u2019, use that exact phrase \u2014 not \u2018managing stakeholders\u2019. ATS systems match keywords literally.",
    "tip.template":
      "In the Gulf/MENA region, including a professional photo on your CV is standard practice. In Europe and North America, it\u2019s generally discouraged. Choose a template that matches your target market.",
  },
  ar: {
    // Header
    "header.tagline": "\u0628\u064f\u0646\u064a \u0628\u0648\u0627\u0633\u0637\u0629 \u0645\u062f\u064a\u0631 \u0645\u0648\u0627\u0631\u062f \u0628\u0634\u0631\u064a\u0629",
    "header.cvBuilder": "\u0645\u0646\u0634\u0626 \u0627\u0644\u0633\u064a\u0631\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",

    // Start / Hero
    "hero.badge": "\u0628\u064f\u0646\u064a \u0628\u0648\u0627\u0633\u0637\u0629 \u0645\u062f\u064a\u0631 \u0645\u0648\u0627\u0631\u062f \u0628\u0634\u0631\u064a\u0629",
    "hero.headline": "\u0623\u0646\u0634\u0626 \u0633\u064a\u0631\u0629 \u0630\u0627\u062a\u064a\u0629 \u062a\u062d\u0635\u0644 \u0628\u0647\u0627 \u0639\u0644\u0649 \u0648\u0638\u064a\u0641\u0629",
    "hero.subheadline":
      "\u0623\u0643\u062b\u0631 \u0645\u0646\u0634\u0626 \u0633\u064a\u0631 \u0630\u0627\u062a\u064a\u0629 \u0645\u0635\u062f\u0627\u0642\u064a\u0629 \u0641\u064a \u0627\u0644\u0639\u0627\u0644\u0645. \u062a\u0635\u062f\u064a\u0631 JPEG \u0645\u062c\u0627\u0646\u064a. \u0628\u062f\u0648\u0646 \u0639\u0644\u0627\u0645\u0629 \u0645\u0627\u0626\u064a\u0629. \u0628\u062f\u0648\u0646 \u0628\u0637\u0627\u0642\u0629 \u0627\u0626\u062a\u0645\u0627\u0646.",
    "hero.buildCta": "\u0623\u0646\u0634\u0626 \u0633\u064a\u0631\u062a\u064a \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u2014 \u0645\u062c\u0627\u0646\u0627\u064b",
    "hero.uploadCta": "\u0627\u0631\u0641\u0639 \u0648\u062d\u0633\u0651\u0646 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
    "hero.trust1": "\u0645\u062c\u0627\u0646\u064a \u0644\u0644\u0623\u0628\u062f",
    "hero.trust2": "\u0628\u062f\u0648\u0646 \u062a\u0633\u062c\u064a\u0644",
    "hero.trust3": "\u0645\u0639\u062a\u0645\u062f \u0645\u0646 \u0645\u062f\u064a\u0631 \u0645\u0648\u0627\u0631\u062f \u0628\u0634\u0631\u064a\u0629",
    "hero.trust4": "\u0645\u064f\u062d\u0633\u0651\u0646 \u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062e\u0644\u064a\u062c \u0648\u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0648\u0633\u0637",
    "hero.templatesTitle": "4 \u0642\u0648\u0627\u0644\u0628 \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u2014 \u0627\u062e\u062a\u0631 \u0623\u0633\u0644\u0648\u0628\u0643",
    "hero.whyTitle": "\u0644\u0645\u0627\u0630\u0627 InspireAmbitions\u061f",

    // Features
    "feature.hrApproved": "\u0645\u0639\u062a\u0645\u062f \u0645\u0646 \u0645\u062f\u064a\u0631 \u0645\u0648\u0627\u0631\u062f \u0628\u0634\u0631\u064a\u0629",
    "feature.hrApprovedDesc":
      "\u0643\u0644 \u0646\u0635\u064a\u062d\u0629 \u0648\u0645\u0639\u064a\u0627\u0631 \u062a\u0642\u064a\u064a\u0645 \u0643\u062a\u0628\u0647\u0627 \u0645\u062f\u064a\u0631 \u0645\u0648\u0627\u0631\u062f \u0628\u0634\u0631\u064a\u0629 \u0645\u0645\u0627\u0631\u0633 \u064a\u0641\u0631\u0632 \u0627\u0644\u0633\u064a\u0631 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u064a\u0648\u0645\u064a\u0627\u064b.",
    "feature.freeExport": "\u062a\u0635\u062f\u064a\u0631 JPEG \u0645\u062c\u0627\u0646\u064a",
    "feature.freeExportDesc":
      "\u062d\u0645\u0651\u0644 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0643\u0635\u0648\u0631\u0629 \u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062f\u0642\u0629. \u0628\u062f\u0648\u0646 \u0639\u0644\u0627\u0645\u0629 \u0645\u0627\u0626\u064a\u0629. \u0628\u062f\u0648\u0646 \u0628\u0637\u0627\u0642\u0629 \u0627\u0626\u062a\u0645\u0627\u0646.",
    "feature.gulfReady": "\u062c\u0627\u0647\u0632 \u0644\u0644\u062e\u0644\u064a\u062c \u0648\u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0648\u0633\u0637",
    "feature.gulfReadyDesc":
      "\u0645\u0646\u0634\u0626 \u0627\u0644\u0633\u064a\u0631 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0627\u0644\u0648\u062d\u064a\u062f \u0645\u0639 \u0642\u0627\u0644\u0628 \u0645\u062e\u0635\u0635 \u0644\u062f\u0648\u0644 \u0627\u0644\u062e\u0644\u064a\u062c. \u062f\u0639\u0645 \u0627\u0644\u0635\u0648\u0631 \u0648\u062a\u0635\u0645\u064a\u0645\u0627\u062a \u062a\u0646\u0627\u0633\u0628 \u0627\u0644\u0639\u0631\u0628\u064a\u0629.",
    "feature.aiPowered": "\u0645\u062f\u0639\u0648\u0645 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
    "feature.aiPoweredDesc":
      "\u0627\u0631\u0641\u0639 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629 \u0648\u062f\u0639 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u064a\u0639\u064a\u062f \u0643\u062a\u0627\u0628\u062a\u0647\u0627 \u0628\u0644\u063a\u0629 \u062a\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0625\u0646\u062c\u0627\u0632\u0627\u062a.",
    "feature.livePreview": "\u0645\u0639\u0627\u064a\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
    "feature.livePreviewDesc":
      "\u0634\u0627\u0647\u062f \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u062a\u062a\u062d\u062f\u062b \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0641\u0639\u0644\u064a \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u0643\u062a\u0627\u0628\u0629.",
    "feature.forgottenSections": "\u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0645\u0646\u0633\u064a\u0629 \u0639\u0627\u062f\u0629\u064b",
    "feature.forgottenSectionsDesc":
      "\u0646\u0637\u0644\u0628 \u0645\u0646\u0643 \u0627\u0644\u0625\u0646\u062c\u0627\u0632\u0627\u062a \u0648\u0627\u0644\u062a\u0637\u0648\u0639 \u0648\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a \u0648\u0627\u0644\u0639\u0636\u0648\u064a\u0627\u062a \u0627\u0644\u062a\u064a \u064a\u0641\u0648\u0651\u062a\u0647\u0627 68-95% \u0645\u0646 \u0627\u0644\u0645\u0631\u0634\u062d\u064a\u0646.",

    // Template names
    "template.corp": "\u0627\u0644\u0645\u0624\u0633\u0633\u064a / \u0627\u0644\u062a\u0642\u0644\u064a\u062f\u064a",
    "template.corpDesc": "\u0627\u0644\u0623\u0641\u0636\u0644 \u0644\u0640: \u0627\u0644\u0645\u0627\u0644\u064a\u0629\u060c \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u060c \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a\u060c \u0627\u0644\u062d\u0643\u0648\u0645\u0629",
    "template.min": "\u0627\u0644\u062d\u062f\u064a\u062b \u0627\u0644\u0628\u0633\u064a\u0637",
    "template.minDesc": "\u0627\u0644\u0623\u0641\u0636\u0644 \u0644\u0640: \u0627\u0644\u062a\u0642\u0646\u064a\u0629\u060c \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0646\u0627\u0634\u0626\u0629\u060c \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0627\u0644\u062a\u0635\u0645\u064a\u0645",
    "template.gulf": "\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u062e\u0644\u064a\u062c / \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a",
    "template.gulfDesc": "\u0627\u0644\u0623\u0641\u0636\u0644 \u0644\u0640: \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u062e\u0644\u064a\u062c \u062d\u064a\u062b \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u062a\u0648\u0642\u0639\u0629",
    "template.gulfBadge": "\u0634\u0627\u0626\u0639 \u0641\u064a \u0627\u0644\u062e\u0644\u064a\u062c",
    "template.cre": "\u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a / \u0627\u0644\u062c\u0631\u064a\u0621",
    "template.creDesc": "\u0627\u0644\u0623\u0641\u0636\u0644 \u0644\u0640: \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u060c \u0627\u0644\u0625\u0639\u0644\u0627\u0645\u060c \u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062a \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a\u0629",

    // Steps
    "step.template": "\u0627\u0644\u0642\u0627\u0644\u0628",
    "step.personal": "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629",
    "step.summary": "\u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u0645\u0647\u0646\u064a",
    "step.experience": "\u0627\u0644\u062e\u0628\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u064a\u0629",
    "step.education": "\u0627\u0644\u062a\u0639\u0644\u064a\u0645 \u0648\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a",
    "step.skills": "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062a \u0648\u0627\u0644\u0644\u063a\u0627\u062a",
    "step.extras": "\u0625\u0636\u0627\u0641\u0627\u062a",
    "step.score": "\u0627\u0644\u062a\u0642\u064a\u064a\u0645 \u0648\u0627\u0644\u062a\u062d\u0645\u064a\u0644",

    // Personal Details (Step 2)
    "personal.title": "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629",
    "personal.subtitle":
      "\u0644\u0646\u0628\u062f\u0623 \u0628\u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0627\u062a. \u064a\u0631\u0649 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0648\u0646 \u0639\u0646 \u0627\u0644\u062a\u0648\u0638\u064a\u0641 \u0647\u0630\u0627 \u0623\u0648\u0644\u0627\u064b.",
    "personal.name": "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644",
    "personal.profTitle": "\u0627\u0644\u0645\u0633\u0645\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
    "personal.email": "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    "personal.phone": "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641",
    "personal.location": "\u0627\u0644\u0645\u062f\u064a\u0646\u0629 / \u0627\u0644\u062f\u0648\u0644\u0629",
    "personal.linkedin": "\u0631\u0627\u0628\u0637 LinkedIn",
    "personal.photo": "\u0635\u0648\u0631\u0629 \u0634\u062e\u0635\u064a\u0629",
    "personal.photoHint": "\u0645\u0648\u0635\u0649 \u0628\u0647\u0627 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0627\u0644\u0628",

    // Summary (Step 3)
    "summary.title": "\u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u0645\u0647\u0646\u064a",
    "summary.target": "\u0627\u0633\u062a\u0647\u062f\u0641 300-600 \u062d\u0631\u0641",
    "summary.prompt1": "\u0645\u0646 \u0623\u0646\u062a \u0645\u0647\u0646\u064a\u0627\u064b\u061f",
    "summary.prompt2": "\u0645\u0627 \u0647\u0648 \u0623\u0643\u0628\u0631 \u0625\u0646\u062c\u0627\u0632 \u0644\u0643\u061f",
    "summary.prompt3": "\u0645\u0627 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u062a\u064a \u062a\u0633\u062a\u0647\u062f\u0641\u0647\u0627\u061f",

    // Experience (Step 4)
    "experience.title": "\u0627\u0644\u062e\u0628\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u064a\u0629",
    "experience.role": "\u0627\u0644\u0645\u0633\u0645\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
    "experience.company": "\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629",
    "experience.companyDesc": "\u0648\u0635\u0641 \u0627\u0644\u0634\u0631\u0643\u0629",
    "experience.location": "\u0627\u0644\u0645\u0648\u0642\u0639",
    "experience.dates": "\u0627\u0644\u0641\u062a\u0631\u0629",
    "experience.achievements": "\u0627\u0644\u0625\u0646\u062c\u0627\u0632\u0627\u062a \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    "experience.gap": "\u062a\u0641\u0633\u064a\u0631 \u0641\u062c\u0648\u0629 \u0627\u0644\u062a\u0648\u0638\u064a\u0641",
    "experience.gapOptional": "(\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
    "experience.add": "\u0625\u0636\u0627\u0641\u0629 \u062e\u0628\u0631\u0629",
    "experience.remove": "\u062d\u0630\u0641",

    // Education (Step 5)
    "education.title": "\u0627\u0644\u062a\u0639\u0644\u064a\u0645",
    "education.degree": "\u0627\u0644\u062f\u0631\u062c\u0629 / \u0627\u0644\u0645\u0624\u0647\u0644",
    "education.institution": "\u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u064a\u0629",
    "education.year": "\u0633\u0646\u0629 \u0627\u0644\u062a\u062e\u0631\u062c",
    "education.grade": "\u0627\u0644\u0645\u0639\u062f\u0644",
    "education.certsTitle": "\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0647\u0646\u064a\u0629",
    "education.certName": "\u0627\u0633\u0645 \u0627\u0644\u0634\u0647\u0627\u062f\u0629",
    "education.certIssuer": "\u0627\u0644\u062c\u0647\u0629 \u0627\u0644\u0645\u0627\u0646\u062d\u0629",
    "education.certDate": "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062d\u0635\u0648\u0644",
    "education.certExpiry": "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621",
    "education.addEdu": "\u0625\u0636\u0627\u0641\u0629 \u062a\u0639\u0644\u064a\u0645",
    "education.addCert": "\u0625\u0636\u0627\u0641\u0629 \u0634\u0647\u0627\u062f\u0629",

    // Skills (Step 6)
    "skills.title": "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062a",
    "skills.placeholder": "\u0627\u0643\u062a\u0628 \u0645\u0647\u0627\u0631\u0629 \u0648\u0627\u0636\u063a\u0637 Enter",
    "skills.add": "\u0625\u0636\u0627\u0641\u0629",
    "skills.count": "\u0645\u0647\u0627\u0631\u0627\u062a \u0645\u0636\u0627\u0641\u0629",
    "skills.langTitle": "\u0627\u0644\u0644\u063a\u0627\u062a",
    "skills.langName": "\u0627\u0644\u0644\u063a\u0629",
    "skills.langLevel": "\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0625\u062a\u0642\u0627\u0646",
    "skills.addLang": "\u0625\u0636\u0627\u0641\u0629 \u0644\u063a\u0629",

    // Extras (Step 7)
    "extras.title": "\u0625\u0636\u0627\u0641\u0627\u062a \u2014 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0645\u0646\u0633\u064a\u0629 \u0639\u0627\u062f\u0629\u064b",
    "extras.achievements": "\u0627\u0644\u0625\u0646\u062c\u0627\u0632\u0627\u062a \u0648\u0627\u0644\u062c\u0648\u0627\u0626\u0632",
    "extras.volunteer": "\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062a\u0637\u0648\u0639\u064a",
    "extras.projects": "\u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u0634\u062e\u0635\u064a\u0629",
    "extras.publications": "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0648\u0627\u0644\u0645\u062d\u0627\u0636\u0631\u0627\u062a",
    "extras.memberships": "\u0627\u0644\u0639\u0636\u0648\u064a\u0627\u062a \u0627\u0644\u0645\u0647\u0646\u064a\u0629",

    // Score (Step 8)
    "score.title": "\u062a\u0642\u064a\u064a\u0645 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
    "score.download": "\u062d\u0645\u0651\u0644 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
    "score.roast": "\u062a\u0642\u064a\u064a\u0645 AI \u0627\u0644\u0635\u0631\u064a\u062d",
    "score.roastDesc":
      "\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0635\u0631\u064a\u062d\u0629 \u0645\u0646 \u0645\u062f\u064a\u0631 \u0645\u0648\u0627\u0631\u062f \u0628\u0634\u0631\u064a\u0629 \u0639\u0644\u0649 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
    "score.coverLetter": "\u0625\u0646\u0634\u0627\u0621 \u062e\u0637\u0627\u0628 \u062a\u063a\u0637\u064a\u0629",
    "score.coverLetterDesc":
      "\u062e\u0637\u0627\u0628 \u062a\u063a\u0637\u064a\u0629 \u0645\u062f\u0639\u0648\u0645 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0645\u062e\u0635\u0635 \u0644\u062e\u0628\u0631\u062a\u0643",
    "score.mockInterview": "\u0645\u0642\u0627\u0628\u0644\u0629 \u062a\u062f\u0631\u064a\u0628\u064a\u0629",
    "score.mockInterviewDesc":
      "\u062a\u062f\u0631\u0628 \u0645\u0639 \u0645\u0633\u0624\u0648\u0644 \u062a\u0648\u0638\u064a\u0641 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",

    // Navigation
    "nav.back": "\u0631\u062c\u0648\u0639",
    "nav.next": "\u0627\u0644\u062e\u0637\u0648\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
    "nav.preview": "\u0645\u0639\u0627\u064a\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
    "nav.close": "\u0625\u063a\u0644\u0627\u0642",

    // Download modal
    "download.title": "\u062d\u0645\u0651\u0644 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
    "download.subtitle":
      "\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0645\u0641\u0636\u0644 \u0644\u062f\u064a\u0643. JPEG \u0645\u062c\u0627\u0646\u064a \u062f\u0627\u0626\u0645\u0627\u064b.",
    "download.jpeg": "\u0635\u0648\u0631\u0629 JPEG",
    "download.jpegDesc":
      "\u0635\u0648\u0631\u0629 \u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062f\u0642\u0629. \u0645\u062b\u0627\u0644\u064a\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a.",
    "download.pdf": "\u0645\u0633\u062a\u0646\u062f PDF",
    "download.pdfDesc":
      "\u062a\u0646\u0633\u064a\u0642 \u0645\u062a\u0648\u0627\u0641\u0642 \u0645\u0639 ATS. \u0645\u0648\u0635\u0649 \u0628\u0647 \u0644\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062a\u0648\u0638\u064a\u0641.",
    "download.word": "\u0645\u0633\u062a\u0646\u062f Word",
    "download.wordDesc": "\u062a\u0646\u0633\u064a\u0642 .docx \u0642\u0627\u0628\u0644 \u0644\u0644\u062a\u0639\u062f\u064a\u0644.",
    "download.free": "\u0645\u062c\u0627\u0646\u064a",
    "download.included": "\u0645\u0634\u0645\u0648\u0644",
    "download.payDownload": "\u0627\u062f\u0641\u0639 \u0648\u062d\u0645\u0651\u0644",
    "download.annualUpsell": "\u0648\u0641\u0651\u0631 \u0645\u0639 \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0633\u0646\u0648\u064a\u0629 \u2014 $86.40/\u0633\u0646\u0629",

    // Toast
    "toast.saved": "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0642\u062f\u0645",

    // HR Tips
    "tip.label": "\u0646\u0635\u064a\u062d\u0629 \u0645\u062f\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629",
    "tip.email":
      "\u064a\u0631\u0649 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0648\u0646 \u0639\u0646 \u0627\u0644\u062a\u0648\u0638\u064a\u0641 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0642\u0628\u0644 \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629. firstname.lastname@gmail.com \u0647\u0648 \u0627\u0644\u0645\u0639\u064a\u0627\u0631 \u0627\u0644\u0630\u0647\u0628\u064a.",
    "tip.summary":
      "\u0645\u0644\u062e\u0635 \u0636\u0639\u064a\u0641: '\u0645\u062d\u062a\u0631\u0641 \u0630\u0648 \u062e\u0628\u0631\u0629 \u064a\u0628\u062d\u062b \u0639\u0646 \u0641\u0631\u0635 \u062c\u062f\u064a\u062f\u0629.' \u0645\u0644\u062e\u0635 \u0642\u0648\u064a: '\u0645\u062f\u064a\u0631 \u0645\u0634\u0627\u0631\u064a\u0639 \u0623\u0648\u0644 \u0628\u062e\u0628\u0631\u0629 8 \u0633\u0646\u0648\u0627\u062a \u0641\u064a \u062a\u0646\u0641\u064a\u0630 \u0628\u0631\u0627\u0645\u062c \u0628\u0646\u064a\u0629 \u062a\u062d\u062a\u064a\u0629 \u0628\u0642\u064a\u0645\u0629 50 \u0645\u0644\u064a\u0648\u0646 \u062f\u0648\u0644\u0627\u0631+ \u0641\u064a \u0627\u0644\u062e\u0644\u064a\u062c.'",
    "tip.experience":
      "\u0627\u0633\u062a\u062e\u062f\u0645 \u0635\u064a\u063a\u0629: \u0641\u0639\u0644 + \u0631\u0642\u0645 + \u0646\u062a\u064a\u062c\u0629. \u0636\u0639\u064a\u0641: '\u0623\u062f\u0631\u062a \u0641\u0631\u064a\u0642\u0627\u064b.' \u0642\u0648\u064a: '\u0642\u062f\u062a \u0641\u0631\u064a\u0642\u0627\u064b \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u062a\u062e\u0635\u0635\u0627\u062a \u0645\u0646 15 \u0634\u062e\u0635\u0627\u064b \u0644\u062a\u0646\u0641\u064a\u0630 \u0645\u0634\u0631\u0648\u0639 \u062a\u062d\u0648\u0644 \u0631\u0642\u0645\u064a \u0628\u0642\u064a\u0645\u0629 3 \u0645\u0644\u0627\u064a\u064a\u0646 \u062f\u0648\u0644\u0627\u0631.'",
    "tip.education":
      "\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0647\u0646\u064a\u0629 \u0645\u062b\u0644 CIPD \u0648 PMP \u0648 SHRM \u063a\u0627\u0644\u0628\u0627\u064b \u0645\u0627 \u062a\u062d\u0645\u0644 \u0648\u0632\u0646\u0627\u064b \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0633\u0645 \u0627\u0644\u062c\u0627\u0645\u0639\u0629 \u0641\u064a \u0642\u0631\u0627\u0631\u0627\u062a \u0627\u0644\u062a\u0648\u0638\u064a\u0641.",
    "tip.skills":
      "\u0637\u0627\u0628\u0642 \u0627\u0644\u0643\u0644\u0645\u0627\u062a \u0627\u0644\u0645\u0641\u062a\u0627\u062d\u064a\u0629 \u0627\u0644\u062f\u0642\u064a\u0642\u0629 \u0645\u0646 \u0648\u0635\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629. \u0623\u0646\u0638\u0645\u0629 ATS \u062a\u0637\u0627\u0628\u0642 \u0627\u0644\u0643\u0644\u0645\u0627\u062a \u062d\u0631\u0641\u064a\u0627\u064b.",
    "tip.template":
      "\u0641\u064a \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062e\u0644\u064a\u062c\u060c \u062a\u0636\u0645\u064a\u0646 \u0635\u0648\u0631\u0629 \u0645\u0647\u0646\u064a\u0629 \u0641\u064a \u0633\u064a\u0631\u062a\u0643 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0647\u0648 \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0639\u062a\u0627\u062f\u0629. \u0641\u064a \u0623\u0648\u0631\u0648\u0628\u0627 \u0648\u0623\u0645\u0631\u064a\u0643\u0627 \u0627\u0644\u0634\u0645\u0627\u0644\u064a\u0629\u060c \u064a\u064f\u0646\u0635\u062d \u0639\u0627\u062f\u0629\u064b \u0628\u0639\u062f\u0645 \u062a\u0636\u0645\u064a\u0646\u0647\u0627.",
  },
};
