import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placeService } from '@/services/placeService';
import type { PlaceInsert, PlaceUpdate } from '@/services/placeService';

export function usePlaces(tripId: string | undefined) {
  return useQuery({
    queryKey: ['places', tripId],
    queryFn: () => placeService.getPlaces(tripId!),
    enabled: !!tripId,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (place: Omit<PlaceInsert, 'id' | 'created_at'>) =>
      placeService.createPlace(place),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['places', data.trip_id] });
    },
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ placeId, updates }: { placeId: string; updates: PlaceUpdate }) =>
      placeService.updatePlace(placeId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['places', data.trip_id] });
    },
  });
}

export function useDeletePlace(tripId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeService.deletePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places', tripId] });
    },
  });
}
