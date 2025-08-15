'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import { createSupabaseClient } from '@/lib/supabase'
import { SiteSettings } from '@/types'
import toast from 'react-hot-toast'

export default function CartContent() {
  const { items, loading, updateQuantity, removeItem, subtotal, totalQuantity } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [settings, setSettings] = useState<Partial<SiteSettings>>({})
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['cod_fee', 'free_delivery_threshold'])

        if (data) {
          const settingsObj = data.reduce((acc, setting) => {
            acc[setting.key as keyof SiteSettings] = setting.value as any
            return acc
          }, {} as Partial<SiteSettings>)
          setSettings(settingsObj)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [supabase])

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      setCouponSuccess('')
      return
    }

    setIsApplyingCoupon(true)
    setCouponError('')
    setCouponSuccess('')

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !coupon) {
        setCouponError('Invalid coupon code. Please check and try again.')
        return
      }

      // Check if coupon is expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setCouponError('This coupon has expired.')
        return
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        setCouponError('This coupon has reached its usage limit.')
        return
      }

      // Check minimum order amount
      if (coupon.min_order_amount > subtotal) {
        setCouponError(`Minimum order amount is ${formatCurrency(coupon.min_order_amount)} to use this coupon.`)
        return
      }

      // Calculate discount
      let discount = 0
      if (coupon.discount_type === 'percentage') {
        discount = (subtotal * coupon.discount_value) / 100
        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
          discount = coupon.max_discount_amount
        }
      } else {
        discount = coupon.discount_value
      }

      setCouponDiscount(discount)
      setAppliedCoupon(coupon.code)
      setCouponSuccess(`Coupon applied! You saved ${formatCurrency(discount)}`)
      toast.success('Coupon applied successfully!')
    } catch (error) {
      console.error('Error applying coupon:', error)
      setCouponError('Error applying coupon. Please try again.')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponDiscount(0)
    setAppliedCoupon('')
    setCouponCode('')
    setCouponError('')
    setCouponSuccess('')
    toast.success('Coupon removed')
  }

  const codFee = settings.cod_fee || 0
  const freeDeliveryThreshold = settings.free_delivery_threshold || 999
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 50
  const finalTotal = subtotal - couponDiscount + deliveryFee

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-gray-400 mb-6">
          <ShoppingBag className="w-24 h-24 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Shopping Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(item.variant?.image_url || item.product?.featured_image)}
                      alt={item.product?.name || 'Product'}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <Link 
                        href={`/products/${item.product?.slug}`}
                        className="hover:text-primary-600 transition-colors duration-200"
                      >
                        {item.product?.name}
                      </Link>
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center space-x-1">
                        <span className="font-medium">Size:</span>
                        <span>{item.variant?.size}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="font-medium">Color:</span>
                        <span>{item.variant?.color}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency((item.product?.discount_price || item.product?.price || 0) * item.quantity)}
                        </span>
                        {item.product?.discount_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 transition-colors duration-200 rounded-l-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.variant?.stock_quantity || 0)}
                            className="p-2 hover:bg-gray-50 transition-colors duration-200 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.variant && item.variant.stock_quantity <= 3 && (
                      <div className="mt-3 flex items-center space-x-1 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Only {item.variant.stock_quantity} left in stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

            {/* Coupon Code Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Tag className="w-4 h-4 inline mr-1" />
                Have a coupon code?
              </label>
              
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {appliedCoupon} Applied
                        </p>
                        <p className="text-xs text-green-600">
                          You saved {formatCurrency(couponDiscount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError('')
                        setCouponSuccess('')
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      disabled={isApplyingCoupon}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                    >
                      {isApplyingCoupon ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          <span>Applying...</span>
                        </div>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  
                  {couponError && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{couponError}</p>
                    </div>
                  )}
                  
                  {couponSuccess && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <p className="text-sm">{couponSuccess}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Coupon Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(couponDiscount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              
              {subtotal < freeDeliveryThreshold && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>💡 Tip:</strong> Add {formatCurrency(freeDeliveryThreshold - subtotal)} more for free delivery!
                  </p>
                </div>
              )}
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 text-center block mb-3"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="w-full text-center text-primary-600 hover:text-primary-700 py-2 text-sm font-medium block"
            >
              Continue Shopping
            </Link>

            {/* Security Badge */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure checkout guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}