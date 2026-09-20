import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.supabase\.co$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function getAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  
  for (const pattern of ALLOWED_ORIGIN_PATTERNS) {
    if (pattern.test(requestOrigin)) {
      return requestOrigin;
    }
  }
  return null;
}

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Input validation schema
const SearchPlacesSchema = z.object({
  query: z.string().min(1).max(500),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  lat: number;
  lng: number;
  types: string[];
  photoUrl: string | null;
  priceLevel: number | null;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Reject requests from non-allowed origins
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    console.warn(`[search-places] Rejected request from origin: ${origin}`);
    return new Response('Forbidden', { status: 403 });
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !anonKey) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const userResponse = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: { authorization: authHeader, apikey: anonKey },
    });
    if (!userResponse.ok) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('[search-places] GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = SearchPlacesSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.warn('[search-places] Invalid input:', parseResult.error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid input parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, location } = parseResult.data;

    console.log(`[search-places] Searching for: "${query}" near ${location?.lat ?? 'default'}, ${location?.lng ?? 'default'}`);

    // Build the Text Search URL
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    if (location) {
      url.searchParams.set('location', location.lat + ',' + location.lng);
      url.searchParams.set('radius', '10000');
    }
    url.searchParams.set('key', apiKey);

    console.log(`[search-places] Calling Google Places API`);
    
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`[search-places] Google API error: ${data.status}`, data.error_message);
      return new Response(
        JSON.stringify({ error: 'Failed to search places' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[search-places] Found ${data.results?.length || 0} results`);

    // Transform results
    const places: PlaceResult[] = (data.results || []).slice(0, 10).map((place: any) => {
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity || '',
        rating: place.rating || null,
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0,
        types: place.types || [],
        // Never send the server-side API key to the browser in a photo URL.
        photoUrl: null,
        priceLevel: place.price_level ?? null,
      };
    });

    return new Response(
      JSON.stringify({ places }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[search-places] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
