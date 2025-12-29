import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itineraryService } from '@/services/itineraryService';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ItineraryItemInsert = TablesInsert<'itinerary_items'>;
type ItineraryItemUpdate = TablesUpdate<'itinerary_items'>;

export function useCreateItineraryItem(tripDayId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<ItineraryItemInsert, 'id' | 'created_at'>) =>
      itineraryService.createItem(item),
    onSuccess: () => {
      if (tripDayId) {
        queryClient.invalidateQueries({ queryKey: ['itinerary-items', tripDayId] });
      }
    },
  });
}

export function useUpdateItineraryItem(tripDayId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: ItineraryItemUpdate }) =>
      itineraryService.updateItem(itemId, updates),
    onSuccess: () => {
      if (tripDayId) {
        queryClient.invalidateQueries({ queryKey: ['itinerary-items', tripDayId] });
      }
    },
  });
}

export function useDeleteItineraryItem(tripDayId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itineraryService.deleteItem(itemId),
    onSuccess: () => {
      if (tripDayId) {
        queryClient.invalidateQueries({ queryKey: ['itinerary-items', tripDayId] });
      }
    },
  });
}

export function useGenerateTripDays(tripId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!tripId) throw new Error('Trip ID required');
      return itineraryService.generateTripDays(tripId);
    },
    onSuccess: () => {
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: ['trip-days', tripId] });
      }
    },
  });
}
