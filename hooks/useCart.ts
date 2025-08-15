'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { useCartSidebar } from '@/contexts/CartContext'
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
      const price = item.variant?.price ?? item.product.price
      return acc + price * item.quantity
    }, 0)
    const totalItems = items.length
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)
  
    return { subtotal, totalItems, totalQuantity }
}

interface CartContextType {
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

export function useCart(): CartContextType {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const user = useUser()
  const supabase = createSupabaseClient()
  const { openCartOnce } = useCartSidebar()

  // Calculate totals
  const { subtotal, totalItems, totalQuantity } = calculateCartTotal(items)

  // Load cart from localStorage for guest users
  const loadGuestCart = useCallback(() => {
    if (!user) {
      const guestCart = getFromLocalStorage<CartItem[]>('guest_cart', [])
      setItems(guestCart)
    }
  }, [user])

  // Save cart to localStorage for guest users
  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    if (!user) {
      setToLocalStorage('guest_cart', cartItems)
    }
  }, [user])

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
        } else {
          // Add new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              variant_id: variant.id,
              quantity
            })

          if (error) throw error
        }

        await refreshCart()
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
      openCartOnce()
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }, [user, supabase, items, refreshCart, saveGuestCart, openCartOnce])

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
        await refreshCart()
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
  }, [user, supabase, items, refreshCart, saveGuestCart])

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
        await refreshCart()
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
  }, [user, supabase, items, refreshCart, saveGuestCart, removeItem])

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
    if (!user) return

    const guestCart = getFromLocalStorage<CartItem[]>('guest_cart', [])
    if (guestCart.length === 0) return

    try {
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
      await refreshCart()
    } catch (error) {
      console.error('Error merging guest cart:', error)
    }
  }, [user, supabase, refreshCart])

  // Initialize cart
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Merge guest cart on user login
  useEffect(() => {
    if (user) {
      mergeGuestCart()
    }
  }, [user, mergeGuestCart])

  return {
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
  }
}