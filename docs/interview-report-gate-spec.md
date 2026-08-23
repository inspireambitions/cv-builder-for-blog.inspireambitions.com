# Interview report unlock — build spec

Branch: `claude/gulf-hospitality-video-interview-q7nrxl`
Depends on: mock interview being wired to the UI (brief section B2/D1)

---

## 1. The one decision that shapes everything

The requested flow was: show 1 question → ask for email → **user opens inbox and
clicks verify** → returns to the full report.

That inbox round-trip is the highest-drop-off step in the whole funnel, and it
sits directly between the user and the thing they just spent 20 minutes earning.
The stated goal was "seamless, no friction, makes the signup decision easy and
quick" — a mandatory app switch is the opposite of that, particularly for a
mobile-first Gulf and international audience on webmail.

**So we split unlock from account:**

| Action | What it costs the user | What it gives us |
|---|---|---|
| **Unlock the report** | type email, press enter | the email address |
| **Keep the report** (save / re-open later) | verify via 6-digit code | a verified contact |

The report opens **the instant a valid email is submitted**. Verification is
never a wall in front of the report — it is the price of *persistence*, which is
a benefit the user actually wants and will pay attention for.

This is strictly better commercially, not a softening. An unverified address in
the list is a lead. A user who bounced at their inbox is nothing at all.

It is also cleaner for consent: **unverified = report access only; verified =
added to the Resend marketing audience.** Verification becomes the consent event,
which is where it belongs.

### Patterns we are borrowing, and why

- **Duolingo** — let people finish the work, then offer the account as "save your
  progress," never as a toll gate. Our equivalent: the interview completes, the
  report exists, the account saves it.
- **Linear / Notion magic links** — a **6-digit code typed into the page** beats a
  clicked link, because it never switches app context. This is the single biggest
  UX win available here. Ship the code as the primary path and the clickable link
  in the same email as a fallback.
- **Substack** — access now, verify for permanence.
- **Metered news sites** — a blur gate that shows the *shape* of what is hidden
  (real headings, real counts, unreadable body) converts far better than a hard
  wall, because the value is legible before the ask.
- **Canva share links** — sharing must not require the recipient to have an
  account. Ours must not either.

### One question is not enough to earn the email

Showing a single question undersells the report. Show instead:

- the overall score / verdict — **in full**
- the **first two** questions with answer and feedback — in full
- every remaining question as a **blurred card with its real heading visible**
- a specific, quantified tease, not a generic one

Use the strongest true line available, e.g. *"3 of your answers would cost you the
offer. Unlock to see which."* Specificity is what converts; "unlock the full
report" does not.

---

## 2. Flow

```
interview ends
   │
   ▼
REPORT (preview state)          score + Q1,Q2 full + rest blurred + "3 answers
   │                            would cost you the offer"
   │  [ email field, inline, no modal, no redirect ]
   ▼
REPORT (unlocked)               everything visible, immediately
   │
   ├─▶ Share to WhatsApp        → shares a SUMMARY link (see §5)
   │
   └─▶ "Save this report"       → sends 6-digit code
           │
           ▼
       code typed in page       → verified: emailed a permanent private link,
                                  added to the Resend audience
```

No modal, no new page, no redirect at the unlock step. The email field is inline
in the report and the report expands in place.

---

## 3. Make the gate real without a database

The mock interview already runs server-side. Keep the report there too:

- `POST /api/interview-report` receives the transcript.
- With **no email**: returns score, verdict, Q1 and Q2 feedback, and for every
  remaining question **only the heading and a severity flag** — never the body.
- With a **valid email**: returns the whole report.

This matters. A purely client-side blur is a CSS speed bump — the locked text
sits in the DOM and any devtools user reads it. Gating server-side costs nothing
extra and makes the preview honest.

---

## 4. Reuse what is already built — do not add dependencies

Three primitives already exist in this repo and cover the whole feature:

**`app/api/handoff/verify/route.ts`** is already a complete magic-link primitive:
HMAC-SHA256 over a base64url payload, `timingSafeEqual` comparison, `exp` claim,
`HANDOFF_SECRET` (min 32 chars). Copy this pattern for the 6-digit code token.
Do not add a JWT library.

**`lib/resume-link.ts`** already encrypts a payload with AES-GCM and puts the key
in the **URL fragment**, so the server never sees it. This is the save/share
mechanism, already written and shipped. Reuse it for the report.

**`app/api/subscribe/route.ts`** already talks to Resend with idempotency keys and
an audience segment (`RESEND_CV_SEGMENT_ID`). Send the code through it.

**No new dependencies.** `package.json` has no database, no auth library, and
`scripts/check-free-product.mjs` fails the build on payment code. Keep it that way.

---

## 5. WhatsApp share — and the trap in it

`https://wa.me/?text=<encoded>` is all the mechanism needed. The trap is *what*
gets shared.

The report contains the user's own interview answers. People paste WhatsApp links
into group chats. **Sharing the full report link by default would leak a
candidate's weakest answers to whoever the link reaches.**

So:

- **Share button → a summary card link**: score, role, headline verdict. No answer
  text, no per-question feedback.
- **The full report link is private**, delivered by email only, and labelled as
  private where it appears.
- Two different links, two different payloads. Do not collapse them.

---

## 6. "Save it on their account" — what can and cannot ship today

**There is no account system.** No database, no auth library, no user table.
Confirmed from `package.json`. Real accounts are days of work, not today.

What ships today and delivers the same user promise:

> A permanent, private, fragment-encrypted report link, emailed to them on
> verification. It re-opens the full report on any device. It is functionally
> "their account" for this one artefact.

What that link cannot do — and must therefore not be described as an account in
the UI — is list past reports, show progress across attempts, or be revoked.
Call it **"your saved report link,"** never "your account."

A real account with report history is the correct next step, and it is also what
the progress-tracking ask needs. It is a separate project.

---

## 7. Non-negotiables for the implementer

- **Rate limit** `POST` on the email and code endpoints. Serverless means
  in-memory counters are unreliable — use a signed, short-TTL challenge and cap
  code attempts at 5 per token. State the residual risk in the PR rather than
  pretending it is solved.
- **Token TTLs**: 6-digit code 15 minutes; saved report link 90 days.
- Bind the code to the email **inside the signed payload**. Never trust an email
  posted alongside a token.
- Compare with `timingSafeEqual`, as `handoff/verify` already does.
- Never put interview answers inside a token. The report stays client-side or
  server-generated; tokens only prove email ownership.
- **Consent**: only add to the Resend audience *after* verification. Unverified
  addresses unlock the report and go no further.
- Validate email server-side; the client regex is not a check.
- The whole flow must work in Arabic and RTL — this is one of only two supported
  locales.

---

## 8. Acceptance criteria

1. Finishing an interview shows score + 2 full questions + the rest blurred with
   real headings and a specific quantified tease.
2. `curl`ing the report endpoint without an email returns **no** locked answer
   text — verified by a test, not by inspection.
3. Submitting a valid email expands the report in place: no redirect, no modal,
   no page reload, no inbox visit.
4. "Save this report" sends a 6-digit code; typing it in-page verifies without
   leaving the page; the emailed link also works as a fallback.
5. The verified user receives a private link that re-opens the full report on a
   different device.
6. The WhatsApp share link contains score and verdict only — asserted by a test
   that greps the shared payload for answer text.
7. Only verified addresses reach the Resend audience.
8. Full flow passes in `ar` with `dir="rtl"`.
9. `npm run ci` green.

## 9. Out of scope for this build

Real accounts, report history, progress dashboards, password login, social login,
payments.
