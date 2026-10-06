# Step 4 review

Status: local implementation. Hosted PR checks and preview release remain pending.

## Scope

English Talk Mode C1–C4 uses the existing CVState and exports. It stays behind NEXT_PUBLIC_TALK_MODE, which remains off in Production. Full form remains available and shares the same draft. Arabic and Urdu screenshots check right-to-left layout only. Translated questions belong to step 5.

The interface uses one question, large buttons and an optional preview. No answers are selected for the candidate. Sentence choices need a deliberate tap. AI suggestions need approval. The deterministic summary and sentence library work without AI.

AI routes whitelist the submitted work fields, reject unsupported vocabulary and numbers, use bounded in-memory caches and limit requests per server instance. These checks reduce risk. They cannot prove every possible rewrite preserves meaning. Candidate review remains required. No payment code or picture-download gate was added.

## Local evidence, 6 October 2026

- Existing-form regression run: 136 passed, 22 deliberate skips. Talk screens are tested separately with the flag enabled.
- Lighthouse with Talk Mode off: performance 98, accessibility 100, LCP 2326ms, CLS 0, TBT 94ms. All current thresholds passed.
- Initial JavaScript: about 153KB compressed. Fonts: 77.7KB. Both budgets passed.
- Lint: no errors, three existing image warnings.
- Free-product and plain-language checks passed. Eight email migration scenarios passed.
- AI-off flows produced valid JPEG, PDF and Word files on mobile and desktop. PDF and Word content was parsed. JPEG pixels were inspected.
- Back, refresh, switching to Full form, adding another job and approving AI suggestions passed.
- Screenshots cover 24 screens at 360px in English, Arabic layout and Urdu layout. Arabic and Urdu questions are still English.
- Final enabled run: 17 tests passed, three desktop duplicates of the mobile screenshot matrix skipped. Every mobile screen passed axe checks for serious and critical WCAG findings. Full form also passed the width check with Talk Mode enabled.
- Model responses in these tests use a local mock. Live provider feedback has not been verified in this step. No external email was sent.

The fallback reuses buildPlainSummary and omits guessed years or country totals. Unsupported AI rewrites fall back to candidate-selected sentences. Real-user completion remains unmeasured.

## Claude consultation prompt

Claude access was checked on 6 October 2026. The CLI is signed out and this session has no configured Anthropic API key. No Claude or Fable review has taken place.

Review the step-4 diff against brief 07, C1–C4. Do not request secrets or real candidate data. Check components/talk/TalkMode.tsx, lib/talk-flow.ts, lib/talk-server.ts, lib/evidence.ts and tests/step-04-talk.spec.ts. Prioritise lost draft data, conditional question branches, stale AI responses, fabricated claims, unsupported contacts reaching the provider, hidden export rendering, accessibility at 360px and flag-off regressions. The summary must work without AI. Full form must share CVState. Picture export must stay ungated. Return concrete defects with reproduction steps and severity. Do not treat passing mocks as live provider proof. Do not approve Production enablement, translations, voice or WhatsApp work in this step.
