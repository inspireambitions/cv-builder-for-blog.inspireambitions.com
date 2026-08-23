# Interview report unlock — build spec (v2, post-review)

Branch: `claude/gulf-hospitality-video-interview-q7nrxl`

> **v2 supersedes v1 entirely.** Five specialist reviews (security, privacy,
> growth, Next.js architecture, i18n/a11y) found three false claims, one internal
> contradiction and two unfalsifiable acceptance criteria in v1. Every correction
> below was verified against the source before being written here. If you have
> v1, discard it.

---

## 0. The decision v1 got wrong

v1 forbade a datastore and tried to build the feature out of stateless HMAC
tokens and fragment-encrypted URLs. That single constraint generated almost every
defect the reviews found:

| v1 claim | Why it fails |
|---|---|
| "Cap code attempts at 5 per token" | Stateless tokens have nowhere to count. The attacker replays the original token; the counter is frozen at 0. The cap is not weak, it is **zero** — ~45% brute-force success per code at 500 req/s over the 15-minute TTL. |
| "Saved report link 90 days" | A self-contained fragment URL never reaches a server. Nothing can expire it, and nothing can revoke it — so there is also no erasure path. |
| "The server never sees the key" | True for a link the user copies. False for a link **we email**: the client must POST the whole URL, key included, to send it. Key and ciphertext then sit together in our logs, Resend's retention and the mailbox forever. |

Measured payload sizes for the fragment link, using the exact encoding in
`lib/resume-link.ts` (JSON → AES-GCM → base64url, no compression):

| Report | JSON | Resulting URL | Gzipped first |
|---|---|---|---|
| EN, 15 questions | 29 KB | **38 KB** | 9.3 KB |
| EN, 20 questions | 38 KB | **50 KB** | 11.8 KB |
| **AR, 18 questions** | 51 KB | **68 KB** | 10.8 KB |

Arabic doubles the byte cost and Arabic is a stated requirement. A 40–70 KB href
does not survive Safe Links rewriting, quoted-printable wrapping, or mobile mail
clients that stop linkifying long before that.

**Conclusion: this feature needs a small datastore.** One decision resolves
attempt-capping, link expiry, revocation, GDPR erasure, cross-device access and
report persistence simultaneously. Continuing to avoid it produces a feature
whose security control does not exist and whose privacy promises cannot be kept.

`scripts/check-free-product.mjs` forbids **payment** code, not storage. There is
no product rule against a database — that constraint was invented in v1.

---

## 1. Prerequisite: there is no interview to report on

`app/api/mock-interview/route.ts` is referenced by **zero** client code. Beyond
being unwired, it cannot produce this report:

- `:11` — prompt hardcodes *"After 5 questions"*, not 15–20.
- `:46` — returns `{ reply: <free text> }`. No JSON schema, no per-question score,
  no severity flag. The preview/full split needs all three.
- `:8` — `force-dynamic` with **no `maxDuration`**, while `application-pack`
  declares 90s and `tailor` declares 300s. A 20-question generation times out.

**Build the interview first.** It is the product; the gate is the last 10%.

---

## 2. Honest scope

v1 was pitched as buildable today. It is not.

| Work | Estimate |
|---|---|
| Wire the interview + restructure the route for validated 15–20 question JSON | 3–5 days |
| Datastore + schema + the gate itself | 2 days |
| Signed report envelope so preview and unlock agree | 1 day |
| Fork the Resend path so unverified addresses never reach the audience | 0.5 day |
| i18n retrofit of `StepScore` + Arabic copy + the SSR `dir` bug | 1–1.5 days |
| Acceptance criteria as Playwright tests across both viewports, CI green | 1.5–2 days |

**Realistic total: 8–11 engineer-days.**

### What genuinely ships today

1. Fix `app/api/email-results/route.ts` — see §3. Do this first, regardless.
2. Ship a `/privacy` page and link it from every email field.
3. Start the interview restructure.

Nothing user-facing in this spec ships today. Say so rather than shipping a gate
whose only security control is imaginary.

---

## 3. Fix before adding another mail path — `/api/email-results` is an open relay

`app/api/email-results/route.ts` is unauthenticated, unrate-limited, has no origin
check, validates with `email.includes("@")`, and relays caller-supplied `subject`
and `content` to `inspireambitions.com/wp-admin/admin-ajax.php` for delivery.

**Anyone on the internet can send arbitrary HTML to any address from your
domain.** This is live. It will burn the sending domain before the new gate ever
does, and it takes every transactional email — including this feature's codes —
down with it.

Require: signed short-TTL challenge, server-side validation, content size cap,
and server-side templating rather than caller-supplied HTML.

Two related live problems:

- **Unverified addresses already enter the marketing segment.**
  `components/modals/DownloadModal.tsx` unlocks on email with no verification and
  `app/api/subscribe/route.ts:112` creates the contact with `unsubscribed: false`
  and the segment id — *before* `:144` sends a marketing-flavoured welcome email.
- **`app/api/handoff/verify/route.ts:31`** — `payload.exp < now` is `false` when
  `exp` is absent, so a token with no `exp` **never expires**. Fix before copying
  the pattern. Require `Number.isFinite(payload.exp)`.
- **`app/api/tailor/route.ts:14-22`** keys its rate limiter on
  `cvData.personal.email` — an attacker-controlled body field — in a per-isolate
  `Map`. Do not copy this limiter.

---

## 4. Architecture

### Datastore

Anything with atomic increment and TTL. Vercel KV, Upstash, or the Supabase
project already connected to this account. Records needed:

- `report:{id}` — the generated report, TTL 90 days, deletable.
- `challenge:{id}` — email, code hash, `attempts`, `exp`. **Server-side attempt
  counter, capped at 5.** This is the control that did not exist in v1.

### Generate once, gate the reveal

v1 had the client POST the transcript twice — once for preview, once unlocked.
Those are two independent LLM calls that **will not agree**: different scores,
headings that do not match the bodies beneath them.

Instead: generate once, persist, return a preview projection plus a server-signed
envelope id. Unlocking exchanges the id for the withheld fields. One generation,
one truth.

### Locked content must not reach the client

Two reviewers reached this from opposite directions — security called CSS blur a
decorative speed bump; accessibility found that blurred text is still read by
screen readers, Reader Mode, find-in-page and browser translate. **Same defect.**
Blind users would receive the gated content that sighted users cannot see.

So: locked cards contain **no answer text at all** — real heading, severity,
skeleton bars, `aria-label="Locked — unlock to read"`. Never `aria-hidden` on a
blurred card: that hides it from assistive tech while leaving it in the DOM,
fixing nothing and adding a WCAG failure.

Note the gate is lead capture, not access control: the credential is "any valid
email string". Call it that. Also close the sibling bypass — `/api/mock-interview`
can still be replayed for equivalent feedback with no email.

### What to reuse, accurately

- `app/api/handoff/verify/route.ts:23-28` — the HMAC + `timingSafeEqual` pattern
  is genuinely copyable. But there is **no signing route** in this repo; only the
  verify half exists. Do not add a JWT library.
- **Use a separate `REPORT_TOKEN_SECRET`.** Reusing `HANDOFF_SECRET` would let
  anyone holding the risk-calculator's secret mint "email X is verified" tokens.
  Add a mandatory `typ` claim checked before any other field — the existing MAC
  covers no type or audience, so tokens are interchangeable between purposes.
  Register the new var in `playwright.config.ts:28-35` or e2e 503s.
- `lib/resume-link.ts` is **not** reusable as-is. It is `CVState`-typed at six
  points (`:3`, `:9-13`, `:45`, `:52`, `:84`) and `:52` spreads state and nulls
  `score` — name a report field `score` and it silently vanishes. `:91-94` wipes
  the entire hash, and `lib/state.ts:204-240` reads resume hashes on every mount,
  so a `#report=` link collides. Generic-ing it is ~20 lines; v1 billed it as zero.
- **Do not send the code through `/api/subscribe`.** It creates the contact
  unconditionally before sending, which breaks the consent rule in §6.

### Where the report lives before unlock

`lib/state.ts:108` and `:136` strip derived AI output on **every** hydrate and
**every** save — a deliberate standing policy, which is why `StepScore.tsx:125`
recomputes the score each render. So the report cannot go in `CVState`, and a
reload at the preview state would destroy the transcript the user spent 20
minutes producing. Persist server-side at generation; key the client to the
report id in `sessionStorage`.

---

## 5. Product design

### Do not ask people who already gave you their email

`DownloadModal.tsx:23` persists `ia-cv-download-email-unlocked`;
`EmailCapture.tsx:8` persists `ia-email-subscribed`. Anyone arriving from the CV
builder has already paid this toll — the report would be the **third** ask on one
journey. If either key is set, skip the gate entirely and show
*"sent to j•••@gmail.com — not you?"* Ten lines, and the largest conversion win
available.

### Gate the prescription, not the diagnosis

v1's "first 2 questions free" breaks as the interview grows: 2-of-5 gives away
the report, 2-of-20 reads as bait. Instead show **every** question, **every**
rating and the full score, and gate the *model answer* — what to say instead.
Immune to question count, unambiguously the valuable thing, and it maps exactly
onto what the founder sells.

### Copy

Do **not** ship *"3 of your answers would cost you the offer."* The model cannot
know that; `StepScore.tsx:180` already refuses that register; and it fails this
spec's own rule that no copy may claim what the build does not deliver. Fear
without a visible remedy produces closed tabs.

Champion: **"You're 3 answers away from a strong interview. Unlock the fixes."**

### Coaching CTA

The report is the highest-intent moment in the product and v1 spent it on list
mechanics. Place the CTA **inline, under the single worst answer** — not in a
footer — and again in the saved-report email. Off-site booking link only; the
free-product guard forbids in-app checkout. Lead with a free 15-minute review.

---

## 6. Consent

**Verification is not consent.** Typing a code proves mailbox control, not
agreement to marketing. Bundling them is the same error §7 forbids for history
consent. Require a **separate unticked checkbox** beside the code entry; only
that flag creates a marketing contact.

Give the report an email-free escape hatch — *"See the report now without an
email — view only, nothing saved or sent."* `DownloadModal.tsx:257` already does
this for downloads. It also resolves the GDPR conditionality problem: the email
then buys delivery and persistence, which are genuine separate benefits.

**Ship a `/privacy` page.** There is none in this repo — no route, no footer link,
no link near any email field. Required at the point of collection.

Correct the v1 line *"We never sell it or share it"* — transcripts already go to
Anthropic, email to Resend, hosting to Vercel. Use: *"We never sell your data. We
share it only with the service providers listed in our privacy notice."* And
disclose plainly: **"Your answers are sent to an AI provider to generate the
feedback."**

### History opt-in

Benefit-first, with an equally weighted decline:

> **Keep your practice history?**
> See how your answers improve each time you practise, and spot the questions
> that keep catching you out.
> You can delete your history at any time.
> `[ Keep my history ]  [ No thanks ]`

Rules: "No thanks" is a real equally weighted button; declining costs nothing
already held; **every benefit named must actually be delivered** — if the
improvement view is not built, that sentence does not ship; delete must genuinely
delete; never bundle with marketing consent; no pre-ticked boxes.

---

## 7. Non-negotiables

- Attempt cap enforced **server-side** in the datastore, 5 attempts, surfaced to
  the user. Code TTL 15 min; report TTL 90 days, both enforced server-side.
- Separate `REPORT_TOKEN_SECRET` + mandatory `typ` claim + `Number.isFinite(exp)`.
- Rate limit by IP at a real chokepoint. A signed challenge is **not** a rate
  limit — anyone can request unlimited fresh challenges.
- Cap input size on `/api/mock-interview` and the report route. Both are
  unauthenticated Anthropic proxies today with no size limit.
- Bind the code to the email inside the signed payload. Compare with
  `timingSafeEqual`.
- Normalise **Eastern Arabic (U+0660–0669) and Persian/Urdu (U+06F0–06F9)
  numerals** to ASCII, client **and** server. There is no numeral handling
  anywhere in this repo today; without it an Arabic user's correct code is
  rejected as invalid.
- One code input with `dir="ltr"`, `inputMode="numeric"`,
  `autocomplete="one-time-code"`, a visible label. Not six boxes — they mirror in
  RTL so box 1 lands on the right.
- Emails need `lang`/`dir` and Arabic copy. `DownloadModal.tsx:77` already sends
  `uiLang` and the subscribe route ignores it — use it.
- Wrap numeric runs (`72/100`) in `dir="ltr"` isolates.
- On unlock: move focus to the revealed heading; announce via a `role="status"`
  region already present in the DOM.
- The secret-link warning must exist in Arabic: *"Anyone with this link can open
  your report."*

---

## 8. Acceptance criteria

1. The report generates **once**; preview and unlocked views never disagree.
2. A locked card's `innerText` contains no answer text — asserted on the DOM, not
   only via `curl`. Screen-reader parity: nothing readable by AT that is hidden
   from sight.
3. `/api/mock-interview` cannot be replayed to obtain report-equivalent feedback.
4. Six wrong codes fail; the sixth is refused by a **server-side** counter.
5. A code typed in Eastern Arabic numerals verifies successfully.
6. Submitting a valid email expands the report in place — no redirect, no modal,
   no reload; focus lands on the revealed heading.
7. A returning user with `ia-cv-download-email-unlocked` set is never shown the
   gate.
8. The email-free escape hatch renders the full report with nothing stored or sent.
9. Only addresses with the marketing checkbox ticked reach the Resend audience.
10. WhatsApp share carries score and verdict only — assert after
    `decodeURIComponent`, since percent-encoded Arabic never matches a raw grep.
11. Deleting a report actually removes it server-side; a deleted link 404s.
12. History opt-in defaults OFF; "No thanks" is equal visual weight.
13. No copy claims a benefit the build does not deliver.
14. Arabic: the gate, the code entry, the unlock and the emails render in Arabic
    with correct direction. **Not** an assertion that `dir="rtl"` — v1's version
    passed on a hardcoded-English page.
15. `npm run ci` green; axe-core extended to preview, unlocked and error states,
    and re-run under `ar`.

## 9. Out of scope

Payments. Password or social login. Employer-facing features.
