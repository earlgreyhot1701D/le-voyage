import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ItineraryItem = Tables<'itinerary_items'>;
type ItineraryItemInsert = TablesInsert<'itinerary_items'>;
type ItineraryItemUpdate = TablesUpdate<'itinerary_items'>;

export const itineraryService = {
  async getItems(tripDayId: string): Promise<ItineraryItem[]> {
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*, profiles:added_by(display_name)')
      .eq('trip_day_id', tripDayId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createItem(item: Omit<ItineraryItemInsert, 'id' | 'created_at'>): Promise<ItineraryItem> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert({
        ...item,
        added_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(itemId: string, updates: ItineraryItemUpdate): Promise<ItineraryItem> {
    const { data, error } = await supabase
      .from('itinerary_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async reorderItems(tripDayId: string, itemIds: string[]): Promise<void> {
    // Update order_index for each item
    const updates = itemIds.map((id, index) => 
      supabase
        .from('itinerary_items')
        .update({ order_index: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  },

  // Generate trip days from start/end dates
  async generateTripDays(tripId: string): Promise<void> {
    const { error } = await supabase.rpc('generate_trip_days', { p_trip_id: tripId });
    if (error) throw error;
  }
};
