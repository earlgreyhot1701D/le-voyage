// Environment configuration for Le Voyage
// Phase 0: All external services are stubbed

export const ENV = {
  // Feature flags
  USE_MOCK_DATA: true,
  ENABLE_AI: false,
  ENABLE_MAPS: false,
  
  // API endpoints (stubbed in Phase 0)
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  MAPBOX_TOKEN: '',
  
  // App configuration
  APP_NAME: 'Le Voyage',
  APP_DESCRIPTION: 'Intelligent Travel Planning',
} as const;

export const isProduction = () => import.meta.env.PROD;
export const isDevelopment = () => import.meta.env.DEV;