import { supabase } from '@/integrations/supabase/client';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types';
import type { RegeneratedInvitation } from '@/integrations/supabase/extra-rpcs';

export type Trip = Tables<'trips'>;
export type TripInsert = TablesInsert<'trips'>;
export type TripUpdate = TablesUpdate<'trips'>;
export type TripDay = Tables<'trip_days'>;
export type TripCollaborator = Tables<'trip_collaborators'>;
export type Invitation = Tables<'invitations'>;

export interface CollaboratorWithProfile extends TripCollaborator {
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface InvitationWithInviter extends Invitation {
  profiles: {
    display_name: string | null;
  } | null;
}

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

  // ============= COLLABORATION METHODS =============

  // Get all collaborators for a trip with their profile info
  async getCollaborators(tripId: string): Promise<CollaboratorWithProfile[]> {
    const { data, error } = await supabase
      .from('trip_collaborators')
      .select(`
        *,
        profiles:user_id (display_name, avatar_url)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as CollaboratorWithProfile[];
  },

  // Get pending invitations for a trip
  async getInvitations(tripId: string): Promise<InvitationWithInviter[]> {
    // Query invitations without profile join to avoid auth.users access issue
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('trip_id', tripId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!invitations || invitations.length === 0) return [];

    // Fetch inviter profiles separately
    const inviterIds = [...new Set(invitations.map(inv => inv.invited_by))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', inviterIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return invitations.map(inv => ({
      ...inv,
      profiles: profileMap.get(inv.invited_by) || null,
    })) as InvitationWithInviter[];
  },

  // Invite a collaborator by email. Best-effort: also dispatches the
  // invitation email via the send-invitation Edge Function. The DB row is
  // the source of truth; an email failure is logged but does not roll back
  // the invitation, so the inviter can still copy the link from the UI.
  async inviteCollaborator(
    tripId: string,
    email: string,
    role: 'viewer' | 'editor'
  ): Promise<Invitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        trip_id: tripId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This email has already been invited');
      }
      throw error;
    }

    try {
      await this.sendInvitationEmail(data.id);
    } catch (sendErr) {
      console.warn(
        '[tripService.inviteCollaborator] Invitation row created but email delivery failed:',
        sendErr,
      );
    }

    return data;
  },

  // Remove an invitation
  async removeInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
  },

  // Remove a collaborator from a trip
  async removeCollaborator(tripId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('trip_collaborators')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Update a collaborator's role
  async updateCollaboratorRole(
    tripId: string,
    userId: string,
    role: 'editor' | 'viewer'
  ): Promise<void> {
    const { error } = await supabase
      .from('trip_collaborators')
      .update({ role })
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get invitation by token (for accept flow) using SECURITY DEFINER function
  async getInvitationByToken(token: string): Promise<Partial<Invitation> | null> {
    const { data, error } = await supabase
      .rpc('get_invitation_by_token', { _token: token })
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Accept an invitation
  async acceptInvitation(token: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('accept_invitation', { p_token: token });

    if (error) throw error;
    return data as boolean;
  },

  // Rotate a pending invitation's token + refresh its expiry. Owner-only,
  // enforced inside the SECURITY DEFINER RPC. Required because the
  // "Invitations cannot be updated" RLS policy blocks any direct UPDATE.
  async regenerateInvitationToken(invitationId: string): Promise<RegeneratedInvitation> {
    type RpcCall = (
      fn: 'regenerate_invitation_token',
      args: { p_invitation_id: string },
    ) => Promise<{ data: RegeneratedInvitation[] | null; error: Error | null }>;
    const rpc = supabase.rpc as unknown as RpcCall;
    const { data, error } = await rpc('regenerate_invitation_token', {
      p_invitation_id: invitationId,
    });
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Failed to regenerate invitation');
    }
    return data[0];
  },

  // Send (or re-send) an invitation email by invoking the Edge Function.
  async sendInvitationEmail(invitationId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('send-invitation', {
      body: {
        invitationId,
        appOrigin: window.location.origin,
      },
    });
    if (error) throw error;
  },

  // Re-send an invitation: rotate the token (so the previous link is
  // invalidated) and dispatch a fresh email.
  async resendInvitation(invitationId: string): Promise<RegeneratedInvitation> {
    const refreshed = await this.regenerateInvitationToken(invitationId);
    await this.sendInvitationEmail(refreshed.id);
    return refreshed;
  },
};
