export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          phone: string | null
          role: 'admin' | 'accountant' | 'tenant' | 'chef'
          room_number: string | null
          balance: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          phone?: string | null
          role?: 'admin' | 'accountant' | 'tenant' | 'chef'
          room_number?: string | null
          balance?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          phone?: string | null
          role?: 'admin' | 'accountant' | 'tenant' | 'chef'
          room_number?: string | null
          balance?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          meal_type: 'lunch' | 'dinner'
          is_available: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          meal_type: 'lunch' | 'dinner'
          is_available?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          meal_type?: 'lunch' | 'dinner'
          is_available?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          menu_item_id: string
          order_date: string
          meal_type: 'lunch' | 'dinner'
          quantity: number
          amount_paid: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          menu_item_id: string
          order_date: string
          meal_type: 'lunch' | 'dinner'
          quantity?: number
          amount_paid?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          menu_item_id?: string
          order_date?: string
          meal_type?: 'lunch' | 'dinner'
          quantity?: number
          amount_paid?: number
          created_at?: string
        }
      }
    }
  }
}
