'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@supabase/auth-helpers-react'
import { CreditCard, Truck, MapPin, User, Lock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/helpers'
import { createRazorpayOrder, verifyRazorpayPayment, openRazorpayCheckout, initializeRazorpay } from '@/utils/razorpay'
import AddressForm from './AddressForm'
import PaymentMethods from './PaymentMethods'
import OrderSummary from './OrderSummary'
import toast from 'react-hot-toast'

interface CheckoutContentProps {
  settings: Record<string, string>
}

interface Address {
  id?: string
  full_name: string
  email?: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
}

export default function CheckoutContent({ settings }: CheckoutContentProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online')
  const [isProcessing, setIsProcessing] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [showGuestLogin, setShowGuestLogin] = useState(false)
  
  const router = useRouter()
  const user = useUser()
  const { items, subtotal, totalQuantity, clearCart } = useCart()

  const freeDeliveryThreshold = parseFloat(String(settings.free_delivery_threshold || '999'))
  const baseDeliveryFee = parseFloat(String(settings.delivery_fee || '50'))
  
  // Correct delivery fee logic:
  // - Free delivery for online payments (regardless of order value)
  // - Free delivery for COD orders >= threshold
  // - Apply delivery fee only for COD orders below threshold
  const deliveryFee = paymentMethod === 'online' ? 0 : 
                     (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee)
  const finalTotal = Math.max(0, Number(subtotal) - Number(couponDiscount) + Number(deliveryFee))

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const steps = [
    { id: 1, title: 'Address', icon: MapPin, completed: currentStep > 1 },
    { id: 2, title: 'Payment', icon: CreditCard, completed: currentStep > 2 },
    { id: 3, title: 'Review', icon: Lock, completed: false },
  ]

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
    setCurrentStep(2)
  }

  const handlePaymentSelect = (method: 'online' | 'cod') => {
    setPaymentMethod(method)
    setCurrentStep(3)
  }

  const handleRazorpayPayment = async (order: any) => {
    try {
      // Ensure Razorpay is loaded
      if (typeof window === 'undefined' || !window.Razorpay) {
        const isLoaded = await initializeRazorpay()
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay SDK')
        }
      }

      // Create Razorpay order
      const razorpayOrderData = {
        amount: finalTotal,
        currency: 'INR',
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          customer_name: selectedAddress?.full_name || '',
          customer_email: user?.email || selectedAddress?.email || 'guest@example.com'
        }
      }

      const razorpayOrder = await createRazorpayOrder(razorpayOrderData)

      if (!razorpayOrder.success) {
        throw new Error('Failed to create payment order')
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: 'RJ4WEAR',
        description: `Order #${order.order_number}`,
        order_id: razorpayOrder.order.id,
        handler: async (response: any) => {
          try {
            // Show processing message
            toast.loading('Verifying payment...', { id: 'payment-verification' })

            // Verify payment with comprehensive error handling
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id
            }

            console.log('Verifying payment with data:', verificationData)

            const verification = await verifyRazorpayPayment(verificationData)

            // Dismiss loading toast
            toast.dismiss('payment-verification')

            if (verification.success) {
              // Clear cart only after successful verification
              clearCart()
              
              // Show success message with order details
              toast.success(`Payment successful! Order #${order.order_number} confirmed.`, {
                duration: 5000
              })

              // Wait a moment for user to see the success message
              setTimeout(() => {
                const email = encodeURIComponent(selectedAddress?.email || user?.email || 'guest@example.com')
                const phone = encodeURIComponent(selectedAddress?.phone || '')
                router.push(`/orders?success=true&order=${order.order_number}&payment=verified&email=${email}&phone=${phone}`)
              }, 1500)
            } else {
              throw new Error(verification.message || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.dismiss('payment-verification')
            
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed'
            toast.error(`${errorMessage}. Please contact support with Order #${order.order_number}`, {
              duration: 8000
            })
            
            // Don't clear cart on verification failure - user can retry
            // Redirect to orders page with error flag so user can see their order status
            setTimeout(() => {
              const email = encodeURIComponent(selectedAddress?.email || user?.email || 'guest@example.com')
              const phone = encodeURIComponent(selectedAddress?.phone || '')
              router.push(`/orders?error=verification&order=${order.order_number}&email=${email}&phone=${phone}`)
            }, 3000)
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: selectedAddress?.full_name || '',
          email: user?.email || selectedAddress?.email || '',
          contact: selectedAddress?.phone || ''
        },
        notes: {
          address: `${selectedAddress?.address_line_1}, ${selectedAddress?.city}, ${selectedAddress?.state} ${selectedAddress?.postal_code}`
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.error('Payment cancelled. Your order has been created but not paid. You can retry payment from your orders page.', {
              duration: 6000
            })
            // Redirect to orders page so user can see their unpaid order
            setTimeout(() => {
              router.push(`/orders?cancelled=true&order=${order.order_number}`)
            }, 2000)
          }
        }
      }

      // Open Razorpay checkout
      openRazorpayCheckout(options)

    } catch (error) {
      console.error('Razorpay payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed'
      toast.error(errorMessage)
      setIsProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    // Validate cart items
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    // Validate stock availability
    for (const item of items) {
      if (!item.variant || item.variant.stock_quantity < item.quantity) {
        toast.error(`Insufficient stock for ${item.product?.name}. Available: ${item.variant?.stock_quantity || 0}`)
        return
      }
    }

    setIsProcessing(true)

    try {
      // Create order data
      const orderData = {
        user_id: user?.id || null,
        payment_method: paymentMethod,
        customer_name: selectedAddress.full_name,
        customer_email: user?.email || selectedAddress.email || 'guest@example.com', // For guest users
        customer_phone: selectedAddress.phone,
        shipping_address_line_1: selectedAddress.address_line_1,
        shipping_address_line_2: selectedAddress.address_line_2,
        shipping_city: selectedAddress.city,
        shipping_state: selectedAddress.state,
        shipping_postal_code: selectedAddress.postal_code,
        shipping_country: selectedAddress.country,
        subtotal,
        discount_amount: couponDiscount,
        applied_delivery_fee: deliveryFee,
        total_amount: finalTotal,
        coupon_code: appliedCoupon,
        coupon_discount: couponDiscount,
        items: items.map(item => ({
          product_id: item.product?.id,
          variant_id: item.variant?.id,
          product_name: item.product?.name,
          product_image: item.product?.featured_image,
          size: item.variant?.size,
          color: item.variant?.color,
          quantity: item.quantity,
          unit_price: item.product?.discount_price || item.product?.price,
          total_price: (item.product?.discount_price || item.product?.price || 0) * item.quantity
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order')
      }

      // Handle payment based on method
      if (paymentMethod === 'online') {
        // Initialize Razorpay payment
        await handleRazorpayPayment(result.order)
      } else {
        // COD order
        clearCart()
        toast.success('Order placed successfully! Pay when delivered.')
        const email = encodeURIComponent(selectedAddress?.email || user?.email || 'guest@example.com')
        const phone = encodeURIComponent(selectedAddress?.phone || '')
        router.push(`/orders?success=true&order=${result.order.order_number}&email=${email}&phone=${phone}`)
      }
    } catch (error) {
      console.error('Order placement error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Guest User Notice */}
      {!user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                <strong>Checkout as Guest:</strong> You can complete your purchase without creating an account.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Want to save your address and track orders easily? 
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="ml-1 underline hover:no-underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 sm:space-x-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {step.completed ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
                currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                  currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <AddressForm
                onAddressSelect={handleAddressSelect}
                selectedAddress={selectedAddress}
              />
            )}

            {currentStep === 2 && (
              <PaymentMethods
                selectedMethod={paymentMethod}
                onMethodSelect={handlePaymentSelect}
                subtotal={subtotal}
                freeDeliveryThreshold={freeDeliveryThreshold}
                deliveryFee={baseDeliveryFee}
              />
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Address Summary */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedAddress?.full_name}</p>
                    <p className="text-sm text-gray-600">{selectedAddress?.phone}</p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress?.address_line_1}
                      {selectedAddress?.address_line_2 && `, ${selectedAddress.address_line_2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.postal_code}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                  >
                    Change Address
                  </button>
                </div>

                {/* Payment Method Summary */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">
                      {paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {paymentMethod === 'online' 
                        ? 'Pay securely using UPI, Cards, or Net Banking'
                        : `Pay ${formatCurrency(finalTotal)} when your order is delivered`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                  >
                    Change Payment Method
                  </button>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Place Order - ${formatCurrency(finalTotal)}`
                  )}
                </button>

                {/* Terms Notice */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            couponDiscount={couponDiscount}
            total={finalTotal}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            setCouponDiscount={setCouponDiscount}
            paymentMethod={paymentMethod}
            freeDeliveryThreshold={freeDeliveryThreshold}
          />
        </div>
      </div>
    </div>
  )
}