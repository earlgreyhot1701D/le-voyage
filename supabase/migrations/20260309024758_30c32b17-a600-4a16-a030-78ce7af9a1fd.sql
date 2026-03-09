
-- =============================================
-- FIX RLS POLICY BUGS
-- Split ALL policies into granular commands
-- Merge conflicting RESTRICTIVE SELECT policies
-- =============================================

-- ============= 1. trip_collaborators =============
-- Drop the ALL policy that conflicts with SELECT
DROP POLICY IF EXISTS "Owners can manage collaborators" ON public.trip_collaborators;
-- Drop the old self-add INSERT policy
DROP POLICY IF EXISTS "Users can add themselves as owner when creating trip" ON public.trip_collaborators;
-- Drop the old SELECT policy
DROP POLICY IF EXISTS "Users can view collaborators of their trips" ON public.trip_collaborators;

-- New SELECT: any trip member can see collaborators
CREATE POLICY "Users can view collaborators of their trips"
  ON public.trip_collaborators FOR SELECT
  USING (is_trip_member(auth.uid(), trip_id));

-- Owner can INSERT collaborators (used by accept_invitation SECURITY DEFINER, 
-- but also needed for the self-add during create_trip_with_owner which is also SECURITY DEFINER)
CREATE POLICY "Owners can insert collaborators"
  ON public.trip_collaborators FOR INSERT
  WITH CHECK (is_trip_owner(auth.uid(), trip_id) OR (user_id = auth.uid() AND role = 'owner'::collaborator_role));

-- Owner can UPDATE collaborator roles
CREATE POLICY "Owners can update collaborators"
  ON public.trip_collaborators FOR UPDATE
  USING (is_trip_owner(auth.uid(), trip_id));

-- Owner can DELETE collaborators
CREATE POLICY "Owners can delete collaborators"
  ON public.trip_collaborators FOR DELETE
  USING (is_trip_owner(auth.uid(), trip_id));

-- ============= 2. invitations =============
-- Drop conflicting SELECT policies
DROP POLICY IF EXISTS "Trip owners can view invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can view invitations to their email" ON public.invitations;

-- Merged SELECT: owner OR recipient
CREATE POLICY "Users can view relevant invitations"
  ON public.invitations FOR SELECT
  USING (is_trip_owner(auth.uid(), trip_id) OR lower(email) = lower(get_current_user_email()));

-- ============= 3. areas =============
DROP POLICY IF EXISTS "Editors can manage areas" ON public.areas;

CREATE POLICY "Editors can insert areas"
  ON public.areas FOR INSERT
  WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update areas"
  ON public.areas FOR UPDATE
  USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can delete areas"
  ON public.areas FOR DELETE
  USING (can_edit_trip(auth.uid(), trip_id));

-- ============= 4. places =============
DROP POLICY IF EXISTS "Editors can manage places" ON public.places;

CREATE POLICY "Editors can insert places"
  ON public.places FOR INSERT
  WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update places"
  ON public.places FOR UPDATE
  USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can delete places"
  ON public.places FOR DELETE
  USING (can_edit_trip(auth.uid(), trip_id));

-- ============= 5. trip_days =============
DROP POLICY IF EXISTS "Editors can manage trip days" ON public.trip_days;

CREATE POLICY "Editors can insert trip days"
  ON public.trip_days FOR INSERT
  WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update trip days"
  ON public.trip_days FOR UPDATE
  USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can delete trip days"
  ON public.trip_days FOR DELETE
  USING (can_edit_trip(auth.uid(), trip_id));

-- ============= 6. itinerary_items =============
DROP POLICY IF EXISTS "Editors can manage itinerary items" ON public.itinerary_items;

CREATE POLICY "Editors can insert itinerary items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (can_edit_trip(auth.uid(), get_trip_id_from_day(trip_day_id)));

CREATE POLICY "Editors can update itinerary items"
  ON public.itinerary_items FOR UPDATE
  USING (can_edit_trip(auth.uid(), get_trip_id_from_day(trip_day_id)));

CREATE POLICY "Editors can delete itinerary items"
  ON public.itinerary_items FOR DELETE
  USING (can_edit_trip(auth.uid(), get_trip_id_from_day(trip_day_id)));

-- ============= 7. tickets =============
DROP POLICY IF EXISTS "Editors can manage tickets" ON public.tickets;

CREATE POLICY "Editors can insert tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (can_edit_trip(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

CREATE POLICY "Editors can update tickets"
  ON public.tickets FOR UPDATE
  USING (can_edit_trip(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

CREATE POLICY "Editors can delete tickets"
  ON public.tickets FOR DELETE
  USING (can_edit_trip(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

-- ============= 8. insights =============
DROP POLICY IF EXISTS "Editors can manage insights" ON public.insights;

CREATE POLICY "Editors can insert insights"
  ON public.insights FOR INSERT
  WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update insights"
  ON public.insights FOR UPDATE
  USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can delete insights"
  ON public.insights FOR DELETE
  USING (can_edit_trip(auth.uid(), trip_id));

-- ============= 9. profiles =============
-- Drop conflicting SELECT policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Collaborators can view profiles of trip members" ON public.profiles;

-- Merged SELECT: own profile OR shared trip member
CREATE POLICY "Users can view relevant profiles"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR id IN (SELECT get_shared_trip_user_ids(auth.uid())));
