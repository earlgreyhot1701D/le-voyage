import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '@/services/tripService';
import type { TripInsert, TripUpdate } from '@/services/tripService';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: tripService.getTrips,
  });
}

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getTrip(tripId!),
    enabled: !!tripId,
  });
}

export function useTripDays(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-days', tripId],
    queryFn: () => tripService.getTripDays(tripId!),
    enabled: !!tripId,
  });
}

export function useItineraryItems(tripDayId: string | undefined) {
  return useQuery({
    queryKey: ['itinerary-items', tripDayId],
    queryFn: () => tripService.getItineraryItems(tripDayId!),
    enabled: !!tripDayId,
  });
}

export function useInsights(tripId: string | undefined) {
  return useQuery({
    queryKey: ['insights', tripId],
    queryFn: () => tripService.getInsights(tripId!),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trip: Omit<TripInsert, 'id' | 'created_at' | 'updated_at'>) =>
      tripService.createTrip(trip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, updates }: { tripId: string; updates: TripUpdate }) =>
      tripService.updateTrip(tripId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', data.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripService.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
