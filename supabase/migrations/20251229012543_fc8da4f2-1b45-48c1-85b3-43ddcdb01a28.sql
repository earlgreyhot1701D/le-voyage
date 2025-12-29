-- Fix trips INSERT policy: apply to all roles, with check for authenticated users
DROP POLICY IF EXISTS "Authenticated users can create trips" ON trips;

CREATE POLICY "Authenticated users can create trips" ON trips
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix trip_collaborators INSERT policy: apply to all roles
DROP POLICY IF EXISTS "Users can add themselves as owner when creating trip" ON trip_collaborators;

CREATE POLICY "Users can add themselves as owner when creating trip" ON trip_collaborators
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid() AND role = 'owner'::collaborator_role);