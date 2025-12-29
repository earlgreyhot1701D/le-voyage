// Environment configuration for Le Voyage
// Phase 0: All external services are stubbed

export const ENV = {
  // Feature flags
  USE_MOCK_DATA: true, // Will switch to false once DB is populated
  ENABLE_AI: false,
  ENABLE_MAPS: false,
  
  // Supabase configuration
  SUPABASE_URL: 'https://ixhdadzkztjcdqridqha.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_rxzm96plykC5aXOmwQyE5g_If2NzeH3',
  MAPBOX_TOKEN: '',
  
  // App configuration
  APP_NAME: 'Le Voyage',
  APP_DESCRIPTION: 'Intelligent Travel Planning',
} as const;

export const isProduction = () => import.meta.env.PROD;
export const isDevelopment = () => import.meta.env.DEV;