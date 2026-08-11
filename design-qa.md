# Mobile CV Builder design QA

## Evidence

- Source visual truth: `C:\Users\Kim\.codex\generated_images\019fe25a-5877-7ba3-8555-67fa2a939292\exec-240ca60a-6935-4ab8-b919-5f164eb9f9a0.png`
- Normalised source: `outputs/cv-builder-mobile-audit-2026-08-11/source-normalized-390x844.png`
- Final implementation capture: `outputs/cv-builder-mobile-audit-2026-08-11/implementation-compare-390x844.png`
- Intended content viewport: 390 x 844 CSS pixels.
- Source pixels: 852 x 1846. It was downsampled to 390 x 844 with high-quality bicubic interpolation for a same-size comparison.
- Implementation pixels: 390 x 844 at device scale factor 1. The in-app browser viewport override was 405 x 876 because its visible content area removes 15 x 32 pixels for browser chrome and the scrollbar.
- State: Personal details, page 1 of 3. Name, UAE phone number and email completed. Light theme.
- Browser-rendered evidence: captured from the local production build in the Codex in-app browser.
- Primary interactions checked: start builder, complete and save all three personal-detail pages, open and close preview, move through all eight stages, show every CV design, switch document direction, restore a saved draft, create a private resume link, open download options and export PDF and Word.
- Console check: no warnings or errors in the final comparison state.

## Full-view comparison

The source and implementation were opened together at the same 390 x 844 pixel size. The final build preserves the source hierarchy: compact brand header, labelled language control, plain progress, one clear question, three contact fields, a small live CV preview and a fixed save bar. The layout uses the approved navy, gold, cream and green palette.

The implementation keeps a small `Preview CV` shortcut beside progress. This is an intentional product feature because the builder supports a full document view at every stage. It is secondary, compact and does not compete with `Save and continue`.

## Focused-region comparison

A separate crop was not needed. At 390 x 844, the full-view pair keeps the header, progress, heading, all three field labels, Lucide field icons, live preview header and fixed action bar readable at normal size.

## Required fidelity surfaces

- Fonts and typography: hierarchy, weight and wrapping match the source intent. The build uses the product sans stack for forms and the existing serif only inside the CV preview.
- Spacing and layout rhythm: the final screen removes the earlier tab strip and heavy nested card. Tap targets remain at least 44 pixels high. The compact preview reaches the first viewport without crowding the fields.
- Colours and tokens: navy `#1a2744`, gold `#806017`, green `#2f6b5e`, white and warm off-white map cleanly to the approved visual.
- Image and icon quality: contact, preview, saved-state and navigation icons use the Lucide icon library. No emoji, placeholder artwork or new handcrafted SVG icons were used.
- Copy and content: the main question and supporting sentence match the approved visual. Progress and autosave language use plain British English.
- Accessibility and behaviour: fields have visible labels, mobile keyboards receive suitable input types, focus states are visible, the language control is labelled, and the fixed controls do not cause horizontal overflow.

## Comparison history

### Iteration 1

- [P1] The first implementation added a large Edit and Preview tab strip above the question.
- [P1] The language selector was trapped inside a visually hidden label, so it did not render in the header.
- [P2] The headline and supporting copy drifted from the approved source.
- [P2] Contact fields lacked consistent real icons.

Fixes made:

- Removed the tab strip and kept preview as a small secondary shortcut.
- Separated the hidden label from the visible language select.
- Matched the approved contact question and supporting sentence.
- Added Lucide icons for contact fields, save state and navigation.
- Removed the mobile resume-link control from the header so the language control remains visible.

Post-fix evidence: `outputs/cv-builder-mobile-audit-2026-08-11/implementation-compare-390x844.png`.

### Iteration 2

No actionable P0, P1 or P2 differences remain. The live preview omits the target job title on this first page because the candidate supplies that on page 2. This is intentional data integrity, not a fidelity defect.

## Findings

No actionable P0, P1 or P2 findings remain.

## Follow-up polish

- [P3] Replace the existing CSS diamond brand mark with the official raster or vector brand asset if one is added to the repository.

## Final verification

- Production build: passed.
- Free-product guard: passed.
- Performance budget: passed.
- Automated suite: 52 passed, with 2 mobile duplicates of desktop-only resume-link and export checks intentionally skipped. The mobile flow has its own preview, save, download and overflow coverage.
- Final result: no blocking visual or functional defects found.

final result: passed
