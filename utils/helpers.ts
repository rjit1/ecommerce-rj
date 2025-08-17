// Utility function to merge Tailwind classes
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ')
}

// Format currency to Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate discount percentage
export function calculateDiscountPercentage(originalPrice: number, discountPrice: number): number {
  if (originalPrice <= 0 || discountPrice >= originalPrice) return 0
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(dateString)
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91-${cleaned.substring(0, 5)}-${cleaned.substring(5)}`
  }
  return phone
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RJ${dateStr}${randomStr}`
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Get image URL with fallback
export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) return fallback || '/images/placeholder.jpg'
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) return url
  
  // If it's a Supabase storage path, construct the full URL
  if (url.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public${url}`
  }
  
  return url
}

// Calculate cart total
export function calculateCartTotal(items: any[]): {
  subtotal: number
  totalItems: number
  totalQuantity: number
} {
  const subtotal = items.reduce((total, item) => {
    const price = item.product?.discount_price || item.product?.price || 0
    return total + (price * item.quantity)
  }, 0)
  
  const totalItems = items.length
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)
  
  return { subtotal, totalItems, totalQuantity }
}

// Get available sizes for a product
export function getAvailableSizes(variants: any[]): string[] {
  const sizes = variants
    .filter(variant => variant.stock_quantity > 0)
    .map(variant => variant.size)
  
  return Array.from(new Set(sizes)).sort()
}

// Get available colors for a product and size
export function getAvailableColors(variants: any[], selectedSize?: string): any[] {
  let filteredVariants = variants.filter(variant => variant.stock_quantity > 0)
  
  if (selectedSize) {
    filteredVariants = filteredVariants.filter(variant => variant.size === selectedSize)
  }
  
  const colors = filteredVariants.map(variant => ({
    color: variant.color,
    color_code: variant.color_code,
    image_url: variant.image_url
  }))
  
  // Remove duplicates based on color name
  const uniqueColors = colors.filter((color, index, self) => 
    index === self.findIndex(c => c.color === color.color)
  )
  
  return uniqueColors
}

// Get stock for specific variant
export function getVariantStock(variants: any[], size: string, color: string): number {
  const variant = variants.find(v => v.size === size && v.color === color)
  return variant?.stock_quantity || 0
}

// Check if product is in stock
export function isProductInStock(variants: any[]): boolean {
  return variants.some(variant => variant.stock_quantity > 0)
}

// Check if product has low stock
export function isLowStock(variants: any[]): boolean {
  const totalStock = variants.reduce((total, variant) => total + variant.stock_quantity, 0)
  return totalStock > 0 && totalStock <= 3
}

// Get total stock for product
export function getTotalStock(variants: any[]): number {
  return variants.reduce((total, variant) => total + variant.stock_quantity, 0)
}

// SEO helpers
export function generateMetaTitle(productName: string, categoryName?: string): string {
  const siteName = 'RJ4WEAR'
  if (categoryName) {
    return `${productName} - ${categoryName} | ${siteName}`
  }
  return `${productName} | ${siteName}`
}

export function generateMetaDescription(productName: string, price: number, description?: string): string {
  const formattedPrice = formatCurrency(price)
  const baseDescription = `Buy ${productName} online at ${formattedPrice}. Premium quality fashion at RJ4WEAR.`
  
  if (description) {
    const truncatedDesc = truncateText(description, 100)
    return `${baseDescription} ${truncatedDesc}`
  }
  
  return baseDescription
}

// Local storage helpers
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}