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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      crypto_wallets: {
        Row: {
          address: string | null
          address_verified: boolean
          balance: number
          blockchain: string | null
          created_at: string | null
          crypto_code: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          address_verified?: boolean
          balance?: number
          blockchain?: string | null
          created_at?: string | null
          crypto_code: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          address_verified?: boolean
          balance?: number
          blockchain?: string | null
          created_at?: string | null
          crypto_code?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_wallets_crypto_code_fkey"
            columns: ["crypto_code"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "crypto_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fiat_accounts: {
        Row: {
          available_balance: number
          balance: number
          created_at: string | null
          currency_code: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_balance?: number
          balance?: number
          created_at?: string | null
          currency_code: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_balance?: number
          balance?: number
          created_at?: string | null
          currency_code?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiat_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "fiat_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiat_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_scores: {
        Row: {
          chickens_defeated: number | null
          created_at: string | null
          id: string
          level: number
          longest_combo: number | null
          score: number
          user_id: string
        }
        Insert: {
          chickens_defeated?: number | null
          created_at?: string | null
          id?: string
          level?: number
          longest_combo?: number | null
          score: number
          user_id: string
        }
        Update: {
          chickens_defeated?: number | null
          created_at?: string | null
          id?: string
          level?: number
          longest_combo?: number | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_cache: {
        Row: {
          coin_id: string
          current_price: number
          image: string | null
          market_cap: number | null
          price_change_percentage_24h: number | null
          symbol: string
          total_volume: number | null
          updated_at: string | null
        }
        Insert: {
          coin_id: string
          current_price?: number
          image?: string | null
          market_cap?: number | null
          price_change_percentage_24h?: number | null
          symbol: string
          total_volume?: number | null
          updated_at?: string | null
        }
        Update: {
          coin_id?: string
          current_price?: number
          image?: string | null
          market_cap?: number | null
          price_change_percentage_24h?: number | null
          symbol?: string
          total_volume?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          id: string
          kyc_level: string | null
          kyc_reference_id: string | null
          kyc_verified: boolean | null
          last_login: string | null
          locale: string | null
          phone: string | null
          points: number | null
          timezone: string | null
          total_trades: number | null
          total_volume_usd: number | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          kyc_level?: string | null
          kyc_reference_id?: string | null
          kyc_verified?: boolean | null
          last_login?: string | null
          locale?: string | null
          phone?: string | null
          points?: number | null
          timezone?: string | null
          total_trades?: number | null
          total_volume_usd?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          kyc_level?: string | null
          kyc_reference_id?: string | null
          kyc_verified?: boolean | null
          last_login?: string | null
          locale?: string | null
          phone?: string | null
          points?: number | null
          timezone?: string | null
          total_trades?: number | null
          total_volume_usd?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      supported_currencies: {
        Row: {
          code: string
          created_at: string | null
          decimals: number
          exchange_rate_to_usd: number
          icon_url: string | null
          is_active: boolean
          name: string
          symbol: string
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          decimals?: number
          exchange_rate_to_usd?: number
          icon_url?: string | null
          is_active?: boolean
          name: string
          symbol: string
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          decimals?: number
          exchange_rate_to_usd?: number
          icon_url?: string | null
          is_active?: boolean
          name?: string
          symbol?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trade_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          pair: string
          price: number
          side: string
          status: string | null
          total: number
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          pair: string
          price: number
          side: string
          status?: string | null
          total: number
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          pair?: string
          price?: number
          side?: string
          status?: string | null
          total?: number
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          id: string | null
          points: number | null
          total_trades: number | null
          total_volume_usd: number | null
          username: string | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
