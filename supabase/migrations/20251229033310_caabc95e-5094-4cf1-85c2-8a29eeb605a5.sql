-- Create invitations table for pending trip invites
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate invites
  UNIQUE(trip_id, email)
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Owners can view, create, and delete invitations for their trips
CREATE POLICY "Trip owners can manage invitations"
ON public.invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.trip_collaborators tc
    WHERE tc.trip_id = invitations.trip_id
      AND tc.user_id = auth.uid()
      AND tc.role = 'owner'
  )
);

-- Users can view invitations sent to their email (for accepting)
CREATE POLICY "Users can view invitations to their email"
ON public.invitations
FOR SELECT
USING (
  lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Anyone can check if an invitation token exists (for accept flow)
CREATE POLICY "Anyone can check invitation tokens"
ON public.invitations
FOR SELECT
USING (token IS NOT NULL);

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation invitations;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Find the invitation
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();
  
  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found, expired, or already accepted';
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

-- Allow collaborators to view other collaborators on their trips
CREATE POLICY "Collaborators can view profiles of trip members"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM trip_collaborators tc1
    JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
    WHERE tc1.user_id = auth.uid() AND tc2.user_id = profiles.id
  )
);