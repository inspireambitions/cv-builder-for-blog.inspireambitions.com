# CV battleplan step 1, 6 October 2026

Read brief 07 in full from the supplied local attachment and GitHub ref, and brief 06 in full from GitHub. Baseline: main 1bc5a49. Work uses an isolated checkout and preserves existing local edits.

## Part 0 verification

The baseline contains CVState, role-suggestions, evidence checks, deterministic Gulf matching, template recommendations, PhotoEditor and all three export pipelines. TEMPLATE_INFO contains ten designs. The interface exposes five languages; Hindi, Urdu and Tagalog still inherit English fallback keys. Arabic document labels exist. PDF uses jsPDF text without an Arabic font, and Word has no complete RTL export handling. These remain step 8 work.

The email unlock and ungated JPEG path exist in DownloadModal. Trustpilot, why-free and comparison routes exist. Design tokens, dark theme, performance budget, Lighthouse and Playwright gates exist. Analytics uses GA, and the mobile preview switch lacks the requested three modes. Talk Mode, full translation, matching extraction and the new landing pages remain later steps. Nothing from these existing features was rebuilt.

## Branch review

- agent/photo-workflow: PhotoEditor, photo-quality and photo-workflow test files match main. Remaining differences are older baseline changes, not missing photo work.
- agent/photo-template-labels: its label patch is patch-equivalent to main. Remaining StepTemplate difference would remove the newer ATS Clean label.
- codex/ats-clean-results-journey: tree matches main exactly.
- codex/tool-growth-2026-08-14: preserved. Its removal of scoreBand from analytics and score-screen events is unique. Deleting it would violate R0's prerequisite. Evaluate this privacy change during step 3 analytics work.

## Email review

Integrated the 3 October branch, including its two commits and API mocks. The app uses the authenticated WordPress bridge for fixed confirmations and keeps subscriber capture. Failed mail or subscriber capture cannot deny a valid request its downloads. Added a subscriber request timeout and made the migration scenarios part of CI. No download UI or export code changed.

Email integration tests use fictional addresses and mock services. No test sends real mail. Missing bridge settings prevent confirmation delivery; they do not block downloads.

## Release source

Vercel project prj_AIfXZRQO63nPlcque7QQzpO4EO44, account team_IlZz8UvetUXPtSvI4hPqy6fn (INSPIRE, inspire14), owns cv.inspireambitions.com. Verified through the project connector and public response headers. IA_CV_EMAIL_BRIDGE_SECRET exists as a sensitive setting for Preview and Production; only metadata was checked. This proves configuration presence, not delivery. Production cutover requires controlled delivery verification. Do not describe local or CI results as production delivery evidence.

## Acceptance scope

Step 1 covers email resilience, valid and invalid input, subscriber preservation, confirmation authentication, service failure, missing configuration, unchanged ungated picture access, and 360 px English/Arabic/Urdu screenshots. Full translations, plain-language crawl and Talk Mode tests belong to their stated later steps. Screenshots record current translation gaps rather than claiming translation completeness.
