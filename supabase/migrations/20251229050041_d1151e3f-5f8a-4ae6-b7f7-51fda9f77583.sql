-- Fix 1: Remove dangerous public access policy for invitations
DROP POLICY IF EXISTS "Anyone can check invitation tokens" ON invitations;

-- Create a SECURITY DEFINER function to safely fetch invitation by token
-- This bypasses RLS but only returns limited, non-sensitive fields for a specific token
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE (
  id uuid,
  trip_id uuid,
  email text,
  role collaborator_role,
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT id, trip_id, email, role, expires_at, accepted_at
  FROM invitations
  WHERE token = _token
    AND accepted_at IS NULL
    AND expires_at > now()
$$;

-- Fix 2: Explicitly deny all profile deletions
CREATE POLICY "Profiles cannot be deleted" ON profiles
FOR DELETE USING (false);