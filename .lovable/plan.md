

## Plan: Google-Only Auth + Invite Redirect Fix

### Overview
Replace the email/password auth flow with Google Sign-In only. Users will always land on the dashboard after login; if they arrived via an invite link, they can accept it from their pending invitations.

---

### Code Changes

**1. Update `src/pages/AuthPage.tsx`**
- Remove email/password form, sign up toggle, and Zod validation
- Add a single "Continue with Google" button using `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Redirect to dashboard on successful auth (handled by existing `useEffect`)

**2. Update `src/hooks/useAuth.ts`**
- Add `signInWithGoogle()` method:
  ```ts
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { error };
  }, []);
  ```
- Remove `signUp` (no longer needed with Google-only)
- Keep `signOut`

**3. Remove unused auth code**
- Clean up Zod schema, displayName state, isSignUp toggle from AuthPage

---

### Invite Flow Simplification
Since users always land on the dashboard:
- Pending invitations are already visible in the database
- We can optionally show a "You have pending invitations" banner on the Index page (nice-to-have, not blocking)
- Remove `sessionStorage.setItem('redirectAfterLogin')` from AcceptInvitePage (it's unused now)

---

### Google Auth Setup Instructions (For Supabase Dashboard)

You'll need to configure Google OAuth in your Supabase project:

1. **Go to Google Cloud Console** → https://console.cloud.google.com
2. **Create OAuth Credentials**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → OAuth Client ID
   - Choose "Web application"
   - Add **Authorized JavaScript origins**:
     - `https://levoyage.lovable.app`
     - `http://localhost:5173` (for local dev)
   - Add **Authorized redirect URI**:
     - `https://ixhdadzkztjcdqridqha.supabase.co/auth/v1/callback`
3. **Copy** the Client ID and Client Secret
4. **Go to Supabase Dashboard**:
   - https://supabase.com/dashboard/project/ixhdadzkztjcdqridqha/auth/providers
   - Enable **Google** provider
   - Paste Client ID and Client Secret
   - Save

---

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useAuth.ts` | Add `signInWithGoogle()`, remove `signUp` |
| `src/pages/AuthPage.tsx` | Replace form with Google button |
| `src/pages/AcceptInvitePage.tsx` | Remove sessionStorage redirect code |

---

### Result
- Users click "Continue with Google" → Google OAuth → redirected to dashboard
- Eileen can sign in with her Gmail and immediately see all her trips
- No password to remember or reset

