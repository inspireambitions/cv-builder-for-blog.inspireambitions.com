# Step 5 checkpoint: 7 October 2026

Status: in progress. No release or production deployment.

Source: `codex/cv-battleplan-step-05`, based on Step 4 commit
`4a577bbd5722831d4bdd4af25530bc72d1f1e525`. GitHub PR 12 remained open and
unmerged when checked. Keep Step 5 separate. Do not merge Step 4 into Production
to prepare this work.

## Work completed locally

- Added authored-key coverage checks. English fallback cannot fill missing locale keys.
- Added the `NEXT_PUBLIC_HIDDEN_LANGUAGES` filter. English remains the recovery language.
- Shared one language-option list between the header and Talk Mode.
- Added first-pass translations of the 24 question headings, progress, navigation,
  saved-state messages and validation errors in Arabic, Hindi, Urdu and Filipino.
- Marked these translations as machine-translated. Native-speaker review remains pending.
- Isolated interpolated progress numbers for right-to-left text.
- Kept interface language separate from `cvLanguage` and saved CV fields.

## Verified at this checkpoint

- `npm ci --no-audit --no-fund`: passed. No dependency upgrade.
- Nine locale and scanner unit tests: passed outside the Windows process sandbox.
- `npx tsc --noEmit`: passed.
- Lint: zero errors, three existing image warnings.
- Free-product guard: passed across 96 source files.
- Plain-language guard and its two unit tests: passed.

The first sandboxed Node test calls failed with `spawn EPERM`. The authorised
unsandboxed runs passed. This was a test-runner restriction, not an application result.

## Remaining scope

The current scan has 171 source keys. Arabic has those keys, but key coverage alone
does not establish full interface translation. Hindi, Urdu and Filipino each lack
101 existing keys. The source scan still flags 514 possible hardcoded English UI
sites. Review those sites, including brand and candidate-data exceptions, and move
UI copy to keys. Do not describe the scanner as an exhaustive detector: it does
not yet trace indirect option arrays or imported labels.

Finish the Full form, Talk answer options, PhotoEditor, download and review
dialogs, and application-preparation screens. Localise examples while keeping
canonical CV data stable. Remove the translated draft banner after completion.

Implement and test R7 native-language input with English or Arabic CV output.
The existing lexical evidence guard cannot prove a cross-language translation.
Do not bypass it by treating an unchecked translation as verified source evidence.
Preserve number context, negation, employers, dates, credentials, candidate review
and the offline sentence-library and deterministic-summary paths.

Wire the strict translation check into both CI jobs only after completing the
packs and source changes. Update Step 4 language expectations. Add Step 5 tests
for locale availability, kill switch, RTL, native input, canonical data and offline
exports. Capture all Talk screens at 360px in English, Arabic and Urdu. Run the
full browser, build, performance and Lighthouse checks before creating the Step 5
release PR. Do not advance to Step 6.

No new browser screenshots, build, Lighthouse, hosted CI or live-provider result
exists for this checkpoint. The previous Step 4 results do not verify these changes.

## Independent review

Claude CLI reports signed out. No Claude or Fable review occurred. The configured
Gemini wrapper returned HTTP 429 on the authorised network run. Do not claim an
independent review or retry by extracting credentials.

Suggested review prompt when access returns:

Review the five-language CV Builder localisation. Check authored-key coverage,
the hidden-language setting, RTL progress and canonical CV option values. Propose
a narrow translation validation path for native-language input to English or
Arabic. The current evidence guard checks content order, number neighbours and
negation in one language. State what deterministic checks can prove and what they
cannot. Preserve candidate approval and offline fallback. Reject invented
employers, dates, certificates, metrics and achievements. Do not claim that an
AI verifier guarantees factual accuracy. No candidate data or secrets are needed.
