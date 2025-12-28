export interface ItineraryItem {
  id: string;
  trip_day_id: string;
  place_id: string | null;
  time: string;
  title: string;
  description: string;
  notes: string | null;
  added_by_display_name: string | null;
  ticket: { id: string; pdf_url: string } | null;
}
