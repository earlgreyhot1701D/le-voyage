

## Project Status & Security Review

### Where We Are

Le Voyage is a collaborative trip planning app with:
- Auth (sign in/up, forgot password, password reset) — just fixed
- Trip CRUD (create, edit, delete)
- Collaboration (invite by link, accept invitations, role-based access)
- Places/itinerary management per trip day
- AI insights (edge function, currently disabled)
- Map integration (Mapbox, currently disabled)
- Place search (edge function)

Feature flags show AI and Maps are still disabled (`ENABLE_AI: false`, `ENABLE_MAPS: false`).

---

### Security Scan Results: 5 RLS Policy Bugs + 1 Auth Config Issue

The security scan found **5 serious Row-Level Security bugs** that are actively breaking functionality for your collaborators (like Eileen). These should be fixed before any new features.

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | **High** | Viewers are locked out of all trip content (places, days, itinerary, insights) | Viewers see empty trips |
| 2 | **High** | Non-owner collaborators can't see the collaborator list | Editors/viewers can't see who else is on the trip |
| 3 | **High** | Owners can't view invitations they sent to others | Invitation management is broken for owners |
| 4 | **High** | Owners can't add collaborators via the invite-accept flow | The `accept_invitation` function may fail silently |
| 5 | **Medium** | Collaborators can't see each other's profiles (names/avatars) | Shows blank names in the UI |
| 6 | **Low** | Leaked password protection is disabled | Supabase auth config setting |

**Root cause:** All these stem from using `RESTRICTIVE` RLS policies with `ALL` commands. When multiple RESTRICTIVE policies exist, PostgreSQL ANDs them together, which creates unintended lockouts.

### Recommended Plan: Fix All 6 RLS Issues

**What we'd do:** Split the `ALL` policies into separate `INSERT`, `UPDATE`, `DELETE` policies (keeping them RESTRICTIVE), and change conflicting `SELECT` policies to `PERMISSIVE` or merge them with `OR` logic. Specifically:

1. **`trip_collaborators`** — Split the owner `ALL` policy into `UPDATE`+`DELETE` only; fix the self-add INSERT policy
2. **`invitations`** — Merge the two SELECT policies into one using `OR` logic (owner OR recipient)
3. **`areas`, `places`, `trip_days`, `itinerary_items`, `tickets`, `insights`** — Split each `ALL` policy into `INSERT`+`UPDATE`+`DELETE` so viewer SELECT works
4. **`profiles`** — Merge SELECT policies with `OR` logic (own profile OR shared trip member)
5. **Enable leaked password protection** in Supabase auth config

This is a migration-only change (SQL policies), no frontend code changes needed.

