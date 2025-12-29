-- Create a function to atomically create a trip and add the owner as collaborator
CREATE OR REPLACE FUNCTION create_trip_with_owner(
  p_title TEXT,
  p_destination TEXT,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_cover_image_url TEXT DEFAULT NULL,
  p_status trip_status DEFAULT 'planning'
)
RETURNS trips
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_trip trips;
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insert the trip
  INSERT INTO trips (title, destination, start_date, end_date, cover_image_url, status)
  VALUES (p_title, p_destination, p_start_date, p_end_date, p_cover_image_url, p_status)
  RETURNING * INTO new_trip;
  
  -- Add the creator as owner
  INSERT INTO trip_collaborators (trip_id, user_id, role)
  VALUES (new_trip.id, current_user_id, 'owner');
  
  RETURN new_trip;
END;
$$;