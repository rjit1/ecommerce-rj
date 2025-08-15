'use client'

import { useCartSidebar } from '@/contexts/CartContext'
import { useCart } from '@/hooks/useCart'

export default function TestPage() {
  const { openCart, closeCart, isCartOpen } = useCartSidebar()
  const { totalQuantity } = useCart()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <p>Cart is open: {isCartOpen ? 'Yes' : 'No'}</p>
          <p>Total quantity: {totalQuantity}</p>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={openCart}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Open Cart
          </button>
          <button
            onClick={closeCart}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Close Cart
          </button>
        </div>
      </div>
    </div>
  )
}