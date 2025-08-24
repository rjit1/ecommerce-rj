import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client component client
export const supabase = createClientComponentClient()
export const createSupabaseClient = () => createClientComponentClient()

// Server component client (only call this in server components)
export const createSupabaseServerClient = () => {
  // Import cookies only when needed in server context
  const { cookies } = require('next/headers')
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Service role client (for admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Database types
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'super_admin'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'super_admin'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'super_admin'
          is_active?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          specifications: string | null
          category_id: string | null
          price: number
          discount_price: number | null
          is_featured: boolean
          is_trending: boolean
          is_hot_sale: boolean
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          specifications?: string | null
          category_id?: string | null
          price: number
          discount_price?: number | null
          is_featured?: boolean
          is_trending?: boolean
          is_hot_sale?: boolean
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          specifications?: string | null
          category_id?: string | null
          price?: number
          discount_price?: number | null
          is_featured?: boolean
          is_trending?: boolean
          is_hot_sale?: boolean
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          color_code: string | null
          stock_quantity: number
          sku: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color: string
          color_code?: string | null
          stock_quantity?: number
          sku?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color?: string
          color_code?: string | null
          stock_quantity?: number
          sku?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: 'online' | 'cod'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address_line_1: string
          shipping_address_line_2: string | null
          shipping_city: string
          shipping_state: string
          shipping_postal_code: string
          shipping_country: string
          subtotal: number
          discount_amount: number
          applied_delivery_fee: number
          total_amount: number
          coupon_code: string | null
          coupon_discount: number
          created_at: string
          updated_at: string
          delivered_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: 'online' | 'cod'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address_line_1: string
          shipping_address_line_2?: string | null
          shipping_city: string
          shipping_state: string
          shipping_postal_code: string
          shipping_country?: string
          subtotal: number
          discount_amount?: number
          applied_delivery_fee?: number
          total_amount: number
          coupon_code?: string | null
          coupon_discount?: number
          created_at?: string
          updated_at?: string
          delivered_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method?: 'online' | 'cod'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          shipping_address_line_1?: string
          shipping_address_line_2?: string | null
          shipping_city?: string
          shipping_state?: string
          shipping_postal_code?: string
          shipping_country?: string
          subtotal?: number
          discount_amount?: number
          applied_delivery_fee?: number
          total_amount?: number
          coupon_code?: string | null
          coupon_discount?: number
          created_at?: string
          updated_at?: string
          delivered_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          product_image: string | null
          size: string
          color: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          product_image?: string | null
          size: string
          color: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          product_image?: string | null
          size?: string
          color?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          address_line_1: string
          address_line_2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount: number
          max_discount_amount: number | null
          usage_limit: number | null
          used_count: number
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_order_amount?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string | null
          subtitle: string | null
          image_url: string
          link_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          subtitle?: string | null
          image_url: string
          link_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          subtitle?: string | null
          image_url?: string
          link_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}