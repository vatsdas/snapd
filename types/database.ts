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
      products: {
        Row: {
          id: string
          name: string
          scent: string
          intensity: 'mild' | 'medium' | 'extreme'
          type: 'starter' | 'refill' | 'bundle'
          price_cents: number
          stripe_price_id: string
          description: string
          in_stock: boolean
          created_at: string
        }
        Insert: {
          name: string
          scent: string
          intensity: 'mild' | 'medium' | 'extreme'
          type: 'starter' | 'refill' | 'bundle'
          price_cents: number
          stripe_price_id: string
          description: string
          in_stock: boolean
        }
        Update: {
          id?: string
          name?: string
          scent?: string
          intensity?: 'mild' | 'medium' | 'extreme'
          type?: 'starter' | 'refill' | 'bundle'
          price_cents?: number
          stripe_price_id?: string
          description?: string
          in_stock?: boolean
          created_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          email: string
          full_name: string
          stripe_customer_id: string
          created_at: string
        }
        Insert: {
          email: string
          full_name: string
          stripe_customer_id: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          stripe_customer_id?: string
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          stripe_session_id: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents: number
          created_at: string
        }
        Insert: {
          customer_id: string
          stripe_session_id: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents: number
        }
        Update: {
          id?: string
          customer_id?: string
          stripe_session_id?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents?: number
          created_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_cents: number
        }
        Insert: {
          order_id: string
          product_id: string
          quantity: number
          price_cents: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_cents?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: 'active' | 'cancelled' | 'past_due' | 'paused'
          current_period_end: string
          created_at: string
        }
        Insert: {
          customer_id: string
          product_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: 'active' | 'cancelled' | 'past_due' | 'paused'
          current_period_end: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          stripe_subscription_id?: string
          stripe_price_id?: string
          status?: 'active' | 'cancelled' | 'past_due' | 'paused'
          current_period_end?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | {
    schema: keyof Database
  },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | {
    schema: keyof Database
  },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Products = Database['public']['Tables']['products']['Row']
export type ProductsInsert = Database['public']['Tables']['products']['Insert']
export type ProductsUpdate = Database['public']['Tables']['products']['Update']

export type Customers = Database['public']['Tables']['customers']['Row']
export type CustomersInsert = Database['public']['Tables']['customers']['Insert']
export type CustomersUpdate = Database['public']['Tables']['customers']['Update']

export type Orders = Database['public']['Tables']['orders']['Row']
export type OrdersInsert = Database['public']['Tables']['orders']['Insert']
export type OrdersUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItems = Database['public']['Tables']['order_items']['Row']
export type OrderItemsInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderItemsUpdate = Database['public']['Tables']['order_items']['Update']

export type Subscriptions = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionsInsert =
  Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionsUpdate =
  Database['public']['Tables']['subscriptions']['Update']

