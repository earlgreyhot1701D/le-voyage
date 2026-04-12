import { createClient } from '@supabase/supabase-js';

// Read from Vite env vars so we can point at staging/prod without a code change.
// The anon key is safe to expose in the client bundle, but pinning it in source
// prevents per-env overrides — keep this in .env / deploy secrets.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
