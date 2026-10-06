# Step 2: usability repairs

Scope: brief 07 Section 5 step 2, Phase A and B1, B3, B4, B6. Baseline main: 8c38d6ce75652bb8b2ca6e96ef29d91e7c12da80. No Talk Mode, payment, JobStrike bridge or new email integration.

## Changes

- Hide mobile save notices and the in-form mobile theme control. Keep the saved-device line and desktop icon control.
- Reduce the in-form footer to one tools link. Preserve the start-screen footer.
- Show missing name, contact or job details before claiming a CV is ready. Each missing item opens its form. Keep downloads available.
- Keep the brand left-to-right and mirror navigation arrows in right-to-left interfaces.
- Replace homepage placeholder bars with a 51 KB fictional Service CV image from the existing renderer.
- Use plain download, summary, job-match and device-link wording. Remove provider identifiers from job-match results and errors.
- Reuse the existing role families for work, education and skill examples.
- Add month/year fields and a current-job switch. Preserve legacy export text and unparseable saved dates.
- Keep job matching closed initially, below the download section.

## Verification

Regression coverage includes all missing-item links, contact alternatives, legacy dates, date persistence, all eight mobile save notices, role examples, the fictional homepage image and widths from 320 to 3840 pixels. Capture review and work-history screens at 360 pixels in English, Arabic and Urdu.

Full interface translation remains step 5. These captures check the current language setting and direction, not complete translated content. Existing export functions, scoring weights and state version remain unchanged.

Claude CLI is logged out. No Claude or Fable approval is claimed. The independent review prompt is saved separately. Installed frontend-design, Impeccable hardening and Playwright guidance informed the narrow repairs and checks.

The existing Lighthouse thresholds, free-product guard, email migration scenarios and complete browser suite remain release gates. No real candidate details or external email sends are used in tests.
