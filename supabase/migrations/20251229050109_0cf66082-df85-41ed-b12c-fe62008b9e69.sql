-- Fix the invitations policy - owners need SELECT access via their own policy
-- The current policy references profiles join which causes auth.users access issue
DROP POLICY IF EXISTS "Trip owners can manage invitations" ON invitations;

-- Create separate policies for different operations
CREATE POLICY "Trip owners can view invitations" ON invitations
FOR SELECT USING (
  public.is_trip_owner(auth.uid(), trip_id)
);

CREATE POLICY "Trip owners can insert invitations" ON invitations
FOR INSERT WITH CHECK (
  public.is_trip_owner(auth.uid(), trip_id)
);

CREATE POLICY "Trip owners can delete invitations" ON invitations
FOR DELETE USING (
  public.is_trip_owner(auth.uid(), trip_id)
);