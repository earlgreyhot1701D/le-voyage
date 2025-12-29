import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
const PlaceSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(500),
  category: z.string().max(100),
  arrondissement: z.string().max(100).optional(),
  neighborhood_name: z.string().max(200).optional(),
  rating: z.number().min(0).max(5).optional(),
});

const GenerateInsightsSchema = z.object({
  tripId: z.string().uuid(),
  neighborhoodFocus: z.string().max(200),
  places: z.array(PlaceSchema).min(1).max(100),
  tripTitle: z.string().max(200).optional(),
  destination: z.string().max(200).optional(),
});

type Place = z.infer<typeof PlaceSchema>;

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Reject requests from non-allowed origins
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    console.warn(`[generate-insights] Rejected request from origin: ${origin}`);
    return new Response('Forbidden', { status: 403 });
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('[generate-insights] ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = GenerateInsightsSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.warn('[generate-insights] Invalid input:', parseResult.error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid input parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tripId, neighborhoodFocus, places, tripTitle, destination } = parseResult.data;

    console.log(`[generate-insights] Trip ${tripId}, neighborhood: ${neighborhoodFocus}, places: ${places.length}`);

    // Group places by category for analysis
    const placesByCategory: Record<string, Place[]> = {};
    places.forEach(place => {
      if (!placesByCategory[place.category]) {
        placesByCategory[place.category] = [];
      }
      placesByCategory[place.category].push(place);
    });

    const placeSummary = Object.entries(placesByCategory)
      .map(([cat, ps]) => `${cat}: ${ps.map(p => p.name).join(', ')}`)
      .join('\n');

    const systemPrompt = `You are a helpful travel planning assistant for Le Voyage, an intelligent trip planner. 
Your role is to provide thoughtful, actionable suggestions based on the user's saved places.

Key principles:
- Only suggest things based on places the user has already saved (no external discovery)
- Be concise and specific
- Focus on practical groupings, timing, and logistics
- Explain WHY you're making each suggestion
- Never override user preferences - only suggest

Respond with a JSON array of 1-3 insights, each with:
- title: Short, catchy title (max 8 words)
- content: The suggestion with clear reasoning (2-3 sentences)
- action_label: Optional button text for a follow-up action (e.g., "Group these places")`;

    const userPrompt = `Trip: "${tripTitle || 'My Trip'}" to ${destination || 'a destination'}
Current neighborhood focus: ${neighborhoodFocus || 'Not set'}

User's saved places:
${placeSummary}

Based on these places, provide 1-3 helpful insights about:
- Logical groupings by proximity or theme
- Timing suggestions (e.g., "Visit the museum before the café next door")
- Potential gaps or opportunities they might consider

Remember: Only reference places they've already saved. Be helpful, not prescriptive.`;

    console.log('[generate-insights] Calling Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-insights] Claude API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate insights' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[generate-insights] Claude response received');

    // Extract the text content
    const textContent = data.content?.find((c: { type: string }) => c.type === 'text')?.text || '[]';
    
    // Parse the JSON from the response
    let insights = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[generate-insights] Failed to parse insights JSON:', parseError);
      // Fallback: create a single insight from the text
      insights = [{
        title: 'Travel Tip',
        content: textContent.slice(0, 200),
        action_label: null
      }];
    }

    // Validate and clean insights
    insights = insights.slice(0, 3).map((insight: { title?: string; content?: string; action_label?: string }) => ({
      title: insight.title || 'Suggestion',
      content: insight.content || '',
      action_label: insight.action_label || null,
      neighborhood_focus: neighborhoodFocus,
    }));

    console.log(`[generate-insights] Generated ${insights.length} insights`);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-insights] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
