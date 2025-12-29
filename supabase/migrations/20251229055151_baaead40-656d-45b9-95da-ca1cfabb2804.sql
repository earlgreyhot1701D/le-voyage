-- Create a SECURITY DEFINER function to safely get the current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Drop the existing broken policy
DROP POLICY IF EXISTS "Users can view invitations to their email" ON invitations;

-- Create the fixed policy using the new function
CREATE POLICY "Users can view invitations to their email" ON invitations
  FOR SELECT
  USING (lower(email) = lower(get_current_user_email()));