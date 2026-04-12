// Hand-written types for RPCs not yet present in the auto-generated types.ts.
// After running `supabase gen types typescript`, refresh types.ts and remove
// these declarations.
import type { Database } from './types';

export type RegeneratedInvitation = {
  id: string;
  trip_id: string;
  email: string;
  role: Database['public']['Enums']['collaborator_role'];
  token: string;
  expires_at: string;
};
