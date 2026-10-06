# CV confirmation email through Cloudflare

Production baseline: 1bc5a49ad31502d48a3b8c764f0ba50b58ad9229, verified on 3 October 2026. No production cutover yet.

The CV app sends its fixed download confirmation through an authenticated WordPress bridge. WordPress uses its saved FluentSMTP Cloudflare connection. The Cloudflare token stays in WordPress. The app continues to save subscriber consent and contact details on Resend. A failed confirmation leaves downloads available and returns the existing warning.

WordPress snippet 349 is active. It accepts site administrators or a dedicated bearer access key. The key starts unset, so unauthenticated requests cannot send mail. WordPress stores a password hash. Its fixed template uses notifications@inspireambitions.com and hello@inspireambitionshq.com. An atomic database record suppresses identical email, name and format requests for 24 hours across app restarts. It holds pending or uncertain sends to prevent repeat delivery, and schedules record expiry. Changing the name or format creates a separate request.

## Private setup

1. Kim creates a random access key of at least 32 characters in a password manager.
2. Kim enters it in WordPress Settings > CV Email Bridge and saves it.
3. Kim enters the same value in Vercel as Secret IA_CV_EMAIL_BRIDGE_SECRET, for Preview and Production, and saves it.
4. Validate the Preview route with a controlled recipient and check inbox headers before the production release.

Leave IA_CV_EMAIL_BRIDGE_URL unset in Vercel. Its default is the production WordPress endpoint. Tests use a loopback mock. The helper restricts destinations to inspireambitions.com or 127.0.0.1.

## Verification

- An authenticated admin test reached the owner's Gmail inbox through Cloudflare. SPF, DKIM and DMARC passed.
- The repeated request returned sent: true, deduped: true; Gmail showed one confirmation.
- The authenticated readiness probe returned ready: true.
- Eight local API scenarios cover the bridge, subscriber storage, HTTP 429, timeout, rejection, pending duplicate, missing configuration, contact-service failure and invalid input.
- Backend resilience mocks now use the authenticated bridge. Lint, type checking, production build and targeted API tests must pass for the final source before release.

Rollback: restore the previous Vercel deployment. Preserve Resend credentials and sending DNS.