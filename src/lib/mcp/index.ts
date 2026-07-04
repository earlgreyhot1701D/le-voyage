import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listTrips from "./tools/list-trips";
import getTrip from "./tools/get-trip";
import createTrip from "./tools/create-trip";
import searchPlaces from "./tools/search-places";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "le-voyage-mcp",
  title: "Le Voyage",
  version: "0.1.0",
  instructions:
    "Tools for Le Voyage, an intelligent travel planner. Use list_trips to see the user's trips, get_trip for full itinerary details, create_trip to start a new trip, and search_places to browse the saved places catalog.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listTrips, getTrip, createTrip, searchPlaces],
});
