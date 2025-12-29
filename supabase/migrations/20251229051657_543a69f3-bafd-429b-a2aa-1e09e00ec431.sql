-- Fix generate_trip_days to require edit access
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
  -- Verify user has edit access
  IF NOT can_edit_trip(auth.uid(), p_trip_id) THEN
    RAISE EXCEPTION 'Permission denied: user does not have edit access to this trip';
  END IF;

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