# Independent review request

Review this step 3 branch against briefs 07 and 06. Do not build step 4.

The change moves the Full form profile after skills. Saved draft version 8 maps older sections through both prior layouts. Older private continue links lack stateVersion and use the previous layout. New links include stateVersion while keeping the encryption format unchanged. Template confirmation still uses its original version 7 boundary.

An empty profile uses only entered titles, skills and languages. Existing summaries and current edits stay intact. No AI call runs for this default.

The AST wording guard checks visible copy, glossary terms and model names. Future Talk Mode questions get word-count and estimated reading-grade checks. Server prompts and identifiers are not interface copy.

The manual PostHog adapter remains off. It accepts only named usage events and approved properties, strips unrelated fields, uses optional consent and a random tab-session ID, and never sends CV content, contacts or private links. It does not load an SDK, replay or automatic page tracking. Existing GA remains unchanged.

The intended PostHog organisation is not connected. Only Inspire Ambitions / Default project is visible. Kim has not yet confirmed that target. No historical completion rate has been measured. The PR must stay in draft until these gaps are resolved.

Check lib/state.ts, lib/step-layout.ts, lib/resume-link.ts, lib/plain-summary.ts, lib/measurement.ts, components/shared/UsagePreference.tsx, components/CVBuilder.tsx and the new tests.

Give concrete blockers with file locations. Check migration idempotence, template confirmation, summary edits, consent withdrawal, event duplication, privacy, reading-grade false positives and the baseline cohort definition. Separate proved defects from assumptions. Do not call the incomplete analytics gate approved.

Access check on 6 October 2026: Claude CLI reports loggedIn=false. No Claude or Fable review has happened.
