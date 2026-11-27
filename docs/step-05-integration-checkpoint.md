# Step 5 translation integration

Read this with the October draft notes in `step-05-progress.md`. The original
translation worktree remains untouched. This branch starts from the shared CV
quality and Talk Mode integration at `b31378e`.

## Integrated here

- Localised Talk Mode headings, progress, navigation and the profile screen.
- Localised Full form education, profile and mobile navigation.
- Added a shared language switcher, a per-language kill switch and an opt-in
  preview switch for incomplete packs. The flag is off by default and ignored
  when Vercel marks a build as production.
- Kept interface preferences separate from CV facts. Previous profile notes stay
  in the draft but do not replace the deterministic profile or block Talk Mode.
- Matched carried-over sentence translations to their exact English sources.
  A new duty cannot pick up a different translation just because it sits in
  the same position in the role library.

## Release gate

This is a checkpoint, not the Step 5 release. Do not merge or deploy it to live.
`npm run audit:translations` reports missing keys and probable visible English
literals. The strict check should stay red until both lists are clear.
Full form work, shared controls, Talk answer choices, photo and download dialogs,
and newer role libraries are still pending. R7 still needs evidence-safe handling
of native-language answers. No AI path should treat a translated sentence as
proof of new facts.

The current audit found 420 possible English literals, 346 missing Arabic
keys and 419 missing keys in each of Hindi, Urdu and Tagalog. Some literals are
brand names or structural false positives. Review the audit site by site;
it does not detect every label assembled from an array or a dynamic key.

Run the English/Arabic/Urdu fixture checks on a local QA build with
`NEXT_PUBLIC_TALK_MODE=true` and `NEXT_PUBLIC_PREVIEW_DRAFT_LOCALES=true`.
The snapshots use fictional details. They prove layout and state behaviour on
the covered screens; they do not prove full or native-reviewed translation.

## 27 November checkpoint

- Mobile and desktop now show city and country on the first personal-details
  screen. Recruiter Check Fix buttons focus the field that needs attention.
  Save can return directly to the check without passing through the other steps.
- Added authored strings for the contact, start, experience, skills, extras,
  design, download and application-preparation screens. Expanded the role
  library translations against exact English source sentences.
- The dictionary audit reports 1,557 English keys and no missing keys in any
  of the four draft languages. The source audit reports no untranslated
  literals in scanned components, including shared controls, and now runs
  in CI. Browser checks cover the highest-traffic paths, but a source scan
  does not establish linguistic accuracy or cover every dynamic label.
- Talk accepts three exact housekeeping statements in Arabic, Hindi, Urdu or
  Tagalog and offers their prewritten English equivalents for confirmation.
  It keeps the original. It rejects unmatched text and makes no AI call for
  non-English input. This does not complete free-text translation (R7).
- Claude Opus 5.5 reviewed the proposed translation safety design without
  candidate data. That review does not verify how the configured production
  rewrite service behaves.

The landing page's gzip budget check passed at 168,061 bytes of initial
JavaScript. The root-level preferences follow the document's language without
loading the larger builder dictionary before the user opens the builder.

Local verification: 23 translation unit tests passed. The browser preview
suite passed 102 checks, skipped 15 by design and timed out once in a check
that reused several pages. Isolated the affected cases by checklist item.
The targeted rerun then passed 21 checks, with the five desktop copies of
the 360 px screenshot checks skipped. Screenshots are under
`outputs/step-05/contact/`.

Removed the old, unreferenced score-email card. The current email and download
flows remain in place. Git retains the removed code.

Keep the draft languages out of production. Do not release Step 5 until the
browser, accessibility and cross-language rewrite gates pass.
