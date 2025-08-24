// Admin Types
export interface AdminUser {
  id: string
  user_id: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  created_at: string
}

// Product Types
export interface Product {
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
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
  featured_image?: string
  total_stock?: number
  is_low_stock?: boolean
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  display_order: number
  created_at: string
}

export interface ProductVariant {
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

// Category Types
export interface Category {
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

// Banner Types
export interface Banner {
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

// Site Settings Types
export interface SiteSetting {
  id: string
  key: string
  value: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  delivery_fee: number
  free_delivery_threshold: number
  estimated_delivery_text: string
  top_header_text: string
  top_header_enabled: boolean
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  whatsapp_number: string
}

// User Types
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface UserAddress {
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

// Order Types
export interface Order {
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
  items?: OrderItem[]
  order_items?: OrderItem[]
}

export interface OrderItem {
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

// Coupon Types
export interface Coupon {
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

// Dashboard Stats Types
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  lowStockProducts: number
  pendingOrders: number
  todayOrders: number
  todayRevenue: number
  monthlyRevenue: number[]
  recentOrders: Order[]
  topProducts: Array<{
    product_name: string
    total_quantity: number
    total_revenue: number
  }>
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Filter Types
export interface ProductFilters {
  category?: string
  status?: 'active' | 'inactive'
  featured?: boolean
  trending?: boolean
  hotSale?: boolean
  search?: string
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'price_low' | 'price_high'
}

export interface OrderFilters {
  status?: Order['status']
  payment_method?: Order['payment_method']
  payment_status?: Order['payment_status']
  date_from?: string
  date_to?: string
  search?: string
  sortBy?: 'newest' | 'oldest' | 'amount_high' | 'amount_low'
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form Types
export interface ProductFormData {
  name: string
  slug: string
  description: string
  specifications: string
  category_id: string
  price: number
  discount_price: number | null
  is_featured: boolean
  is_trending: boolean
  is_hot_sale: boolean
  is_active: boolean
  meta_title: string
  meta_description: string
  variants: {
    size: string
    color: string
    color_code: string
    stock_quantity: number
    sku: string
  }[]
}

export interface CategoryFormData {
  name: string
  slug: string
  description: string
  is_active: boolean
  display_order: number
}

export interface CouponFormData {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  expires_at: string | null
  is_active: boolean
}

export interface BannerFormData {
  title: string
  subtitle: string
  link_url: string
  is_active: boolean
  display_order: number
}

// Table Column Types
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

// File Upload Types
export interface FileUploadResult {
  url: string
  path: string
  error?: string
}