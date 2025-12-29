// Environment configuration for Le Voyage
// Phase 0: All external services are stubbed

export const ENV = {
  // Feature flags
  USE_MOCK_DATA: true, // Will switch to false once DB is populated
  ENABLE_AI: false,
  ENABLE_MAPS: false,
  
  // Supabase configuration
  SUPABASE_URL: 'https://ixhdadzkztjcdqridqha.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aGRhZHprenRqY2RxcmlkcWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTk5MzQsImV4cCI6MjA4MjUzNTkzNH0.15VE0zPYmnFx5GVEueELFigDKA3vF5nrwcYDMRkRmJY',
  MAPBOX_TOKEN: '',
  
  // App configuration
  APP_NAME: 'Le Voyage',
  APP_DESCRIPTION: 'Intelligent Travel Planning',
} as const;

export const isProduction = () => import.meta.env.PROD;
export const isDevelopment = () => import.meta.env.DEV;