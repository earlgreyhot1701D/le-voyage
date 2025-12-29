import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

interface PlaceSearchRequest {
  query: string;
  location?: { lat: number; lng: number };
}

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

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('[search-places] GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { query, location } = body as PlaceSearchRequest;
    
    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and limit query length
    const sanitizedQuery = query.trim().slice(0, 200);

    console.log(`[search-places] Searching for: "${sanitizedQuery}" near ${location?.lat}, ${location?.lng}`);

    // Default to Paris if no location provided
    const searchLat = location?.lat || 48.8566;
    const searchLng = location?.lng || 2.3522;

    // Build the Text Search URL
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', sanitizedQuery);
    url.searchParams.set('location', `${searchLat},${searchLng}`);
    url.searchParams.set('radius', '10000'); // 10km radius
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
      let photoUrl = null;
      if (place.photos && place.photos.length > 0) {
        const photoRef = place.photos[0].photo_reference;
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
      }

      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity || '',
        rating: place.rating || null,
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0,
        types: place.types || [],
        photoUrl,
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
