import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_places",
  title: "Search saved places",
  description: "Search the shared places catalog by name or neighborhood.",
  inputSchema: {
    query: z.string().trim().min(1).max(200).describe("Text to match in name or neighborhood"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const like = `%${query}%`;
    const { data, error } = await supabase
      .from("places")
      .select("id, name, category, arrondissement, neighborhood_name, rating")
      .or(`name.ilike.${like},neighborhood_name.ilike.${like}`)
      .limit(limit ?? 20);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { places: data ?? [] },
    };
  },
});
