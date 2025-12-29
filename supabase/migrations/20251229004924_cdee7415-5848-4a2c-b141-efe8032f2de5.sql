-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.trip_status AS ENUM ('planning', 'upcoming', 'in_progress', 'completed');
CREATE TYPE public.place_category AS ENUM ('Food and Drink', 'Museum', 'Attraction', 'Shopping', 'Experience', 'Transit', 'Lodging', 'Day Trip', 'Other');
CREATE TYPE public.collaborator_role AS ENUM ('owner', 'editor', 'viewer');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIPS TABLE
-- =============================================
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status public.trip_status NOT NULL DEFAULT 'planning',
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TRIP COLLABORATORS TABLE
-- =============================================
CREATE TABLE public.trip_collaborators (
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.collaborator_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (trip_id, user_id)
);

ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;

-- Helper function to check trip access
CREATE OR REPLACE FUNCTION public.has_trip_access(_user_id UUID, _trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = _user_id AND trip_id = _trip_id
  )
$$;

-- Helper function to check edit access (owner or editor)
CREATE OR REPLACE FUNCTION public.can_edit_trip(_user_id UUID, _trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = _user_id 
      AND trip_id = _trip_id 
      AND role IN ('owner', 'editor')
  )
$$;

-- Trips policies
CREATE POLICY "Users can view trips they collaborate on"
  ON public.trips FOR SELECT
  USING (public.has_trip_access(auth.uid(), id));

CREATE POLICY "Owners and editors can update trips"
  ON public.trips FOR UPDATE
  USING (public.can_edit_trip(auth.uid(), id));

CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can delete trips"
  ON public.trips FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE user_id = auth.uid() AND trip_id = id AND role = 'owner'
  ));

-- Collaborators policies
CREATE POLICY "Users can view collaborators of their trips"
  ON public.trip_collaborators FOR SELECT
  USING (public.has_trip_access(auth.uid(), trip_id));

CREATE POLICY "Owners can manage collaborators"
  ON public.trip_collaborators FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.trip_collaborators tc
    WHERE tc.user_id = auth.uid() AND tc.trip_id = trip_collaborators.trip_id AND tc.role = 'owner'
  ));

CREATE POLICY "Users can add themselves as owner when creating trip"
  ON public.trip_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'owner');

-- =============================================
-- AREAS TABLE
-- =============================================
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view areas of their trips"
  ON public.areas FOR SELECT
  USING (public.has_trip_access(auth.uid(), trip_id));

CREATE POLICY "Editors can manage areas"
  ON public.areas FOR ALL
  USING (public.can_edit_trip(auth.uid(), trip_id));

-- =============================================
-- PLACES TABLE
-- =============================================
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category public.place_category NOT NULL DEFAULT 'Other',
  arrondissement TEXT,
  neighborhood_name TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  badge TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view places of their trips"
  ON public.places FOR SELECT
  USING (public.has_trip_access(auth.uid(), trip_id));

CREATE POLICY "Editors can manage places"
  ON public.places FOR ALL
  USING (public.can_edit_trip(auth.uid(), trip_id));

-- =============================================
-- TRIP DAYS TABLE
-- =============================================
CREATE TABLE public.trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT,
  neighborhood_focus TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trip days of their trips"
  ON public.trip_days FOR SELECT
  USING (public.has_trip_access(auth.uid(), trip_id));

CREATE POLICY "Editors can manage trip days"
  ON public.trip_days FOR ALL
  USING (public.can_edit_trip(auth.uid(), trip_id));

-- =============================================
-- ITINERARY ITEMS TABLE
-- =============================================
CREATE TABLE public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id UUID NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

-- Helper to get trip_id from trip_day_id
CREATE OR REPLACE FUNCTION public.get_trip_id_from_day(_trip_day_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT trip_id FROM public.trip_days WHERE id = _trip_day_id
$$;

CREATE POLICY "Users can view itinerary items of their trips"
  ON public.itinerary_items FOR SELECT
  USING (public.has_trip_access(auth.uid(), public.get_trip_id_from_day(trip_day_id)));

CREATE POLICY "Editors can manage itinerary items"
  ON public.itinerary_items FOR ALL
  USING (public.can_edit_trip(auth.uid(), public.get_trip_id_from_day(trip_day_id)));

-- =============================================
-- TICKETS TABLE
-- =============================================
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_item_id UUID NOT NULL REFERENCES public.itinerary_items(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Helper to get trip_id from itinerary_item_id
CREATE OR REPLACE FUNCTION public.get_trip_id_from_item(_item_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT td.trip_id 
  FROM public.itinerary_items ii
  JOIN public.trip_days td ON ii.trip_day_id = td.id
  WHERE ii.id = _item_id
$$;

CREATE POLICY "Users can view tickets of their trips"
  ON public.tickets FOR SELECT
  USING (public.has_trip_access(auth.uid(), public.get_trip_id_from_item(itinerary_item_id)));

CREATE POLICY "Editors can manage tickets"
  ON public.tickets FOR ALL
  USING (public.can_edit_trip(auth.uid(), public.get_trip_id_from_item(itinerary_item_id)));

-- =============================================
-- INSIGHTS TABLE
-- =============================================
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  neighborhood_focus TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  action_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights of their trips"
  ON public.insights FOR SELECT
  USING (public.has_trip_access(auth.uid(), trip_id));

CREATE POLICY "Editors can manage insights"
  ON public.insights FOR ALL
  USING (public.can_edit_trip(auth.uid(), trip_id));

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();