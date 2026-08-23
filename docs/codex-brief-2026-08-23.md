# Codex brief — verified gaps, 2026-08-23

Audit of `main` @ `1bc5a49`. Every item below was verified by reading the code,
not inferred. Each has the evidence, the fix, and a done-when.

**Rule for this brief:** items in sections A–D are defects — the code contradicts
something the product already promises. Section E is a product decision and needs
a human answer before any code is written.

**Must stay green:** `npm run ci` = `check:free && build && check:perf && test:e2e && test:lighthouse`.
`scripts/check-free-product.mjs` fails the build on any Stripe/checkout/payment
token in `app/`, `components/`, `lib/`. Do not add payment code.

---

## A. Broken promises to users — P0

### A1. The language selector offers 5 languages and delivers ~1.5

- **Evidence:** `lib/i18n.ts` defines 126 keys. Only **19** are referenced by any
  component. `components/shared/LanguageToggle.tsx` offers en / ar / hi / ur / tl.
  `tests/templates-i18n.spec.ts:16` asserts "all ten templates and five UI
  languages are available" — it only counts `<option>` elements, so it passes
  while the UI stays English.
- **Measured coverage of the 19 strings the UI actually renders:**
  en 19/19 · ar 19/19 · hi 12/19 · ur 12/19 · tl 12/19.
  The 19 are: header tagline, the 8 step labels, 6 personal-details field labels,
  3 nav buttons. Everything else — every step body, tip, score page, download
  modal — is hardcoded English.
- **Why it matters:** a user picks اردو, the chrome flips, the work stays English.
  That is worse than not offering the language.
- **Fix — pick one, do not half-do it:**
  - (a) Wire the remaining 107 keys through `t()` in the step components, and
    fill hi/ur/tl to parity; or
  - (b) Reduce `OPTIONS` to `en` + `ar` and ship the rest when translated.
  - Then make the test assert *rendered text*, not option count.
- **Done when:** switching locale changes the visible body copy of at least the
  personal, summary, experience, education, skills and score steps — and the test
  fails if it does not.

### A2. Arabic Word export is broken

- **Evidence:** `lib/export-word.ts` has zero `rtl` / `bidi` / `rightToLeft`
  occurrences and hardcodes `font: "Calibri"` (`:84`, `:95`). `docx` needs
  `bidirectional: true` on paragraphs and an Arabic-capable font.
- **Why it matters:** Arabic CV mode is offered and the .docx comes out
  mis-ordered in Word. `export-pdf.ts` and `export-jpeg.ts` have the same zero
  RTL count — they capture the DOM, so they inherit `dir` from the template, but
  this needs a visual check, not an assumption.
- **Fix:** set `bidirectional` on paragraphs and switch to Tahoma/Arial when
  `state.cvLanguage === "ar"`, mirroring `ATSCleanTemplate.tsx:62`.
- **Done when:** an Arabic CV exported to .docx opens right-aligned and correctly
  ordered, with an e2e assertion covering it.

---

## B. Dead code that is still being maintained — P1

### B1. Four template files are unreachable, and two were edited last week

- **Evidence:** `components/CVBuilder.tsx:54-55` renders only `ATSCleanTemplate`
  and `SectorTemplate`. `Corporate.tsx`, `Creative.tsx`, `Gulf.tsx`,
  `Minimal.tsx` have **zero** import references anywhere in `app/`,
  `components/`, `lib/`.
- **Cost already paid:** `git log` shows `Creative.tsx` and `Gulf.tsx` were both
  modified on 2026-08-14 in "Add guided GCC CV photo workflow" — engineering time
  spent on files that never render.
- **Fix:** delete all four. The ten user-facing designs come from
  `SectorTemplate` + `lib/template-config.ts`, which is unaffected.
  `TemplatePreview.tsx` is live (used by `StepStart`, `StepTemplate`) — keep it.
- **Done when:** the four files are gone and `npm run ci` is green.

### B2. Three AI endpoints are built and unreachable

- **Evidence:** zero references outside their own route files:
  - `app/api/mock-interview/route.ts`
  - `app/api/cover-letter/route.ts`
  - `app/api/ai-roast/route.ts`
- `lib/i18n.ts:137-138` and `:315-316` already ship English **and Arabic** UI
  strings for the mock interview. Someone built the endpoint, wrote the copy,
  translated it, and never added the button.
- **Fix:** wire them into `StepScore` (see D1 first for mock-interview), or delete
  them. Do not leave them shipped-but-dark — they are public unauthenticated
  routes that spend model tokens.
- **Done when:** each route is either reachable from the UI with a test, or removed.

### B3. Payment leftovers contradict the free-product guarantee

- **Evidence:** `lib/constants.ts:45` defines `PRICES` ($5 PDF, $5 Word, $2 cover
  letter, $2 roast credit, $86.40/yr) and it is **referenced nowhere**.
  `lib/i18n.ts` still carries `download.payDownload` and `download.annualUpsell`.
  Meanwhile `app/why-free/page.tsx` states "The builder has no paid tier. It asks
  for no card," and `scripts/check-free-product.mjs` fails CI on payment code.
- **Why it matters:** this is the single artefact that makes a reader think the
  tool costs money. It already caused exactly that misreading in stakeholder
  feedback this week.
- **Fix:** delete `PRICES` and the two paid-tier i18n keys.
- **Done when:** `grep -rn "PRICES\|payDownload\|annualUpsell" lib app components`
  returns nothing.

### B4. Orphan schema

- **Evidence:** `schemas/uae-cv.json` has no references anywhere in the repo.
- **Fix:** delete, or document why it is kept.

---

## C. "Make it international" — the two real blockers — P0

The positioning ask is mostly copy, but two pieces of *logic* actively break for
non-Gulf users today. Do these before touching any marketing copy.

### C1. Scoring is geo-blind — global users are penalised for not being Gulf

- **Evidence:** `lib/score.ts` contains **no reference to `geo`**. Its
  `gulfSpecificLayer` (`:223`) is worth **25 of 100 points**: visa & notice (6,
  `:183`), Arabic language (4, `:192`), driving licence (4, `:199`), GCC
  certifications (5, `:202`), Gulf market fit (6, `:211`).
- Geo detection already exists and is already consumed elsewhere:
  `lib/geo.ts` returns `"gulf" | "global"`; `StepStart.tsx:332`,
  `StepScore.tsx:146`, `EmailCapture.tsx:20` all branch on it.
- **Effect today:** a London candidate with a perfect CV is capped near 75/100 and
  is told to "add Emiratisation keywords" and "mention your UAE driving licence."
- **Fix:** make the fourth layer region-selected. Keep `gulfSpecificLayer` for
  `geo === "gulf"`; add an equivalent 25-point layer for `global` (right-to-work
  statement, notice period, no photo, no DOB/marital status, local
  certifications). Same shape, same weight — swap the contents, do not delete the
  layer.
- **Done when:** the same CV scored under `gulf` and `global` produces different
  criteria labels and neither is capped at 75.

### C2. Photo logic is geo-blind — this one is a liability, not a nit

- **Evidence:** no `geo` reference in `lib/template-config.ts`,
  `components/shared/PhotoEditor.tsx`, or `lib/photo-quality.ts`.
  `template-config.ts:17` sets the hospitality template (`service`) to
  `photo: "prominent"`; `crew` (`:21`) is also `prominent`.
- **Why it matters:** Gulf CVs conventionally carry a photo. US, UK and Canadian
  employers routinely **discard** CVs with photos for discrimination-liability
  reasons. Shipping "international" while defaulting hospitality candidates to a
  prominent portrait actively harms the users it is meant to serve.
- **Fix:** gate the `photo` field by geo — `prominent`/`optional` resolve to
  `hidden` when `geo === "global"`, with an explicit override and a one-line
  explanation of why.
- **Done when:** selecting a global region drops the photo from the preview, the
  PDF and the Word output, and the UI says why.

### C3. Positioning copy contradicts itself

- **Evidence:** `app/page.tsx:42` H1 = "Build a stronger GCC CV for free";
  `app/layout.tsx:18` meta description = "for GCC and international job
  applications." `lib/constants.ts` names a template "Classic GCC".
- **Fix:** land this **after** C1 and C2. Copy that promises international support
  the logic does not deliver is worse than honest Gulf-only copy.
- **Note for the human:** the strategic risk is deleting the Gulf specificity
  rather than regionalising it. Multi-regional (Gulf rules for Gulf, UK rules for
  UK) keeps the differentiator; region-neutral turns this into a generic builder
  competing with Canva and Zety.

---

## D. Interview depth — P1

### D1. The "5 questions" limit is one hardcoded string, and the two interview features disagree

- **Evidence:**
  - `app/api/mock-interview/route.ts:10-11` system prompt: *"After 5 questions,
    provide a brief summary…"* — this is the 5 that was reported.
  - `app/api/application-pack/route.ts:66` asks for **10** interview questions +
    5 STAR prompts, and `:40` **throws** if the count is not exactly 10:
    `if (pack.interviewQuestions.length !== 10 || pack.starPrompts.length !== 5)`.
- **Fix:**
  1. Make the mock-interview question count a request parameter with a sane
     default (15–20), not a magic number in a prompt string.
  2. Add adaptive follow-ups — probe a weak or unevidenced answer instead of
     advancing. Question *count* is not the real complaint; a longer shallow list
     does not fix it.
  3. Relax the `application-pack` validation to a **minimum** (`< 10`), otherwise
     any expansion throws a 500.
  4. Wire the UI (B2) using the `score.mockInterview*` strings that already exist
     in en and ar.
- **Done when:** a mock interview runs past 5 questions, asks at least one
  follow-up grounded in a prior answer, and is reachable from `StepScore`.

---

## E. Needs a human decision before code — do not implement unprompted

### E1. Coaching / progress surfaces

Two asks came from stakeholder feedback and are **not** defects:

- **In-app coaching option.** The app already hands off to the human brand —
  `StepScore.tsx:131` and `:228` link to `inspireambitions.com/interview-prep/`
  and the external question bank; `EmailCapture.tsx:93` does the same by email.
  What does not exist is a coaching CTA or booking surface inside the product.
  Needs a decision on offer, price and delivery before anything is built —
  and note the free-product CI guard blocks in-app payment by design.
- **"People need to see progress."** `components/tailoring/OutcomeFeedback.tsx`
  already captures Applied / Interview / No response / Rejected / Offer, but
  writes to `localStorage` only (`:14-16`, capped at 50 entries) and never renders
  the history back. Progress is therefore device-bound, invisible, and lost on a
  browser clear. Turning this into a real progress view is the smallest credible
  answer to that ask — but it implies accounts or a server store, which is a
  product decision, not a bug fix.

---

## Suggested order

1. **B3** — delete `PRICES` (minutes, removes an active misunderstanding).
2. **B1, B4** — delete dead templates and schema (stops wasted maintenance).
3. **C1, C2** — geo-aware scoring and photo gating (unblocks "international").
4. **A1** — decide and execute on languages (stop over-promising).
5. **D1 + B2** — fix and ship the mock interview.
6. **A2** — Arabic Word export.
7. **E** — after a human decision.

## Verification commands used

```
grep -rn "geo" lib/score.ts                       # -> no matches (C1)
grep -rn "geo" lib/template-config.ts \
  components/shared/PhotoEditor.tsx lib/photo-quality.ts   # -> no matches (C2)
grep -rl "templates/Gulf\"" app components lib    # -> no matches (B1)
grep -rn "PRICES" app components lib              # -> definition only (B3)
grep -rn "mock-interview" app components lib      # -> route file only (B2)
grep -ci "rtl" lib/export-word.ts                 # -> 0 (A2)
```
