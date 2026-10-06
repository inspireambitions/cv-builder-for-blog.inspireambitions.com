# Step 3: wording, saved drafts and measurement

Baseline: main f58d09eceea792f5c700968178d1467237a9a699.
Scope: brief 07 B5, C5 and preparation for R11. Step 4 has not started.

## Changes

- Add a plain-language CI guard. Check visible JSX, labels, translations and known UI libraries. Ignore imports, identifiers, comments and server prompts. Legal and comparison pages may use ATS, but not model names. Check future Talk Mode questions for length and estimated reading grade.
- Move the profile after work history, education and skills. Draft version 8 maps old sections through both earlier layouts. Keep design choices and candidate edits.
- Add a summary made from entered job titles, skills and languages. It makes no claims about years, achievements or certificates. Fill an empty profile once when the screen opens. Keep existing words and current edits.
- Version the state inside new private continue links. Old links use the previous state layout. Keep the link encryption format unchanged.
- Add manual, optional PostHog events. No automatic page capture, replay or DOM capture. Send no CV content, contact fields, photos, page URLs or private fragments. Keep Google Analytics unchanged.
- Add a free, optional usage checkbox, hidden while PostHog is disabled. Respect Do Not Track. Errors or missing storage never stop editing or downloads.
- Emit cv_exported only after the existing export succeeds. Keep the existing download events.
- Keep entry buttons disabled until the page attaches their handlers. This prevents a fast tap from being lost during startup. Wait for draft hydration before opening the first form step.

## Release gate: pending

The brief names PostHog organisation Job Strike. The connected account exposes only Inspire Ambitions / Default project, project 253679. Kim must confirm this project or connect the intended organisation. No project events were read and no project configuration was changed.

The adapter remains disabled. Do not merge this step as complete or activate capture until the target, host and public project token have been checked. No public token belongs in chat.

Settings required after target confirmation:

- NEXT_PUBLIC_POSTHOG_ENABLED=true
- NEXT_PUBLIC_POSTHOG_HOST: the confirmed US or EU ingestion host
- NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: the confirmed public project token

Use the existing deployment settings. Do not hard-code credentials in source. Missing settings make capture a no-op.

## Baseline, 6 October 2026

Status: not measured. This is not a zero per cent completion rate.

No Google Analytics reporting connection is available in this session. The PostHog target remains unconfirmed. Existing source also lacked cv_exported and did not consistently emit tool_started for the direct homepage form path. Do not infer a valid historical funnel from those incomplete events.

After activation, record distinct opted-in sessions with full_form_started, then cv_exported within 24 hours. Filter product=cv-builder and measurement_version=1. Record numerator, denominator, date range, project timezone and format. Include returning drafts in the stated cohort. Do not count full_form_completed as a download. That event means the review screen opened.

Only sessions that opted in before opening the form belong in this baseline. The rates describe that cohort, not all visitors. Run alongside GA for 30 days. Record the baseline before switching Talk Mode on by default. Do not invent a rate when the denominator is zero or data is unavailable.

## Evidence

Final local verification on 6 October 2026 passed: full CI, 126 browser tests with 10 intentional skips, two plain-language guard tests, eight email migration scenarios, production build and asset budgets. Lint has zero errors and three existing image warnings. The first-screen sample image now preloads. Lighthouse reported performance 100, accessibility 100, LCP 1,888 ms, CLS 0 and TBT 60 ms. The thresholds remain unchanged. Lighthouse saves its diagnostic report in .lighthouseci/latest-report.json.

These results cover the local release candidate. Hosted checks must finish before merge. Production remains unchanged and the analytics release gate below remains open.

Tests cover every old step index, active draft lists, refresh, old private links, saved design confirmation, generated profile facts and edits, all planned capture events, disabled capture, denied consent, unsupported hosts and transport failures.

360-pixel profile captures use English, Arabic and Urdu settings. Full translation remains step 5. These captures check layout and direction, not completed translation.

The reading-grade check estimates syllables. It is a guardrail, not a validated literacy assessment. Keep reviewing actual questions with candidates later in Phase G.

PostHog, Playwright and project stop-slop guidance informed this step. No Claude or Fable approval is claimed.

Capture API reference: https://posthog.com/docs/api/capture#single-event
