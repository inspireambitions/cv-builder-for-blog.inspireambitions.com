# ATS Clean design QA

**Source visual truth**

- `/workspace/scratch/6eeb5b5c8f95/references/7f965cb4-2ac2-48dc-b4ed-e8ea21aec5f8.png`
- Source pixels: 1308 × 820 at 1×. The first 648 × 820 A4 page was used for the like-for-like layout check.

**Rendered implementation**

- Local Chrome preview: `http://terminal.local:4173/`
- Browser screenshot: `/workspace/scratch/6eeb5b5c8f95/qa-artifacts/ats-clean-browser.png`
- Implementation pixels: 318 × 449 at 1×, representing the live A4 preview at 40% zoom.
- Normalised comparison: `/workspace/scratch/6eeb5b5c8f95/qa-artifacts/ats-clean-comparison.png`, with both pages placed on 648 × 820 white canvases.
- CSS document size: 794 × 1123 pixels.
- State: English, light theme, fictional candidate, ATS Clean selected, photo-free CV.

**Full-view comparison evidence**

- The rendered page keeps the reference structure: centred identity block, compact contact line, single-column content, blue uppercase section labels, thin blue rules, black body copy and no portrait or sidebar.
- Margins, section widths and vertical rhythm remain within the reference proportions after normalisation.
- The source contains enough material for two pages. The fictional browser state contains one shorter page, so page count was not treated as a visual defect.

**Focused region comparison evidence**

- Header alignment was measured in Chrome as `text-align: center`.
- The live document exposed `data-layout="single-column"` and contained zero image elements.
- The name size, contact density, blue heading treatment and rule thickness were readable in the original browser capture, so no extra crop was needed.

**Required fidelity surfaces**

- Fonts and typography: Arial-compatible sans-serif, heavy centred name, compact body text, italic grey dates and uppercase blue labels match the reference hierarchy.
- Spacing and layout rhythm: A4 proportions, narrow page margins, full-width rules and compact section gaps match the reference.
- Colours and tokens: white paper, black copy, grey metadata and `#1155cc` section blue match the source treatment.
- Image quality and assets: the source has no decorative imagery. The implementation adds none and hides candidate photos for this template.
- Copy and content: English labels mirror the source. Candidate content is fictional and intentionally differs from the supplied example.

**Primary interactions tested**

- Started a new CV, completed personal details, summary, work history, education and skills.
- Selected ATS Clean and confirmed the live preview changed to a photo-free single-column document.
- Reached the result page and confirmed the score-based article route and interview-question-bank link were present.

**Console check**

- No application-origin warnings or errors were recorded.
- Chrome reported repeated metadata messages from its own extension; these were outside the application origin.

**Findings**

- No actionable P0, P1 or P2 visual differences.

**Comparison history**

- First pass: no P0, P1 or P2 findings. No visual repair iteration was required.

**Implementation checklist**

- Keep ATS Clean photo-free in HTML, PDF and Word outputs.
- Keep the ten-template selection and saved-draft validation covered by browser tests.
- Run the full Playwright matrix in GitHub Actions before merging.

**Follow-up polish**

- None required for this release.

final result: passed
