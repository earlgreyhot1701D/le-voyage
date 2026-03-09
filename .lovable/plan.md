

## Security Review Results

### Critical: Privilege Escalation Bug (trip_collaborators INSERT policy)

The INSERT policy on `trip_collaborators` currently allows:
```sql
is_trip_owner(auth.uid(), trip_id) 
OR ((user_id = auth.uid()) AND (role = 'owner'))
```

The second clause lets **any authenticated user grant themselves owner access to any trip** — they just insert a row with their user_id, any trip_id, and role='owner'. This gives them full read/write/delete on all that trip's data.

**Fix:** Remove the second clause. Owner self-insertion is already handled by the `create_trip_with_owner` SECURITY DEFINER function, and invite acceptance uses `accept_invitation` (also SECURITY DEFINER). The policy only needs `is_trip_owner(auth.uid(), trip_id)`.

### Low: Leaked Password Protection Disabled

Manual toggle in Supabase dashboard Auth settings. I'll remind you to do this.

### Other Security Posture (already solid)

- **CORS**: All 3 edge functions have strict origin allowlists — good
- **Input validation**: Edge functions use Zod schemas — good
- **JWT disabled on edge functions**: Acceptable since they're CORS-protected and don't access user-specific data
- **RLS**: All tables have RLS enabled with proper policies (just fixed in previous migration)
- **Auth functions**: `accept_invitation`, `create_trip_with_owner` use SECURITY DEFINER with proper checks
- **Rate limiting**: Supabase provides built-in rate limiting on Auth endpoints. Edge functions rely on Supabase's infrastructure-level rate limiting. For a travel planning app at this scale, this is sufficient.

### Plan

1. **Fix the privilege escalation** — one SQL migration to drop and recreate the INSERT policy on `trip_collaborators` with only `is_trip_owner(auth.uid(), trip_id)`
2. **Remind you** to enable leaked password protection in the Supabase dashboard

No frontend changes needed.

