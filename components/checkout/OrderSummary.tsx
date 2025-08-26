'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Tag, AlertCircle, CheckCircle, ShoppingBag } from 'lucide-react'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import { createSupabaseClient } from '@/lib/supabase'
import { CartItem } from '@/types'
import toast from 'react-hot-toast'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  couponDiscount: number
  total: number
  couponCode: string
  setCouponCode: (code: string) => void
  appliedCoupon: string
  setAppliedCoupon: (code: string) => void
  setCouponDiscount: (discount: number) => void
  paymentMethod: 'online' | 'cod' | null
  freeDeliveryThreshold: number
}

export default function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  couponDiscount,
  total,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  setCouponDiscount,
  paymentMethod,
  freeDeliveryThreshold
}: OrderSummaryProps) {
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const supabase = createSupabaseClient()

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <ShoppingBag className="w-5 h-5 text-primary-600" />
        <span>Order Summary</span>
      </h3>

      {/* Order Items */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Items ({items.length})
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={getImageUrl(item.variant?.image_url || item.product?.featured_image)}
                  alt={item.product?.name || 'Product'}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product?.name}
                </p>
                <p className="text-xs text-gray-600">
                  {item.variant?.size} • {item.variant?.color} • Qty: {item.quantity}
                </p>
              </div>
              <div className="flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency((item.product?.discount_price || item.product?.price || 0) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium whitespace-nowrap"
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
          <span className="text-gray-600">Subtotal ({items.length} items)</span>
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
            ) : paymentMethod === null ? (
              <span className="text-orange-600">{formatCurrency(deliveryFee)}*</span>
            ) : (
              formatCurrency(deliveryFee)
            )}
          </span>
        </div>

        {/* Show delivery fee explanations */}
        {paymentMethod === null && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              <strong>*Delivery Fee:</strong> Choose online payment for FREE delivery, 
              or pay {formatCurrency(deliveryFee)} for COD {subtotal >= freeDeliveryThreshold ? '(FREE above ' + formatCurrency(freeDeliveryThreshold) + ')' : ''}
            </p>
          </div>
        )}
        
        {paymentMethod === 'online' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700">
              <strong>🎉 FREE Delivery!</strong> You chose online payment - delivery is on us!
            </p>
          </div>
        )}

        {paymentMethod === 'cod' && deliveryFee > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700">
              <strong>Delivery Fee:</strong> {formatCurrency(deliveryFee)} for Cash on Delivery.
              Choose online payment for FREE delivery!
            </p>
          </div>
        )}
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment Method Info - Only show when selected */}
      {paymentMethod && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium text-gray-900">
              {paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
            </span>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure checkout guaranteed</span>
        </div>
      </div>
    </div>
  )
}