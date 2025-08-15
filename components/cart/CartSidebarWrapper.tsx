'use client'

import { useCartSidebar } from '@/contexts/CartContext'
import CartSidebar from './CartSidebar'

export default function CartSidebarWrapper() {
  const { isCartOpen, closeCart } = useCartSidebar()

  return <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
}