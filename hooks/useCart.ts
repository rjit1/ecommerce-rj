'use client'

import { useCartData } from '@/contexts/CartDataContext'
import { useCartSidebar } from '@/contexts/CartContext'
import { Product, ProductVariant } from '@/types'

interface CartContextType {
  items: any[]
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
  const cartData = useCartData()
  const { openCart } = useCartSidebar()

  // Wrap addItem to include cart opening logic
  const addItem = async (product: Product, variant: ProductVariant, quantity: number = 1) => {
    const wasEmpty = cartData.items.length === 0
    await cartData.addItem(product, variant, quantity)
    
    // Only open cart if it was empty before adding the item
    if (wasEmpty) {
      openCart()
    }
  }

  return {
    items: cartData.items,
    loading: cartData.loading,
    totalItems: cartData.totalItems,
    totalQuantity: cartData.totalQuantity,
    subtotal: cartData.subtotal,
    addItem,
    removeItem: cartData.removeItem,
    updateQuantity: cartData.updateQuantity,
    clearCart: cartData.clearCart,
    refreshCart: cartData.refreshCart
  }
}