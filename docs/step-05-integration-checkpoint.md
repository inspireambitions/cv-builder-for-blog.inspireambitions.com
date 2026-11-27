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
