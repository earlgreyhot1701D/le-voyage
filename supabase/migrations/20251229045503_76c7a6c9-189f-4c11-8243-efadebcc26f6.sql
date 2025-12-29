-- Phase 1: Create SECURITY DEFINER helper functions

-- Helper to check if user is a trip member (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_trip_member(_user_id uuid, _trip_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = _user_id AND trip_id = _trip_id
  )
$$;

-- Helper to check if user is trip owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_trip_owner(_user_id uuid, _trip_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = _user_id AND trip_id = _trip_id AND role = 'owner'
  )
$$;

-- Helper to get all user IDs that share trips with a given user (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_shared_trip_user_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT DISTINCT tc2.user_id
  FROM public.trip_collaborators tc1
  JOIN public.trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
  WHERE tc1.user_id = _user_id
$$;

-- Phase 2: Fix trip_collaborators policies

DROP POLICY IF EXISTS "Users can view collaborators of their trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Owners can manage collaborators" ON trip_collaborators;

-- New SELECT policy using helper function
CREATE POLICY "Users can view collaborators of their trips" ON trip_collaborators
FOR SELECT USING (
  user_id = auth.uid() OR public.is_trip_member(auth.uid(), trip_id)
);

-- New ALL policy for owners using helper function
CREATE POLICY "Owners can manage collaborators" ON trip_collaborators
FOR ALL USING (
  public.is_trip_owner(auth.uid(), trip_id)
);

-- Phase 3: Fix profiles policy

DROP POLICY IF EXISTS "Collaborators can view profiles of trip members" ON profiles;

CREATE POLICY "Collaborators can view profiles of trip members" ON profiles
FOR SELECT USING (
  id = auth.uid() OR id IN (SELECT public.get_shared_trip_user_ids(auth.uid()))
);

-- Phase 4: Fix invitations policy

DROP POLICY IF EXISTS "Trip owners can manage invitations" ON invitations;

CREATE POLICY "Trip owners can manage invitations" ON invitations
FOR ALL USING (
  public.is_trip_owner(auth.uid(), trip_id)
);

-- Phase 5: Fix trips delete policy

DROP POLICY IF EXISTS "Owners can delete trips" ON trips;

CREATE POLICY "Owners can delete trips" ON trips
FOR DELETE USING (
  public.is_trip_owner(auth.uid(), id)
);

-- Phase 6: Clean up duplicate places (keep the one with most complete data)
DELETE FROM places 
WHERE name = 'Brasserie des Prés' 
  AND trip_id = '55f7ecf5-603c-4c68-b723-5017d13896e1'
  AND latitude IS NULL;