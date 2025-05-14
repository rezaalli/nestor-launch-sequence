export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          completed_at: string
          created_at: string
          data: Json
          date: string
          id: string
          readiness_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          data: Json
          date: string
          id?: string
          readiness_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          data?: Json
          date?: string
          id?: string
          readiness_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      haptic_settings: {
        Row: {
          created_at: string
          haptics_enabled: boolean
          id: string
          strength: string
          thresholds: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          haptics_enabled?: boolean
          id?: string
          strength?: string
          thresholds?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          haptics_enabled?: boolean
          id?: string
          strength?: string
          thresholds?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lifestyle_logs: {
        Row: {
          created_at: string
          date: string
          energy_level: string | null
          exercise_type: string | null
          id: string
          mood: string | null
          notes: string | null
          sleep_quality: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: string | null
          exercise_type?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          sleep_quality?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: string | null
          exercise_type?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          sleep_quality?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          image_url: string | null
          meal_type: string
          name: string
          nutrition_log_id: string
          protein: number
          timestamp: string
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          image_url?: string | null
          meal_type: string
          name: string
          nutrition_log_id: string
          protein?: number
          timestamp?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          image_url?: string | null
          meal_type?: string
          name?: string
          nutrition_log_id?: string
          protein?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_nutrition_log_id_fkey"
            columns: ["nutrition_log_id"]
            isOneToOne: false
            referencedRelation: "nutrition_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actions: Json | null
          created_at: string
          date: string
          description: string
          icon: string
          icon_bg_color: string
          icon_color: string
          id: string
          read: boolean
          time: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string
          date: string
          description: string
          icon: string
          icon_bg_color: string
          icon_color: string
          id?: string
          read?: boolean
          time: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string
          date?: string
          description?: string
          icon?: string
          icon_bg_color?: string
          icon_color?: string
          id?: string
          read?: boolean
          time?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories_consumed: number
          calories_target: number
          carbs_consumed: number
          carbs_target: number
          created_at: string
          date: string
          fat_consumed: number
          fat_target: number
          id: string
          protein_consumed: number
          protein_target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_consumed?: number
          calories_target?: number
          carbs_consumed?: number
          carbs_target?: number
          created_at?: string
          date?: string
          fat_consumed?: number
          fat_target?: number
          id?: string
          protein_consumed?: number
          protein_target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_consumed?: number
          calories_target?: number
          carbs_consumed?: number
          carbs_target?: number
          created_at?: string
          date?: string
          fat_consumed?: number
          fat_target?: number
          id?: string
          protein_consumed?: number
          protein_target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          onboarding_complete: boolean
          profile_completion_percent: number
          unit_preference: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          onboarding_complete?: boolean
          profile_completion_percent?: number
          unit_preference?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          onboarding_complete?: boolean
          profile_completion_percent?: number
          unit_preference?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
