-- Make invitations effectively never expire (10 years default)
ALTER TABLE invitations 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '10 years');

-- Update existing pending invitations to not expire
UPDATE invitations 
SET expires_at = now() + interval '10 years' 
WHERE accepted_at IS NULL;

-- Update accept_invitation function to remove expiration check
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invitation invitations;
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get the current user's email from auth.users
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;
  
  -- Find the invitation (removed expires_at check - invitations now valid indefinitely)
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token = p_token
    AND accepted_at IS NULL;
  
  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or already accepted';
  END IF;
  
  -- SECURITY: Verify the logged-in user's email matches the invitation email
  IF lower(v_invitation.email) != lower(current_user_email) THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address';
  END IF;
  
  -- Check if user already collaborates on this trip
  IF EXISTS (
    SELECT 1 FROM trip_collaborators
    WHERE trip_id = v_invitation.trip_id AND user_id = current_user_id
  ) THEN
    -- Already a collaborator, just mark as accepted
    UPDATE invitations SET accepted_at = now() WHERE id = v_invitation.id;
    RETURN TRUE;
  END IF;
  
  -- Add user as collaborator
  INSERT INTO trip_collaborators (trip_id, user_id, role)
  VALUES (v_invitation.trip_id, current_user_id, v_invitation.role);
  
  -- Mark invitation as accepted
  UPDATE invitations SET accepted_at = now() WHERE id = v_invitation.id;
  
  RETURN TRUE;
END;
$$;

-- Also update get_invitation_by_token to remove expiration check
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE(id uuid, trip_id uuid, role collaborator_role, expires_at timestamp with time zone, accepted_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, trip_id, role, expires_at, accepted_at
  FROM invitations
  WHERE token = _token
    AND accepted_at IS NULL
$$;