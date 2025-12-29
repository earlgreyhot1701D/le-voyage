import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type CollaboratorRole = Tables<'trip_collaborators'>['role'];

interface TripPermissions {
  role: CollaboratorRole | null;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

export function useTripPermissions(tripId: string | undefined): TripPermissions {
  const { user } = useAuth();

  const { data: collaborator, isLoading } = useQuery({
    queryKey: ['trip-permissions', tripId, user?.id],
    queryFn: async () => {
      if (!tripId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('trip_collaborators')
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!tripId && !!user?.id,
  });

  const role = collaborator?.role ?? null;
  const isOwner = role === 'owner';
  const canEdit = role === 'owner' || role === 'editor';
  const canDelete = isOwner;

  return {
    role,
    isOwner,
    canEdit,
    canDelete,
    isLoading,
  };
}
