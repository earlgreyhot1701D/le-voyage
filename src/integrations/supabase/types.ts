export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          created_at: string
          id: string
          name: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          action_label: string | null
          content: string
          created_at: string
          id: string
          neighborhood_focus: string
          title: string
          trip_id: string
        }
        Insert: {
          action_label?: string | null
          content: string
          created_at?: string
          id?: string
          neighborhood_focus: string
          title: string
          trip_id: string
        }
        Update: {
          action_label?: string | null
          content?: string
          created_at?: string
          id?: string
          neighborhood_focus?: string
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["collaborator_role"]
          token: string
          trip_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          token?: string
          trip_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          token?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          added_by: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          order_index: number
          place_id: string | null
          time: string
          title: string
          trip_day_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id?: string | null
          time: string
          title: string
          trip_day_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id?: string | null
          time?: string
          title?: string
          trip_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          added_by: string | null
          area_id: string | null
          arrondissement: string | null
          badge: string | null
          category: Database["public"]["Enums"]["place_category"]
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood_name: string | null
          rating: number | null
          trip_id: string
        }
        Insert: {
          added_by?: string | null
          area_id?: string | null
          arrondissement?: string | null
          badge?: string | null
          category?: Database["public"]["Enums"]["place_category"]
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood_name?: string | null
          rating?: number | null
          trip_id: string
        }
        Update: {
          added_by?: string | null
          area_id?: string | null
          arrondissement?: string | null
          badge?: string | null
          category?: Database["public"]["Enums"]["place_category"]
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood_name?: string | null
          rating?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          itinerary_item_id: string
          pdf_url: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          itinerary_item_id: string
          pdf_url: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          itinerary_item_id?: string
          pdf_url?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_itinerary_item_id_fkey"
            columns: ["itinerary_item_id"]
            isOneToOne: false
            referencedRelation: "itinerary_items"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_collaborators: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["collaborator_role"]
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_collaborators_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_days: {
        Row: {
          created_at: string
          date: string
          day_number: number
          id: string
          neighborhood_focus: string | null
          title: string | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          date: string
          day_number: number
          id?: string
          neighborhood_focus?: string | null
          title?: string | null
          trip_id: string
        }
        Update: {
          created_at?: string
          date?: string
          day_number?: number
          id?: string
          neighborhood_focus?: string | null
          title?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_image_url: string | null
          created_at: string
          destination: string
          end_date: string | null
          id: string
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          destination: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          destination?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: boolean }
      can_edit_trip: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      create_trip_with_owner: {
        Args: {
          p_cover_image_url?: string
          p_destination: string
          p_end_date?: string
          p_start_date?: string
          p_status?: Database["public"]["Enums"]["trip_status"]
          p_title: string
        }
        Returns: {
          cover_image_url: string | null
          created_at: string
          destination: string
          end_date: string | null
          id: string
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "trips"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_trip_days: { Args: { p_trip_id: string }; Returns: undefined }
      get_trip_id_from_day: { Args: { _trip_day_id: string }; Returns: string }
      get_trip_id_from_item: { Args: { _item_id: string }; Returns: string }
      has_trip_access: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      collaborator_role: "owner" | "editor" | "viewer"
      place_category:
        | "Food and Drink"
        | "Museum"
        | "Attraction"
        | "Shopping"
        | "Experience"
        | "Transit"
        | "Lodging"
        | "Day Trip"
        | "Other"
      trip_status: "planning" | "upcoming" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collaborator_role: ["owner", "editor", "viewer"],
      place_category: [
        "Food and Drink",
        "Museum",
        "Attraction",
        "Shopping",
        "Experience",
        "Transit",
        "Lodging",
        "Day Trip",
        "Other",
      ],
      trip_status: ["planning", "upcoming", "in_progress", "completed"],
    },
  },
} as const
