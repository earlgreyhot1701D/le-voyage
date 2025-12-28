export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'upcoming' | 'in_progress' | 'completed';
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  date: string;
  day_number: number;
  title: string | null;
  label?: string;
  neighborhood_focus?: string;
}

export interface TripActivity {
  id: string;
  trip_day_id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  category: 'food' | 'activity' | 'transport' | 'accommodation' | 'other';
  order_index: number;
  notes: string | null;
}