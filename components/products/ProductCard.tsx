'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import { formatCurrency, calculateDiscountPercentage, getImageUrl, isLowStock, getTotalStock } from '@/utils/helpers'
import { useCart } from '@/hooks/useCart'

import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem, items, loading } = useCart()
  const router = useRouter()



  // Check if product is in cart (only when not loading to avoid hydration issues)
  const isInCart = !loading && items.some(item => item.product_id === product.id)

  const discountPercentage = product.discount_price 
    ? calculateDiscountPercentage(product.price, product.discount_price)
    : 0

  const finalPrice = product.discount_price || product.price
  const totalStock = getTotalStock(product.variants || [])
  const lowStock = isLowStock(product.variants || [])
  const outOfStock = totalStock === 0

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🛒 handleQuickAdd called for product:', product.name)
    console.log('🛒 Product variants:', product.variants)
    console.log('🛒 outOfStock:', outOfStock)
    console.log('🛒 totalStock:', totalStock)

    if (outOfStock || !product.variants || product.variants.length === 0) {
      console.log('🛒 Product is out of stock or has no variants')
      toast.error('Product is out of stock')
      return
    }

    // Find the first available variant
    const availableVariant = product.variants.find(v => v.stock_quantity > 0)
    console.log('🛒 Available variant found:', availableVariant)
    
    if (!availableVariant) {
      console.log('🛒 No available variants found')
      toast.error('No available variants')
      return
    }

    try {
      console.log('🛒 Calling addItem with:', { product: product.name, variant: availableVariant })
      await addItem(product, availableVariant, 1)
      console.log('🛒 addItem completed successfully')
      // Note: addItem already handles toast and opening cart once
    } catch (error) {
      console.error('🛒 Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group ${className}`}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          <OptimizedImage
            src={product.featured_image || product.images?.[0]?.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_hot_sale && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                🔥 HOT
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercentage}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Featured
              </span>
            )}
            {product.is_trending && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Trending
              </span>
            )}
          </div>

          {/* Stock Status Badge */}
          {lowStock && !outOfStock && (
            <div className="absolute top-3 right-3">
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Only {totalStock} left!
              </span>
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-gray-600 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Add to Wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="mb-2 sm:mb-3">
            {product.category && (
              <span className="text-xs text-primary-600 uppercase tracking-wide font-medium">
                {product.category.name}
              </span>
            )}
            
            <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 text-sm sm:text-base lg:text-lg">
              {product.name}
            </h3>
            
            {/* Hide description on mobile for space */}
            {product.description && (
              <p className="hidden sm:block text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
        </Link>

        {/* Price */}
        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4">
          <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
            {formatCurrency(finalPrice)}
          </span>
          {product.discount_price && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status & Rating - Simplified for mobile */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="text-xs">
            {outOfStock ? (
              <span className="text-red-500 font-bold">Out of Stock</span>
            ) : lowStock ? (
              <span className="text-orange-500 font-bold">Low Stock</span>
            ) : (
              <span className="text-green-500 font-bold">In Stock</span>
            )}
          </div>
          
          {/* Rating - Hide on very small screens */}
          <div className="hidden xs:flex items-center space-x-1">
            <div className="flex text-yellow-400 text-xs sm:text-sm">
              {'★'.repeat(5)}
            </div>
            <span className="text-xs text-gray-500">(4.5)</span>
          </div>
        </div>

        {/* Add to Cart / Go to Cart Button */}
        <button
          onClick={isInCart ? () => router.push('/cart') : handleQuickAdd}
          disabled={outOfStock || loading}
          className={`w-full py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
            outOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : loading
              ? 'bg-gray-300 text-gray-600 cursor-wait'
              : isInCart
              ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-105'
          }`}
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">
            {outOfStock ? 'Out of Stock' : loading ? 'Loading...' : isInCart ? 'Go to Cart' : 'Add to Cart'}
          </span>
          <span className="xs:hidden">
            {outOfStock ? 'Out' : loading ? '...' : isInCart ? 'Cart' : 'Add'}
          </span>
        </button>
      </div>
    </motion.div>
  )
}