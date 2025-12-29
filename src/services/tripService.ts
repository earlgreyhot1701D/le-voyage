import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Trip = Tables<'trips'>;
export type TripInsert = TablesInsert<'trips'>;
export type TripUpdate = TablesUpdate<'trips'>;
export type TripDay = Tables<'trip_days'>;
export type TripCollaborator = Tables<'trip_collaborators'>;

export const tripService = {
  // Fetch all trips the current user has access to
  async getTrips(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Fetch a single trip by ID
  async getTrip(tripId: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create a new trip and add owner as collaborator atomically
  async createTrip(trip: Omit<TripInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> {
    const { data, error } = await supabase
      .rpc('create_trip_with_owner', {
        p_title: trip.title,
        p_destination: trip.destination,
        p_start_date: trip.start_date || null,
        p_end_date: trip.end_date || null,
        p_cover_image_url: trip.cover_image_url || null,
        p_status: trip.status || 'planning',
      });

    if (error) throw error;
    return data as Trip;
  },

  // Update an existing trip
  async updateTrip(tripId: string, updates: TripUpdate): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a trip (owner only - enforced by RLS)
  async deleteTrip(tripId: string): Promise<void> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
  },

  // Fetch trip days for a trip
  async getTripDays(tripId: string): Promise<TripDay[]> {
    const { data, error } = await supabase
      .from('trip_days')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Fetch itinerary items for a trip day with profile info for attribution
  async getItineraryItems(tripDayId: string) {
    const { data, error } = await supabase
      .from('itinerary_items')
      .select(`
        *,
        profiles:added_by (display_name)
      `)
      .eq('trip_day_id', tripDayId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Fetch insights for a trip
  async getInsights(tripId: string) {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('trip_id', tripId);

    if (error) throw error;
    return data || [];
  },
};
