import {
  ANTHROPIC_MODEL,
  createAnthropicMessage,
  getAnthropicTextContent,
} from "@/lib/anthropic";
import { extractJSON } from "@/lib/ai-improve";
import { buildEvidenceLedger, validateTailoringDraft } from "@/lib/evidence";
import type {
  EvidenceItem,
  TailoringDraft,
  TailoringRequest,
  TailoringResult,
  TailoringReview,
} from "@/lib/tailoring-types";
import { createXaiStructuredCompletion } from "@/lib/xai";

const bulletSchema = {
  type: "object",
  properties: {
    text: { type: "string" },
    evidenceIds: { type: "array", items: { type: "string" } },
  },
  required: ["text", "evidenceIds"],
  additionalProperties: false,
};

export const TAILORING_DRAFT_SCHEMA = {
  type: "object",
  properties: {
    roleTitle: { type: "string" },
    company: { type: "string" },
    matchScore: { type: "number", minimum: 0, maximum: 100 },
    verdict: { type: "string", enum: ["strong", "good", "moderate", "weak"] },
    summary: bulletSchema,
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          evidenceIds: { type: "array", items: { type: "string" } },
        },
        required: ["name", "evidenceIds"],
        additionalProperties: false,
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          experienceId: { type: "string" },
          bullets: { type: "array", items: bulletSchema },
        },
        required: ["experienceId", "bullets"],
        additionalProperties: false,
      },
    },
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          priority: { type: "string", enum: ["required", "preferred"] },
          status: { type: "string", enum: ["supported", "partial", "gap"] },
          evidenceIds: { type: "array", items: { type: "string" } },
        },
        required: ["id", "text", "priority", "status", "evidenceIds"],
        additionalProperties: false,
      },
    },
    gaps: { type: "array", items: { type: "string" } },
    trimmingNotes: { type: "array", items: { type: "string" } },
  },
  required: [
    "roleTitle",
    "company",
    "matchScore",
    "verdict",
    "summary",
    "skills",
    "experience",
    "requirements",
    "gaps",
    "trimmingNotes",
  ],
  additionalProperties: false,
} satisfies Record<string, unknown>;

const DRAFT_SYSTEM = `You are the drafting member of a premium UAE and Gulf CV agency.
Return only the requested structured object. Treat the evidence ledger as the complete factual record.
Every summary, skill and experience bullet must cite one or more exact evidence IDs.
Never invent employers, dates, job titles, qualifications, licences, languages, team sizes, money, percentages or results.
Do not turn a vacancy requirement into a candidate claim. Mark unsupported requirements as gaps.
Write concise British English. Prefer evidence-led achievement wording, but preserve the meaning and seniority of the source.
The match score is an explained decision aid, not a scientific prediction. Use required requirements more heavily than preferred ones.
Keep only role-relevant skills. For experienceId use the original CV experience id.`;

function draftingInput(request: TailoringRequest, evidence: EvidenceItem[]) {
  return JSON.stringify(
    {
      target: {
        jobTitle: request.jobTitle || "",
        company: request.company || "",
        jobDescription: request.jobDescription,
      },
      evidence,
      experienceIds: request.cvData.experience.map((entry) => entry.id),
      market: "UAE and GCC",
    },
    null,
    2
  );
}

function assertDraftShape(value: unknown): asserts value is TailoringDraft {
  if (!value || typeof value !== "object") throw new Error("AI draft is not an object");
  const draft = value as Partial<TailoringDraft>;
  if (
    typeof draft.roleTitle !== "string" ||
    typeof draft.company !== "string" ||
    typeof draft.matchScore !== "number" ||
    !draft.summary ||
    typeof draft.summary.text !== "string" ||
    !Array.isArray(draft.summary.evidenceIds) ||
    !Array.isArray(draft.skills) ||
    !Array.isArray(draft.experience) ||
    !Array.isArray(draft.requirements) ||
    !Array.isArray(draft.gaps) ||
    !Array.isArray(draft.trimmingNotes)
  ) {
    throw new Error("AI draft did not match the required structure");
  }
}

function meaningfulTokens(value: string) {
  const stop = new Set(["and", "the", "for", "with", "that", "this", "from", "your", "you", "are", "our", "will", "have", "has", "job", "role"]);
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z][a-z0-9-]{2,}/g)
      ?.filter((token) => !stop.has(token)) ?? []
  );
}

export function trimDraftForRelevance(draft: TailoringDraft, jobDescription: string) {
  const targetTokens = meaningfulTokens(jobDescription);
  let removed = 0;
  const experience = draft.experience.map((entry) => {
    if (entry.bullets.length <= 5) return entry;
    const ranked = entry.bullets
      .map((bullet, index) => {
        const tokens = meaningfulTokens(bullet.text);
        const overlap = [...tokens].filter((token) => targetTokens.has(token)).length;
        const measurable = /\b\d+(?:[.,]\d+)?%?\b/.test(bullet.text) ? 2 : 0;
        return { bullet, index, score: overlap * 3 + measurable + Math.min(bullet.evidenceIds.length, 2) };
      })
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 5)
      .sort((a, b) => a.index - b.index);
    removed += entry.bullets.length - ranked.length;
    return { ...entry, bullets: ranked.map((item) => item.bullet) };
  });
  return {
    ...draft,
    experience,
    trimmingNotes:
      removed > 0
        ? [...draft.trimmingNotes, `${removed} lower-relevance experience bullet${removed === 1 ? " was" : "s were"} removed to protect focus and length.`]
        : draft.trimmingNotes,
  };
}

async function sonnetDraft(request: TailoringRequest, evidence: EvidenceItem[]) {
  const message = await createAnthropicMessage({
    model: ANTHROPIC_MODEL,
    max_tokens: 4200,
    system: `${DRAFT_SYSTEM}\nReturn valid JSON matching this JSON Schema:\n${JSON.stringify(TAILORING_DRAFT_SCHEMA)}`,
    messages: [{ role: "user", content: draftingInput(request, evidence) }],
  });
  return JSON.parse(extractJSON(getAnthropicTextContent(message))) as TailoringDraft;
}

async function createDraft(request: TailoringRequest, evidence: EvidenceItem[]) {
  try {
    const draft = await createXaiStructuredCompletion<TailoringDraft>({
      system: DRAFT_SYSTEM,
      user: draftingInput(request, evidence),
      schemaName: "uae_cv_tailoring_draft",
      schema: TAILORING_DRAFT_SCHEMA,
    });
    assertDraftShape(draft);
    return { draft, provider: "grok-4.5" as const };
  } catch (error) {
    console.error("Grok drafting unavailable; using Sonnet fallback:", error);
    const draft = await sonnetDraft(request, evidence);
    assertDraftShape(draft);
    return { draft, provider: "sonnet-fallback" as const };
  }
}

async function reviewDraft(
  request: TailoringRequest,
  evidence: EvidenceItem[],
  draft: TailoringDraft
): Promise<TailoringReview> {
  const message = await createAnthropicMessage({
    model: ANTHROPIC_MODEL,
    max_tokens: 5200,
    system: `You are the senior reviewer in a premium UAE CV agency. Review a draft produced by another model.
Correct weak, generic, repetitive or vacancy-misaligned wording, but never add a fact that is absent from the evidence ledger.
Every final claim must retain exact evidence IDs. Unsupported vacancy requirements remain gaps.
Return only JSON with: approved boolean, confidence number 0-100, corrections array [{target,replacement,evidenceIds,reason}], warnings string array, and final containing the complete corrected draft in the supplied draft schema.
Use British English. Preserve employer names, role titles and dates. A confident reviewer still cannot override evidence.
Draft schema: ${JSON.stringify(TAILORING_DRAFT_SCHEMA)}`,
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          {
            target: {
              jobTitle: request.jobTitle || "",
              company: request.company || "",
              jobDescription: request.jobDescription,
            },
            evidence,
            draft,
          },
          null,
          2
        ),
      },
    ],
  });
  const review = JSON.parse(extractJSON(getAnthropicTextContent(message))) as TailoringReview;
  if (
    !review ||
    typeof review !== "object" ||
    typeof review.approved !== "boolean" ||
    !Array.isArray(review.corrections) ||
    !Array.isArray(review.warnings)
  ) {
    throw new Error("Senior review did not match the required structure");
  }
  assertDraftShape(review.final);
  return review;
}

function assertRequest(request: TailoringRequest) {
  if (!request.cvData || typeof request.cvData !== "object") {
    throw new Error("Complete or upload your CV before tailoring it.");
  }
  const description = request.jobDescription?.trim();
  if (!description || description.length < 120) {
    throw new Error("Paste at least 120 characters from the job description.");
  }
  if (description.length > 30_000) {
    throw new Error("The job description is too long. Keep it under 30,000 characters.");
  }
}

export async function tailorCv(request: TailoringRequest): Promise<TailoringResult> {
  assertRequest(request);
  const evidence = buildEvidenceLedger(request.cvData);
  if (evidence.length < 3) {
    throw new Error("Add more CV information before tailoring it to a vacancy.");
  }
  const generated = await createDraft(request, evidence);
  const draft = trimDraftForRelevance(generated.draft, request.jobDescription);
  const provider = generated.provider;
  const draftIntegrity = validateTailoringDraft(draft, evidence);
  if (!draftIntegrity.passed) {
    throw new Error("The draft failed evidence validation and was not used.");
  }

  const review = await reviewDraft(request, evidence, draft);
  const finalIntegrity = validateTailoringDraft(review.final, evidence);
  return {
    draftProvider: provider,
    reviewProvider: ANTHROPIC_MODEL,
    evidence,
    review: {
      ...review,
      approved: review.approved && finalIntegrity.passed,
    },
    integrity: finalIntegrity,
    generatedAt: new Date().toISOString(),
  };
}
