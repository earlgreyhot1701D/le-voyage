-- Fix the infinite recursion bug in trip_collaborators RLS policy
-- The "Users can view collaborators of their trips" policy calls has_trip_access()
-- which queries trip_collaborators, causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view collaborators of their trips" ON trip_collaborators;

-- Create a new non-recursive policy using direct auth check
-- This allows users to view collaborators of trips they're part of
CREATE POLICY "Users can view collaborators of their trips"
ON trip_collaborators FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  trip_id IN (
    SELECT tc.trip_id 
    FROM trip_collaborators tc 
    WHERE tc.user_id = auth.uid()
  )
);

-- Also create the generate_trip_days function for auto-generating trip days
CREATE OR REPLACE FUNCTION public.generate_trip_days(p_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date date;
  v_end_date date;
  v_current_date date;
  v_day_number integer := 1;
BEGIN
  -- Get trip dates
  SELECT start_date, end_date INTO v_start_date, v_end_date
  FROM trips WHERE id = p_trip_id;
  
  -- If no dates, do nothing
  IF v_start_date IS NULL OR v_end_date IS NULL THEN
    RETURN;
  END IF;
  
  -- Delete existing days for this trip
  DELETE FROM trip_days WHERE trip_id = p_trip_id;
  
  -- Generate days
  v_current_date := v_start_date;
  WHILE v_current_date <= v_end_date LOOP
    INSERT INTO trip_days (trip_id, day_number, date)
    VALUES (p_trip_id, v_day_number, v_current_date);
    
    v_current_date := v_current_date + 1;
    v_day_number := v_day_number + 1;
  END LOOP;
END;
$$;