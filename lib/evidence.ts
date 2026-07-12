import type { CVState } from "@/lib/types";
import type {
  EvidenceItem,
  IntegrityFinding,
  TailoringDraft,
} from "@/lib/tailoring-types";

function add(
  ledger: EvidenceItem[],
  kind: EvidenceItem["kind"],
  id: string,
  text: string,
  sourceLabel: string
) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean) ledger.push({ id, kind, text: clean, sourceLabel });
}

export function buildEvidenceLedger(cv: CVState): EvidenceItem[] {
  const ledger: EvidenceItem[] = [];
  add(ledger, "profile", "profile-title", cv.personal.title, "Target title");
  add(ledger, "profile", "profile-location", cv.personal.location, "Location");
  add(ledger, "profile", "profile-summary", cv.summary, "Professional summary");

  cv.experience.forEach((entry) => {
    const label = `${entry.role || "Role"} at ${entry.company || "employer"}`;
    add(ledger, "experience", `${entry.id}-role`, entry.role, `${label}: title`);
    add(ledger, "experience", `${entry.id}-company`, entry.company, `${label}: employer`);
    add(ledger, "experience", `${entry.id}-dates`, entry.dates, `${label}: dates`);
    add(ledger, "experience", `${entry.id}-location`, entry.location, `${label}: location`);
    entry.description
      .split(/\n+|(?<=[.!?])\s+/)
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value, itemIndex) =>
        add(
          ledger,
          "experience",
          `${entry.id}-detail-${itemIndex + 1}`,
          value,
          `${label}: evidence ${itemIndex + 1}`
        )
      );
  });

  cv.education.forEach((entry, index) =>
    add(
      ledger,
      "education",
      `education-${entry.id || index + 1}`,
      [entry.degree, entry.institution, entry.year, entry.grade].filter(Boolean).join(" | "),
      `Education ${index + 1}`
    )
  );
  cv.skills.forEach((skill, index) =>
    add(ledger, "skill", `skill-${index + 1}`, skill, `Skill ${index + 1}`)
  );
  cv.certifications.forEach((entry, index) =>
    add(
      ledger,
      "certification",
      `certification-${entry.id || index + 1}`,
      [entry.name, entry.issuer, entry.date, entry.expiry].filter(Boolean).join(" | "),
      `Certification ${index + 1}`
    )
  );
  cv.achievements.forEach((entry, index) =>
    add(
      ledger,
      "achievement",
      `achievement-${entry.id || index + 1}`,
      [entry.title, entry.body, entry.awardingBody, entry.year].filter(Boolean).join(" | "),
      `Achievement ${index + 1}`
    )
  );
  return ledger;
}

function numberTokens(value: string) {
  return value.match(/\b\d+(?:[.,]\d+)?(?:%|\b)/g) ?? [];
}

export function validateTailoringDraft(
  draft: TailoringDraft,
  evidence: EvidenceItem[]
) {
  const findings: IntegrityFinding[] = [];
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]));

  function checkClaim(path: string, text: string, ids: string[]) {
    if (!text.trim()) {
      findings.push({ path, message: "Generated claim is empty.", severity: "error" });
      return;
    }
    if (!ids.length) {
      findings.push({
        path,
        message: "Generated claim has no supporting evidence.",
        severity: "error",
      });
      return;
    }
    const missing = ids.filter((id) => !evidenceMap.has(id));
    if (missing.length) {
      findings.push({
        path,
        message: `Unknown evidence reference: ${missing.join(", ")}.`,
        severity: "error",
      });
    }
    const sourceText = ids
      .map((id) => evidenceMap.get(id)?.text ?? "")
      .join(" ")
      .toLowerCase();
    const unsupportedNumbers = numberTokens(text).filter(
      (number) => !sourceText.includes(number.toLowerCase())
    );
    if (unsupportedNumbers.length) {
      findings.push({
        path,
        message: `Number not found in cited evidence: ${unsupportedNumbers.join(", ")}.`,
        severity: "error",
      });
    }
  }

  checkClaim("summary", draft.summary.text, draft.summary.evidenceIds);
  draft.skills.forEach((skill, index) =>
    checkClaim(`skills.${index}`, skill.name, skill.evidenceIds)
  );
  draft.experience.forEach((entry, entryIndex) =>
    entry.bullets.forEach((bullet, bulletIndex) =>
      checkClaim(
        `experience.${entryIndex}.bullets.${bulletIndex}`,
        bullet.text,
        bullet.evidenceIds
      )
    )
  );
  draft.requirements.forEach((requirement, index) => {
    if (requirement.status !== "gap") {
      checkClaim(
        `requirements.${index}`,
        requirement.text,
        requirement.evidenceIds
      );
    }
  });

  if (!Number.isFinite(draft.matchScore) || draft.matchScore < 0 || draft.matchScore > 100) {
    findings.push({
      path: "matchScore",
      message: "Match score must be between 0 and 100.",
      severity: "error",
    });
  }
  return { passed: !findings.some((item) => item.severity === "error"), findings };
}
