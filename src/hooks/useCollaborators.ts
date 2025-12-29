import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '@/services/tripService';

export function useCollaborators(tripId: string | undefined) {
  return useQuery({
    queryKey: ['collaborators', tripId],
    queryFn: () => tripService.getCollaborators(tripId!),
    enabled: !!tripId,
  });
}

export function useInvitations(tripId: string | undefined) {
  return useQuery({
    queryKey: ['invitations', tripId],
    queryFn: () => tripService.getInvitations(tripId!),
    enabled: !!tripId,
  });
}

export function useInviteCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, email, role }: { tripId: string; email: string; role: 'viewer' | 'editor' }) =>
      tripService.inviteCollaborator(tripId, email, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.tripId] });
    },
  });
}

export function useRemoveInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, tripId }: { invitationId: string; tripId: string }) =>
      tripService.removeInvitation(invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.tripId] });
    },
  });
}

export function useRemoveCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      tripService.removeCollaborator(tripId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.tripId] });
    },
  });
}

export function useUpdateCollaboratorRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, userId, role }: { tripId: string; userId: string; role: 'editor' | 'viewer' }) =>
      tripService.updateCollaboratorRole(tripId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.tripId] });
    },
  });
}

export function useInvitationByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => tripService.getInvitationByToken(token!),
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => tripService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
