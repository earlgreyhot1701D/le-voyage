## Correction before proceeding: Option 1 isn't fully available on this project, and it may conflict with an existing project rule

I recommended Option 1 (platform-native email) last round without checking two things I should have. Flagging now, before any code lands.

### Blocker 1 — Transactional email tooling is not available here

The platform's transactional email path (`email_domain--scaffold_transactional_email`, `email_domain--setup_email_infra`) requires **Lovable-managed Cloud**. This project is connected to **your own external Supabase instance** (project ref `ixhdadzkztjcdqridqha`). Per the platform's own guidance in this session: *"Lovable provisions its email infrastructure through the Supabase Management API on Lovable-managed projects only... these tools are not in your tool list."*

Confirmed by inspecting my available tools: I have `check_email_domain_status`, `list_email_domains`, `scaffold_auth_email_templates`, `toggle_project_emails`. I do **not** have `scaffold_transactional_email` or `setup_email_infra`.

**Consequence:** Option 1's C3 half — "scaffold `send-transactional-email` and refactor `tripService.sendInvitationEmail` to use it" — cannot be executed. There is no platform-managed transactional endpoint to call.

What IS available under Option 1:
- ✅ Auth emails (password reset — B side of the brief) via `scaffold_auth_email_templates` + `auth-email-hook`. This works.
- ❌ Invitation emails (A side of the brief) via a platform transactional function. Not available.

### Blocker 2 — Project memory says invites shouldn't be automated at all

The active project memory has this Core rule (always applied):
> **Use Web Share API for manual invites, never automated emails.**

And a referenced memory `mem://features/collaboration-invites` on the same topic. This directly contradicts the entire A-side of the brief ("cannot resend invitations to collaborators" → fix by sending real invitation emails). Either:
- The rule is stale and you want it removed (in which case the invitation email work proceeds under whichever provider you pick), or
- The rule stands, in which case the A-side isn't "fix email delivery" — it's "make the manual share-link resend flow work" (regenerate the token, hand the fresh link to Web Share / clipboard, no email transport at all).

I should not silently override a Core memory. Need your call.

### Revised options

Pick one; I'll re-issue the definition-of-done and execute.

**Option 1-Auth-Only (recommended if invites stay manual).** Honor the memory rule.
- **A side (invitations):** `regenerate_invitation_token` is already live from the earlier A1 migration. Wire the "Resend" button in `CollaboratorsModal` to call it, then hand the fresh link to Web Share API / clipboard. No email transport, no third-party account, matches the existing project convention. Delete `supabase/functions/send-invitation/` (already stubbed to be removed).
- **B side (password reset):** Platform-native auth emails. Scaffold `auth-email-hook`, apply Guimard brand styling to templates, deploy. You'll be prompted to configure a sender domain via the email-setup dialog (I'll surface the button).
- **C4:** Set Site URL + `/reset-password` and `/invite/*` redirects in Supabase Auth. (I can't do this from tools — I'll produce exact values you paste in the dashboard.)
- **Part D:** Full diff + out-of-repo checklist (dashboard URL config, domain DNS records) + T1–T8 evidence. T1 (resend invitation) evidence becomes "fresh link generated + Web Share sheet opens with correct URL" rather than an inbox screenshot; T5 (password reset) still requires a real inbox screenshot.

**Option 2 (revert to the original brief).** Third-party for invitations.
- Update the memory to remove/rewrite the "never automated emails" rule (I'll do it explicitly and tell you).
- Add Resend for the invitation email only (auth stays platform-native). You verify a domain in Resend + paste `RESEND_API_KEY` via `add_secret`. Refactor `send-invitation` to keep the exact auth checks (`verifyJWT` → `is_trip_owner` RPC → `accepted_at IS NULL` guard) and swap only the transport to Resend.
- Everything else same as Option 1-Auth-Only.

**Option 3 (full third-party, mirrors what your brief originally asked).** Resend for invitations + custom SMTP for Supabase Auth password-reset emails. Most moving parts. Only pick this if you specifically want to keep auth emails off the platform pipeline.

### My recommendation

**Option 1-Auth-Only.** It's the only option that honors the existing project rule, uses the tools I actually have, and delivers real password-reset email through the platform. The invitation "resend" becomes a fresh link + Web Share (already the project pattern) instead of a mail send — which is what the memory says the app should do anyway.

### Preserved-authorization guardrail (applies to Options 2/3 only)

If you go with Option 2 or 3, the invitation send stays behind exactly these checks, in this order, before any email transport call:
1. Verify JWT via Supabase Auth (edge function `verifyJwt=true` OR explicit `supabase.auth.getUser(token)` on the caller-provided access token — never the service role).
2. Call `is_trip_owner(auth.uid(), trip_id)` — return 403 if false.
3. Look up the invitation by id, verify `trip_id` matches and `accepted_at IS NULL` — return 409 if already accepted.
4. Only then call the transport (Resend or platform). Any failure at 1–3 aborts before the transport call.

I'll document the exact file/line where each check lives in the Part D diff.

### Ask

Which option — 1-Auth-Only, 2, or 3? And if 2 or 3, confirm the memory rule should be rewritten.
