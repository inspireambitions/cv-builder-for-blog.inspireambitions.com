# Inspire Ambitions Dubai CV Builder Discovery

Date: 2026-05-09
Branch: codex/discovery

## Stack

- Next.js 15 App Router with React 19 and TypeScript.
- Styling is Tailwind utility classes in React components plus `app/globals.css`.
- CV state is client-side React context in `lib/state.ts`.
- Existing export dependencies include `jspdf`, `html2canvas`, `docx`, and `file-saver`.
- AI upload/improve endpoints live under `app/api/*`.

## Export Pipeline

- JPEG export lives in `lib/export-jpeg.ts` and captures `#cv-render` with `html2canvas`.
- Current PDF export lives in `lib/export-pdf.ts` and also captures `#cv-render` as a JPEG before placing it into jsPDF. This makes the PDF image-based and not ATS-safe.
- Word export lives in `lib/export-word.ts` and already uses the `docx` package to create a text-based `.docx`.
- Download UI lives in `components/modals/DownloadModal.tsx`; currently downloads are gated behind an email unlock and JPEG is shown before PDF/DOCX.

## Section Schema

- Main CV shape is defined in `lib/types.ts`.
- `CVState.personal` currently contains `name`, `title`, `email`, `phone`, `location`, and `linkedin`.
- `defaultCVState` is also in `lib/types.ts`.
- Step UI for personal details lives in `components/steps/StepPersonal.tsx`.

## i18n Layer

- Locale context lives in `lib/locale.ts`.
- Translation strings live in `lib/i18n.ts`.
- `components/CVBuilder.tsx` syncs `document.documentElement.dir` and `lang` based on the selected locale.
- Arabic support currently affects UI direction; export and preview templates still need true RTL coverage in a later phase.

## Templates

- Template rendering is registered in `components/CVBuilder.tsx`.
- Template choices on the start page are registered in `components/steps/StepStart.tsx`.
- Current templates are:
  - `components/templates/Corporate.tsx`
  - `components/templates/Minimal.tsx`
  - `components/templates/Gulf.tsx`
  - `components/templates/Creative.tsx`

## Existing Tests And CI

- No unit or e2e test files are present.
- CI currently contains `.github/workflows/check-backticks.yml`, which checks for corrupted backtick patterns in JS/TS files.
- Validation for this P0 pass must rely on TypeScript/build checks and manual browser/export QA unless tests are added in a later phase.
