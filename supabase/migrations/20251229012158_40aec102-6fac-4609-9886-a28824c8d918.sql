-- Fix trips INSERT policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can create trips" ON trips;

CREATE POLICY "Authenticated users can create trips" ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix trip_collaborators INSERT policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can add themselves as owner when creating trip" ON trip_collaborators;

CREATE POLICY "Users can add themselves as owner when creating trip" ON trip_collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'owner'::collaborator_role);