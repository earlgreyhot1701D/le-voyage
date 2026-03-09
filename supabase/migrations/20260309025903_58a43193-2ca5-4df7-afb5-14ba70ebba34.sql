-- Fix privilege escalation: remove self-add-as-owner clause
DROP POLICY IF EXISTS "Owners can insert collaborators" ON public.trip_collaborators;

CREATE POLICY "Owners can insert collaborators"
ON public.trip_collaborators
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (is_trip_owner(auth.uid(), trip_id));