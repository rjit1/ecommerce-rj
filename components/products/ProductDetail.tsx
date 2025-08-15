'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Share2, Truck, Shield, RefreshCw, MessageCircle, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product, ProductVariant } from '@/types'
import { 
  formatCurrency, 
  calculateDiscountPercentage, 
  getImageUrl, 
  getAvailableSizes, 
  getAvailableColors, 
  getVariantStock,
  isProductInStock,
  isLowStock,
  getTotalStock
} from '@/utils/helpers'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  
  const { addItem } = useCart()

  const images = product.images || []
  const variants = product.variants || []
  const availableSizes = getAvailableSizes(variants)
  const availableColors = getAvailableColors(variants, selectedSize)
  
  const discountPercentage = product.discount_price 
    ? calculateDiscountPercentage(product.price, product.discount_price)
    : 0
  
  const finalPrice = product.discount_price || product.price
  const totalStock = getTotalStock(variants)
  const lowStock = isLowStock(variants)
  const inStock = isProductInStock(variants)

  // Update selected variant when size/color changes
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor)
      setSelectedVariant(variant || null)
    }
  }, [selectedSize, selectedColor, variants])

  // Auto-select first available size and color
  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes, selectedSize])

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].color)
    }
  }, [availableColors, selectedColor])

  // Update main image when color variant has specific image
  useEffect(() => {
    if (selectedVariant?.image_url) {
      const variantImageIndex = images.findIndex(img => img.image_url === selectedVariant.image_url)
      if (variantImageIndex !== -1) {
        setSelectedImageIndex(variantImageIndex)
      }
    }
  }, [selectedVariant, images])

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select size and color')
      return
    }

    if (selectedVariant.stock_quantity < quantity) {
      toast.error('Not enough stock available')
      return
    }

    try {
      await addItem(product, selectedVariant, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    // Redirect to checkout or cart page
    window.location.href = '/cart'
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || '',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const currentStock = selectedVariant ? selectedVariant.stock_quantity : totalStock

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={getImageUrl(images[selectedImageIndex]?.image_url || product.featured_image)}
                alt={images[selectedImageIndex]?.alt_text || product.name}
                fill
                className={`object-cover cursor-zoom-in transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_hot_sale && (
              <span className="hot-sale-badge">
                🔥 HOT SALE
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="discount-badge">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {lowStock && inStock && (
            <span className="low-stock-badge">
              Only {totalStock} left!
            </span>
          )}
        </div>

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                  selectedImageIndex === index
                    ? 'border-primary-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={getImageUrl(image.image_url)}
                  alt={image.alt_text || product.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          {product.category && (
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
              {product.category.name}
            </p>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          
          {/* Price */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl lg:text-3xl font-bold text-gray-900">
              {formatCurrency(finalPrice)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                  Save {formatCurrency(product.price - product.discount_price)}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors duration-200">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Wishlist</span>
            </button>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Size Selection */}
        {availableSizes.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => {
                const sizeStock = getVariantStock(variants, size, selectedColor)
                const isAvailable = sizeStock > 0
                
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={`size-selector ${
                      selectedSize === size ? 'selected' : ''
                    } ${!isAvailable ? 'disabled' : ''}`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {availableColors.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Color: {selectedColor}
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(colorOption => (
                <button
                  key={colorOption.color}
                  onClick={() => setSelectedColor(colorOption.color)}
                  className={`color-swatch ${
                    selectedColor === colorOption.color ? 'selected' : ''
                  }`}
                  style={{ 
                    backgroundColor: colorOption.color_code || '#ccc' 
                  }}
                  title={colorOption.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            currentStock > 0 ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className={`text-sm font-medium ${
            currentStock > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {currentStock > 0 ? (
              lowStock ? `Only ${currentStock} left in stock` : 'In Stock'
            ) : 'Out of Stock'}
          </span>
        </div>

        {/* Quantity Selection */}
        {inStock && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="quantity-btn rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {currentStock} available
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBuyNow}
            disabled={!inStock || !selectedVariant}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {!inStock ? 'Out of Stock' : 'Buy Now'}
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant}
            className="w-full bg-white text-primary-600 py-3 px-6 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Add to Cart
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">Fast Delivery</p>
              <p className="text-sm text-gray-600">2-5 business days</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">Secure Payment</p>
              <p className="text-sm text-gray-600">100% secure</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">Easy Returns</p>
              <p className="text-sm text-gray-600">7-day return policy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">24/7 Support</p>
              <p className="text-sm text-gray-600">WhatsApp support</p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
            <div className="prose prose-sm text-gray-600">
              <p>{product.specifications}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile CTA */}
      <div className="sticky-cta lg:hidden">
        <div className="flex space-x-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant}
            className="flex-1 bg-white text-primary-600 py-3 px-4 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock || !selectedVariant}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}