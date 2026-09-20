-- =============================================
-- INVITATION RESEND SUPPORT
-- Adds a SECURITY DEFINER RPC that lets trip owners rotate the
-- invitation token and refresh expires_at on a pending invitation.
-- This is required because RLS denies all UPDATEs on invitations
-- ("Invitations cannot be updated"), so a client-side resend would
-- otherwise have no way to mint a fresh link or extend lifetime.
-- =============================================

CREATE OR REPLACE FUNCTION public.regenerate_invitation_token(
  p_invitation_id uuid
)
RETURNS TABLE (
  id uuid,
  trip_id uuid,
  email text,
  role public.collaborator_role,
  token text,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation invitations;
  v_caller uuid;
BEGIN
  v_caller := auth.uid();

  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_invitation
  FROM invitations
  WHERE invitations.id = p_invitation_id;

  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF v_invitation.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation has already been accepted';
  END IF;

  IF NOT public.is_trip_owner(v_caller, v_invitation.trip_id) THEN
    RAISE EXCEPTION 'Only the trip owner can regenerate invitations';
  END IF;

  RETURN QUERY
  UPDATE invitations
  SET token = encode(gen_random_bytes(32), 'hex'),
      expires_at = now() + interval '10 years'
  WHERE invitations.id = p_invitation_id
  RETURNING
    invitations.id,
    invitations.trip_id,
    invitations.email,
    invitations.role,
    invitations.token,
    invitations.expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.regenerate_invitation_token(uuid) TO authenticated;
