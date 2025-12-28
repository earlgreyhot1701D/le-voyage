// AI Service Stub - Phase 0
// This will connect to OpenAI/Claude in Phase 2

export interface AIItinerarySuggestion {
  title: string;
  description: string;
  duration_hours: number;
  category: string;
}

export interface AINeighborhoodInsight {
  summary: string;
  best_for: string[];
  local_tips: string[];
}

export const aiService = {
  async generateItinerarySuggestions(
    _destination: string,
    _preferences: string[]
  ): Promise<AIItinerarySuggestion[]> {
    // Stub: Returns empty in Phase 0
    console.log('[AI Service] generateItinerarySuggestions called - stubbed in Phase 0');
    return [];
  },

  async getNeighborhoodInsights(_neighborhoodId: string): Promise<AINeighborhoodInsight | null> {
    // Stub: Returns null in Phase 0
    console.log('[AI Service] getNeighborhoodInsights called - stubbed in Phase 0');
    return null;
  },

  async refineItinerary(_tripId: string, _feedback: string): Promise<void> {
    // Stub: No-op in Phase 0
    console.log('[AI Service] refineItinerary called - stubbed in Phase 0');
  },
};