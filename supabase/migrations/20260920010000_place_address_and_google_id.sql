-- Keep the address shown in search results and the stable Google identity.
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS google_place_id text;

CREATE UNIQUE INDEX IF NOT EXISTS places_trip_google_place_id_key
  ON public.places (trip_id, google_place_id)
  WHERE google_place_id IS NOT NULL;
