'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { Product, ProductVariant, CartItem } from '@/types'

// Helper functions for local storage
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const value = window.localStorage.getItem(key)
    if (value) {
      try {
        return JSON.parse(value) as T
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error)
        return defaultValue
      }
    }
  }
  return defaultValue
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }
}

// Calculate totals
export const calculateCartTotal = (items: CartItem[]) => {
  const subtotal = items.reduce((acc, item) => {
    // Use discounted price if available, otherwise use regular price
    if (!item.product) return acc
    const price = item.product.discount_price || item.product.price
    return acc + price * item.quantity
  }, 0)
  const totalItems = items.length
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  return { subtotal, totalItems, totalQuantity }
}

interface CartDataContextType {
  items: CartItem[]
  loading: boolean
  totalItems: number
  totalQuantity: number
  subtotal: number
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartDataContext = createContext<CartDataContextType | undefined>(undefined)

export function CartDataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [lastUserId, setLastUserId] = useState<string | null>(null)
  const [isMergingCart, setIsMergingCart] = useState(false)
  const user = useUser()
  const supabase = createSupabaseClient()

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate totals
  const { subtotal, totalItems, totalQuantity } = calculateCartTotal(items)

  // Load cart from localStorage for guest users
  const loadGuestCart = useCallback(() => {
    if (!user && isClient) {
      const guestCart = getFromLocalStorage<CartItem[]>('guest_cart', [])
      console.log('Loading guest cart:', guestCart)
      setItems(guestCart)
    }
  }, [user, isClient])

  // Save cart to localStorage for guest users
  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    if (!user && isClient) {
      console.log('Saving guest cart:', cartItems)
      setToLocalStorage('guest_cart', cartItems)
    }
  }, [user, isClient])

  // Load cart from database for authenticated users
  const loadUserCart = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            images:product_images(image_url, alt_text, display_order)
          ),
          variant:product_variants(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('Error loading cart:', error)
      toast.error('Failed to load cart')
    }
  }, [user, supabase])

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    setLoading(true)
    if (user) {
      await loadUserCart()
    } else {
      loadGuestCart()
    }
    setLoading(false)
  }, [user, loadUserCart, loadGuestCart])

  // Add item to cart
  const addItem = useCallback(async (
    product: Product,
    variant: ProductVariant,
    quantity: number = 1
  ) => {
    try {
      if (user) {
        // Authenticated user - save to database
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('variant_id', variant.id)
          .single()

        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + quantity
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id)

          if (error) throw error
          
          // Update local state immediately
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === existingItem.id 
                ? { ...item, quantity: newQuantity }
                : item
            )
          )
        } else {
          // Add new item
          const { data: newItem, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              variant_id: variant.id,
              quantity
            })
            .select(`
              *,
              product:products(
                *,
                images:product_images(image_url, alt_text, display_order)
              ),
              variant:product_variants(*)
            `)
            .single()

          if (error) throw error
          
          // Add to local state immediately
          if (newItem) {
            setItems(prevItems => [...prevItems, newItem])
          }
        }
      } else {
        // Guest user - save to localStorage
        const existingItemIndex = items.findIndex(
          item => item.variant_id === variant.id
        )

        let newItems: CartItem[]
        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = [...items]
          newItems[existingItemIndex].quantity += quantity
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `guest_${Date.now()}_${variant.id}`,
            user_id: 'guest',
            product_id: product.id,
            variant_id: variant.id,
            quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product,
            variant
          }
          newItems = [...items, newItem]
        }

        setItems(newItems)
        saveGuestCart(newItems)
      }

      toast.success('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }, [user, supabase, items, saveGuestCart])

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    try {
      if (user && !itemId.startsWith('guest_')) {
        // Authenticated user - remove from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error
        
        // Update local state immediately
        setItems(prevItems => prevItems.filter(item => item.id !== itemId))
      } else {
        // Guest user - remove from localStorage
        const newItems = items.filter(item => item.id !== itemId)
        setItems(newItems)
        saveGuestCart(newItems)
      }

      toast.success('Removed from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove from cart')
    }
  }, [user, supabase, items, saveGuestCart])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    try {
      if (user && !itemId.startsWith('guest_')) {
        // Authenticated user - update in database
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)

        if (error) throw error
        
        // Update local state immediately
        setItems(prevItems => 
          prevItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        )
      } else {
        // Guest user - update in localStorage
        const newItems = items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
        setItems(newItems)
        saveGuestCart(newItems)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }, [user, supabase, items, saveGuestCart, removeItem])

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (user) {
        // Authenticated user - clear from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)

        if (error) throw error
      }

      // Clear local state and localStorage
      setItems([])
      saveGuestCart([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }, [user, supabase, saveGuestCart])

  // Merge guest cart with user cart on login
  const mergeGuestCart = useCallback(async () => {
    if (!user || isMergingCart) return

    const guestCart = getFromLocalStorage<CartItem[]>('guest_cart', [])
    if (guestCart.length === 0) return

    setIsMergingCart(true)
    try {
      console.log('Merging guest cart with user cart:', guestCart.length, 'items')
      
      // Add guest cart items to user's cart
      for (const guestItem of guestCart) {
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('variant_id', guestItem.variant_id)
          .single()

        if (existingItem) {
          // Update existing item
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + guestItem.quantity })
            .eq('id', existingItem.id)
        } else {
          // Add new item
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: guestItem.product_id,
              variant_id: guestItem.variant_id,
              quantity: guestItem.quantity
            })
        }
      }

      // Clear guest cart
      setToLocalStorage('guest_cart', [])
      console.log('Guest cart merged successfully')
      
      // Load user cart after merging
      await loadUserCart()
    } catch (error) {
      console.error('Error merging guest cart:', error)
    } finally {
      setIsMergingCart(false)
    }
  }, [user, supabase, isMergingCart, loadUserCart])

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      if (initialized || !isClient || isMergingCart) return
      
      const currentUserId = user?.id || 'guest'
      
      // Check if user has changed
      if (lastUserId !== null && lastUserId !== currentUserId) {
        // User changed, need to reinitialize
        setInitialized(false)
        setLastUserId(currentUserId)
        return
      }
      
      if (lastUserId === null) {
        setLastUserId(currentUserId)
      }
      
      console.log('Initializing cart for user:', currentUserId)
      setLoading(true)
      
      try {
        if (user) {
          // Check if there's a guest cart to merge first
          const guestCart = getFromLocalStorage<CartItem[]>('guest_cart', [])
          if (guestCart.length > 0 && !isMergingCart) {
            console.log('Found guest cart to merge, merging first...')
            await mergeGuestCart()
          } else {
            await loadUserCart()
          }
        } else {
          loadGuestCart()
        }
      } catch (error) {
        console.error('Error initializing cart:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    
    initializeCart()
  }, [user, loadUserCart, loadGuestCart, initialized, isClient, lastUserId, isMergingCart, mergeGuestCart])

  return (
    <CartDataContext.Provider value={{
      items,
      loading,
      totalItems,
      totalQuantity,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartDataContext.Provider>
  )
}

export function useCartData(): CartDataContextType {
  const context = useContext(CartDataContext)
  if (context === undefined) {
    throw new Error('useCartData must be used within a CartDataProvider')
  }
  return context
}