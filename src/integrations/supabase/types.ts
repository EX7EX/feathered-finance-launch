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
      audit_logs: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      blockchains: {
        Row: {
          confirmation_blocks: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          min_withdrawal: number | null
          name: string
          symbol: string
          updated_at: string | null
          updated_by: string | null
          withdrawal_fee: number | null
        }
        Insert: {
          confirmation_blocks?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          min_withdrawal?: number | null
          name: string
          symbol: string
          updated_at?: string | null
          updated_by?: string | null
          withdrawal_fee?: number | null
        }
        Update: {
          confirmation_blocks?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          min_withdrawal?: number | null
          name?: string
          symbol?: string
          updated_at?: string | null
          updated_by?: string | null
          withdrawal_fee?: number | null
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          address: string | null
          address_verified: boolean | null
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
          address_verified?: boolean | null
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
          address_verified?: boolean | null
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
            foreignKeyName: "crypto_wallets_blockchain_fkey"
            columns: ["blockchain"]
            isOneToOne: false
            referencedRelation: "blockchains"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "crypto_wallets_crypto_code_fkey"
            columns: ["crypto_code"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
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
        ]
      }
      p2p_offers: {
        Row: {
          available_amount: number
          created_at: string | null
          crypto_currency: string
          fiat_currency: string
          id: string
          max_amount: number
          min_amount: number
          offer_type: string
          payment_methods: Json
          price: number
          status: string
          terms: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_amount: number
          created_at?: string | null
          crypto_currency: string
          fiat_currency: string
          id?: string
          max_amount: number
          min_amount: number
          offer_type: string
          payment_methods: Json
          price: number
          status: string
          terms?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_amount?: number
          created_at?: string | null
          crypto_currency?: string
          fiat_currency?: string
          id?: string
          max_amount?: number
          min_amount?: number
          offer_type?: string
          payment_methods?: Json
          price?: number
          status?: string
          terms?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_offers_crypto_currency_fkey"
            columns: ["crypto_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "p2p_offers_fiat_currency_fkey"
            columns: ["fiat_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      p2p_trades: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          crypto_currency: string
          dispute_reason: string | null
          dispute_resolved: boolean | null
          fiat_currency: string
          id: string
          offer_id: string
          payment_method_id: string | null
          price: number
          seller_id: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          crypto_currency: string
          dispute_reason?: string | null
          dispute_resolved?: boolean | null
          fiat_currency: string
          id?: string
          offer_id: string
          payment_method_id?: string | null
          price: number
          seller_id: string
          status: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          crypto_currency?: string
          dispute_reason?: string | null
          dispute_resolved?: boolean | null
          fiat_currency?: string
          id?: string
          offer_id?: string
          payment_method_id?: string | null
          price?: number
          seller_id?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_trades_crypto_currency_fkey"
            columns: ["crypto_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "p2p_trades_fiat_currency_fkey"
            columns: ["fiat_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "p2p_trades_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "p2p_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_trades_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          currency_code: string
          details: Json
          id: string
          is_active: boolean | null
          method_type: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code: string
          details: Json
          id?: string
          is_active?: boolean | null
          method_type: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: string
          details?: Json
          id?: string
          is_active?: boolean | null
          method_type?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
        ]
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
          timezone: string | null
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
          timezone?: string | null
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
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      supported_currencies: {
        Row: {
          code: string
          currency_type: string
          exchange_rate_to_usd: number
          id: number
          is_active: boolean
          last_updated: string | null
          name: string
          precision: number
          symbol: string
        }
        Insert: {
          code: string
          currency_type: string
          exchange_rate_to_usd: number
          id?: number
          is_active?: boolean
          last_updated?: string | null
          name: string
          precision?: number
          symbol: string
        }
        Update: {
          code?: string
          currency_type?: string
          exchange_rate_to_usd?: number
          id?: number
          is_active?: boolean
          last_updated?: string | null
          name?: string
          precision?: number
          symbol?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          blockchain: string | null
          created_at: string | null
          currency_code: string
          fee: number | null
          id: string
          metadata: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          transaction_hash: string | null
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          blockchain?: string | null
          created_at?: string | null
          currency_code: string
          fee?: number | null
          id?: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          status: string
          transaction_hash?: string | null
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          blockchain?: string | null
          created_at?: string | null
          currency_code?: string
          fee?: number | null
          id?: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          transaction_hash?: string | null
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_blockchain_fkey"
            columns: ["blockchain"]
            isOneToOne: false
            referencedRelation: "blockchains"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "transactions_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
        ]
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
