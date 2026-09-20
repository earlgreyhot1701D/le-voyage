import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_trip",
  title: "Get trip details",
  description: "Fetch a single trip with its days and itinerary items. Use list_trips first to discover trip IDs.",
  inputSchema: {
    trip_id: z.string().uuid().describe("Trip UUID from list_trips"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ trip_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: trip, error: tripErr } = await supabase
      .from("trips")
      .select("*")
      .eq("id", trip_id)
      .maybeSingle();
    if (tripErr || !trip) {
      return { content: [{ type: "text", text: tripErr?.message ?? "Trip not found" }], isError: true };
    }
    const { data: days } = await supabase
      .from("trip_days")
      .select("id, day_number, date, title, neighborhood_focus")
      .eq("trip_id", trip_id)
      .order("day_number");
    const dayIds = (days ?? []).map((d) => d.id);
    let items: unknown[] = [];
    if (dayIds.length) {
      const { data } = await supabase
        .from("itinerary_items")
        .select("id, trip_day_id, title, start_time, end_time, notes, place_id")
        .in("trip_day_id", dayIds);
      items = data ?? [];
    }
    const result = { trip, days: days ?? [], items };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
