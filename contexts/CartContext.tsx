'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface CartContextType {
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  openCartOnce: () => void
  resetCartOpenState: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)

  // Reset the "opened once" state when cart is manually closed
  useEffect(() => {
    if (!isCartOpen) {
      // Reset after a delay to allow for smooth closing animation
      const timer = setTimeout(() => {
        setHasOpenedOnce(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isCartOpen])

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen(!isCartOpen)

  const openCartOnce = () => {
    if (!hasOpenedOnce) {
      setIsCartOpen(true)
      setHasOpenedOnce(true)
    }
  }

  const resetCartOpenState = () => {
    setHasOpenedOnce(false)
  }

  return (
    <CartContext.Provider value={{ 
      isCartOpen, 
      openCart, 
      closeCart, 
      toggleCart, 
      openCartOnce,
      resetCartOpenState
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartSidebar() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartSidebar must be used within a CartProvider')
  }
  return context
}