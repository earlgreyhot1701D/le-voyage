-- Recreate has_trip_access as SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.has_trip_access(_user_id uuid, _trip_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = _user_id AND trip_id = _trip_id
  )
$$;

-- Also fix can_edit_trip for the same reason
CREATE OR REPLACE FUNCTION public.can_edit_trip(_user_id uuid, _trip_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = _user_id 
      AND trip_id = _trip_id 
      AND role IN ('owner', 'editor')
  )
$$;

-- Clean up duplicate places without coordinates
DELETE FROM places 
WHERE name ILIKE '%Brasserie%Prés%' 
  AND latitude IS NULL;