import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_trip",
  title: "Create trip",
  description: "Create a new trip for the signed-in user. The caller becomes the owner.",
  inputSchema: {
    title: z.string().trim().min(1).max(200).describe("Trip name"),
    destination: z.string().trim().min(1).max(200).describe("Destination city or region"),
    start_date: z.string().date().optional().describe("YYYY-MM-DD start date"),
    end_date: z.string().date().optional().describe("YYYY-MM-DD end date"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, destination, start_date, end_date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.rpc("create_trip_with_owner", {
      p_title: title,
      p_destination: destination,
      p_start_date: start_date ?? null,
      p_end_date: end_date ?? null,
    });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Created trip: ${JSON.stringify(data)}` }],
      structuredContent: { trip: data },
    };
  },
});
