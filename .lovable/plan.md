

## Plan: Fix Auth Issues — Forgot Password + Invite Redirect

### 1. Add "Forgot Password" to AuthPage (`src/pages/AuthPage.tsx`)

- Add a `forgotPassword` state toggle
- When active, show a simplified form: email input + "Send Reset Link" button
- Call `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Add the `resetPasswordForEmail` method to `useAuth` hook
- Add a "Forgot password?" link below the sign-in form

### 2. Create Reset Password Page (`src/pages/ResetPasswordPage.tsx`)

- New page at `/reset-password` (public route, not behind `ProtectedRoute`)
- On mount, detect `type=recovery` in the URL hash (Supabase appends this)
- Show a "New Password" + "Confirm Password" form
- Call `supabase.auth.updateUser({ password })` to set the new password
- On success, redirect to `/` (dashboard)

### 3. Add Route in `src/App.tsx`

- Add: `<Route path="/reset-password" element={<ResetPasswordPage />} />`
- This must be a public route (no `ProtectedRoute` wrapper)

### 4. Fix Invite Redirect After Login (`src/pages/AuthPage.tsx`)

- After successful sign-in, check `sessionStorage.getItem('redirectAfterLogin')`
- If present, navigate there and clear it; otherwise navigate to `/`
- The `AcceptInvitePage` already saves the redirect URL to `sessionStorage` (line 24), so this completes the loop

### 5. Update `useAuth` Hook (`src/hooks/useAuth.ts`)

- Add `resetPasswordForEmail` method that wraps `supabase.auth.resetPasswordForEmail`

### Files Changed
| File | Action |
|------|--------|
| `src/hooks/useAuth.ts` | Add `resetPasswordForEmail` method |
| `src/pages/AuthPage.tsx` | Add forgot password UI + invite redirect after login |
| `src/pages/ResetPasswordPage.tsx` | Create new page |
| `src/App.tsx` | Add `/reset-password` route |

