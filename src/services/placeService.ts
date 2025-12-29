import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Place = Tables<'places'>;
export type PlaceInsert = TablesInsert<'places'>;
export type PlaceUpdate = TablesUpdate<'places'>;

export const placeService = {
  // Fetch all places for a trip with profile info for attribution
  async getPlaces(tripId: string): Promise<(Place & { added_by_display_name: string | null })[]> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        profiles:added_by (display_name)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform to include display name at top level
    return (data || []).map(place => ({
      ...place,
      added_by_display_name: place.profiles?.display_name || null,
    }));
  },

  // Create a new place
  async createPlace(place: Omit<PlaceInsert, 'id' | 'created_at'>): Promise<Place> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('places')
      .insert({
        ...place,
        added_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing place
  async updatePlace(placeId: string, updates: PlaceUpdate): Promise<Place> {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', placeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a place
  async deletePlace(placeId: string): Promise<void> {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', placeId);

    if (error) throw error;
  },
};
