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
      daily_reflections: {
        Row: {
          created_at: string
          date: string
          did_well: string | null
          followed_plan: boolean | null
          id: string
          improvement: string | null
          mistake: string | null
          notes: string | null
          screenshot_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          did_well?: string | null
          followed_plan?: boolean | null
          id?: string
          improvement?: string | null
          mistake?: string | null
          notes?: string | null
          screenshot_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          did_well?: string | null
          followed_plan?: boolean | null
          id?: string
          improvement?: string | null
          mistake?: string | null
          notes?: string | null
          screenshot_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_stats: {
        Row: {
          id: string
          total_profit: number
          total_trades: number
          updated_at: string
          user_id: string
          win_rate: number
        }
        Insert: {
          id?: string
          total_profit?: number
          total_trades?: number
          updated_at?: string
          user_id: string
          win_rate?: number
        }
        Update: {
          id?: string
          total_profit?: number
          total_trades?: number
          updated_at?: string
          user_id?: string
          win_rate?: number
        }
        Relationships: []
      }
      mt_accounts: {
        Row: {
          account_label: string
          account_number: string
          broker_name: string
          created_at: string
          id: string
          investor_password: string
          is_active: boolean
          last_synced_at: string | null
          platform: string
          server_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_label?: string
          account_number: string
          broker_name: string
          created_at?: string
          id?: string
          investor_password: string
          is_active?: boolean
          last_synced_at?: string | null
          platform?: string
          server_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_label?: string
          account_number?: string
          broker_name?: string
          created_at?: string
          id?: string
          investor_password?: string
          is_active?: boolean
          last_synced_at?: string | null
          platform?: string
          server_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          last_synced_at: string | null
          myfxbook_account_id: string | null
          myfxbook_account_name: string | null
          myfxbook_balance: number | null
          myfxbook_broker: string | null
          myfxbook_connected: boolean
          myfxbook_gain: number | null
          myfxbook_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_synced_at?: string | null
          myfxbook_account_id?: string | null
          myfxbook_account_name?: string | null
          myfxbook_balance?: number | null
          myfxbook_broker?: string | null
          myfxbook_connected?: boolean
          myfxbook_gain?: number | null
          myfxbook_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_synced_at?: string | null
          myfxbook_account_id?: string | null
          myfxbook_account_name?: string | null
          myfxbook_balance?: number | null
          myfxbook_broker?: string | null
          myfxbook_connected?: boolean
          myfxbook_gain?: number | null
          myfxbook_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          close_time: string | null
          created_at: string
          date: string
          entry_price: number
          exit_price: number
          id: string
          lot_size: number
          mt_account_id: string | null
          myfxbook_trade_id: string | null
          notes: string
          open_time: string | null
          pair: string
          profit_loss: number
          screenshot_url: string | null
          source: string
          stop_loss: number
          strategy: string
          take_profit: number
          ticket: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          date: string
          entry_price: number
          exit_price: number
          id?: string
          lot_size: number
          mt_account_id?: string | null
          myfxbook_trade_id?: string | null
          notes?: string
          open_time?: string | null
          pair: string
          profit_loss: number
          screenshot_url?: string | null
          source?: string
          stop_loss: number
          strategy?: string
          take_profit: number
          ticket?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          date?: string
          entry_price?: number
          exit_price?: number
          id?: string
          lot_size?: number
          mt_account_id?: string | null
          myfxbook_trade_id?: string | null
          notes?: string
          open_time?: string | null
          pair?: string
          profit_loss?: number
          screenshot_url?: string | null
          source?: string
          stop_loss?: number
          strategy?: string
          take_profit?: number
          ticket?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_mt_account_id_fkey"
            columns: ["mt_account_id"]
            isOneToOne: false
            referencedRelation: "mt_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
