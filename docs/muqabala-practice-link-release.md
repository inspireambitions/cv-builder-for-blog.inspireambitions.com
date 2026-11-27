# One-time Muqabala practice link for the CV Builder

Use the first Muqabala welcome email (W1) as the model for a short introduction and a link to `https://trymuqabala.com/practice`. The download confirmation includes the link only when someone requests it. Do not add offers, tracking parameters, a newsletter subscription or later sends.

The CV Builder never sends the candidate's address or CV to Muqabala for this feature. The existing contact-storage route is separate and unchanged.

## Before enabling

1. Stage the updated WordPress CV email bridge with its existing authentication. Check that the health response has both `ready: true` and `practiceLinkSupported: true`. The provider must be Cloudflare and simulation must be off.
2. Enable `NEXT_PUBLIC_MUQABALA_PRACTICE_LINK=true` in the intended Preview and rebuild. Run the bridge and browser regressions. Keep the Production flag off until the Preview is verified.
3. Use the approved test inbox once. Confirm the message arrives with the correct subject and practice URL, then demonstrate that retrying the same request does not send it again. Provider acceptance is not inbox receipt. Use fictional CV details. Do not enrol the address in the newsletter.
4. Enable in Production only after the hosted check and release approval. If needed, turn the flag off and rebuild. The normal CV confirmation and no-email picture download do not depend on the practice-link option.

## Local checks

- `npm run test:email` exercises the request, acknowledgement and failure paths with fake providers.
- `php -n scripts/test-cv-practice-bridge.php` checks the PHP route using in-memory WordPress stubs. It sends no email.
- Run `tests/muqabala-practice-link.spec.ts` with the Preview flag on. It checks the unchecked default and a working PDF download when the email endpoint is offline.
