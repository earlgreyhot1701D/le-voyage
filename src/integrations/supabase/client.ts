import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ixhdadzkztjcdqridqha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aGRhZHprenRqY2RxcmlkcWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTk5MzQsImV4cCI6MjA4MjUzNTkzNH0.15VE0zPYmnFx5GVEueELFigDKA3vF5nrwcYDMRkRmJY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
