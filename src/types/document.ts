export interface TravelDocument {
  id: string;
  user_id: string;
  trip_id: string | null;
  document_type: 'passport' | 'visa' | 'ticket' | 'reservation' | 'insurance' | 'other';
  title: string;
  file_url: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}