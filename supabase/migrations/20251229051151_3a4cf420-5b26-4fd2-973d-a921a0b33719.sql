-- Drop and recreate get_invitation_by_token to NOT return email (prevents harvesting)
DROP FUNCTION IF EXISTS public.get_invitation_by_token(text);

CREATE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE(id uuid, trip_id uuid, role collaborator_role, expires_at timestamp with time zone, accepted_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, trip_id, role, expires_at, accepted_at
  FROM invitations
  WHERE token = _token
    AND accepted_at IS NULL
    AND expires_at > now()
$$;

-- Add explicit UPDATE deny policy on invitations
-- This ensures invitation tokens and emails cannot be modified
CREATE POLICY "Invitations cannot be updated" ON invitations
FOR UPDATE USING (false);