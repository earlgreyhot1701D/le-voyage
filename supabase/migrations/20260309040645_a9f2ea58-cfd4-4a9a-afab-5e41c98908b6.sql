
-- Fix: All RLS policies were RESTRICTIVE, making them non-functional.
-- Drop and recreate all policies as PERMISSIVE (PostgreSQL default).

-- =====================
-- trip_collaborators
-- =====================
DROP POLICY IF EXISTS "Owners can delete collaborators" ON public.trip_collaborators;
DROP POLICY IF EXISTS "Owners can insert collaborators" ON public.trip_collaborators;
DROP POLICY IF EXISTS "Owners can update collaborators" ON public.trip_collaborators;
DROP POLICY IF EXISTS "Users can view collaborators of their trips" ON public.trip_collaborators;

CREATE POLICY "Owners can delete collaborators"
ON public.trip_collaborators FOR DELETE TO authenticated
USING (is_trip_owner(auth.uid(), trip_id));

CREATE POLICY "Owners can insert collaborators"
ON public.trip_collaborators FOR INSERT TO authenticated
WITH CHECK (is_trip_owner(auth.uid(), trip_id));

CREATE POLICY "Owners can update collaborators"
ON public.trip_collaborators FOR UPDATE TO authenticated
USING (is_trip_owner(auth.uid(), trip_id));

CREATE POLICY "Users can view collaborators of their trips"
ON public.trip_collaborators FOR SELECT TO authenticated
USING (is_trip_member(auth.uid(), trip_id));

-- =====================
-- trips
-- =====================
DROP POLICY IF EXISTS "Authenticated users can create trips" ON public.trips;
DROP POLICY IF EXISTS "Owners and editors can update trips" ON public.trips;
DROP POLICY IF EXISTS "Owners can delete trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view trips they collaborate on" ON public.trips;

CREATE POLICY "Authenticated users can create trips"
ON public.trips FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and editors can update trips"
ON public.trips FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), id));

CREATE POLICY "Owners can delete trips"
ON public.trips FOR DELETE TO authenticated
USING (is_trip_owner(auth.uid(), id));

CREATE POLICY "Users can view trips they collaborate on"
ON public.trips FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), id));

-- =====================
-- trip_days
-- =====================
DROP POLICY IF EXISTS "Editors can delete trip days" ON public.trip_days;
DROP POLICY IF EXISTS "Editors can insert trip days" ON public.trip_days;
DROP POLICY IF EXISTS "Editors can update trip days" ON public.trip_days;
DROP POLICY IF EXISTS "Users can view trip days of their trips" ON public.trip_days;

CREATE POLICY "Editors can delete trip days"
ON public.trip_days FOR DELETE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can insert trip days"
ON public.trip_days FOR INSERT TO authenticated
WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update trip days"
ON public.trip_days FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Users can view trip days of their trips"
ON public.trip_days FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), trip_id));

-- =====================
-- insights
-- =====================
DROP POLICY IF EXISTS "Editors can delete insights" ON public.insights;
DROP POLICY IF EXISTS "Editors can insert insights" ON public.insights;
DROP POLICY IF EXISTS "Editors can update insights" ON public.insights;
DROP POLICY IF EXISTS "Users can view insights of their trips" ON public.insights;

CREATE POLICY "Editors can delete insights"
ON public.insights FOR DELETE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can insert insights"
ON public.insights FOR INSERT TO authenticated
WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update insights"
ON public.insights FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Users can view insights of their trips"
ON public.insights FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), trip_id));

-- =====================
-- tickets
-- =====================
DROP POLICY IF EXISTS "Editors can delete tickets" ON public.tickets;
DROP POLICY IF EXISTS "Editors can insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Editors can update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view tickets of their trips" ON public.tickets;

CREATE POLICY "Editors can delete tickets"
ON public.tickets FOR DELETE TO authenticated
USING (can_edit_trip(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

CREATE POLICY "Editors can insert tickets"
ON public.tickets FOR INSERT TO authenticated
WITH CHECK (can_edit_trip(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

CREATE POLICY "Editors can update tickets"
ON public.tickets FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

CREATE POLICY "Users can view tickets of their trips"
ON public.tickets FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), get_trip_id_from_item(itinerary_item_id)));

-- =====================
-- invitations
-- =====================
DROP POLICY IF EXISTS "Invitations cannot be updated" ON public.invitations;
DROP POLICY IF EXISTS "Trip owners can delete invitations" ON public.invitations;
DROP POLICY IF EXISTS "Trip owners can insert invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can view relevant invitations" ON public.invitations;

CREATE POLICY "Invitations cannot be updated"
ON public.invitations FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Trip owners can delete invitations"
ON public.invitations FOR DELETE TO authenticated
USING (is_trip_owner(auth.uid(), trip_id));

CREATE POLICY "Trip owners can insert invitations"
ON public.invitations FOR INSERT TO authenticated
WITH CHECK (is_trip_owner(auth.uid(), trip_id));

CREATE POLICY "Users can view relevant invitations"
ON public.invitations FOR SELECT TO authenticated
USING (is_trip_owner(auth.uid(), trip_id) OR lower(email) = lower(get_current_user_email()));

-- =====================
-- areas
-- =====================
DROP POLICY IF EXISTS "Editors can delete areas" ON public.areas;
DROP POLICY IF EXISTS "Editors can insert areas" ON public.areas;
DROP POLICY IF EXISTS "Editors can update areas" ON public.areas;
DROP POLICY IF EXISTS "Users can view areas of their trips" ON public.areas;

CREATE POLICY "Editors can delete areas"
ON public.areas FOR DELETE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can insert areas"
ON public.areas FOR INSERT TO authenticated
WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update areas"
ON public.areas FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Users can view areas of their trips"
ON public.areas FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), trip_id));

-- =====================
-- itinerary_items
-- =====================
DROP POLICY IF EXISTS "Editors can delete itinerary items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Editors can insert itinerary items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Editors can update itinerary items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Users can view itinerary items of their trips" ON public.itinerary_items;

CREATE POLICY "Editors can delete itinerary items"
ON public.itinerary_items FOR DELETE TO authenticated
USING (can_edit_trip(auth.uid(), get_trip_id_from_day(trip_day_id)));

CREATE POLICY "Editors can insert itinerary items"
ON public.itinerary_items FOR INSERT TO authenticated
WITH CHECK (can_edit_trip(auth.uid(), get_trip_id_from_day(trip_day_id)));

CREATE POLICY "Editors can update itinerary items"
ON public.itinerary_items FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), get_trip_id_from_day(trip_day_id)));

CREATE POLICY "Users can view itinerary items of their trips"
ON public.itinerary_items FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), get_trip_id_from_day(trip_day_id)));

-- =====================
-- places
-- =====================
DROP POLICY IF EXISTS "Editors can delete places" ON public.places;
DROP POLICY IF EXISTS "Editors can insert places" ON public.places;
DROP POLICY IF EXISTS "Editors can update places" ON public.places;
DROP POLICY IF EXISTS "Users can view places of their trips" ON public.places;

CREATE POLICY "Editors can delete places"
ON public.places FOR DELETE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can insert places"
ON public.places FOR INSERT TO authenticated
WITH CHECK (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Editors can update places"
ON public.places FOR UPDATE TO authenticated
USING (can_edit_trip(auth.uid(), trip_id));

CREATE POLICY "Users can view places of their trips"
ON public.places FOR SELECT TO authenticated
USING (has_trip_access(auth.uid(), trip_id));

-- =====================
-- profiles
-- =====================
DROP POLICY IF EXISTS "Profiles cannot be deleted" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;

CREATE POLICY "Profiles cannot be deleted"
ON public.profiles FOR DELETE TO authenticated
USING (false);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR id IN (SELECT get_shared_trip_user_ids(auth.uid())));
