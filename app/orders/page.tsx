'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { useSearchParams } from 'next/navigation'
import { User, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import OrdersList from '@/components/orders/OrdersList'
import OrderLookup from '@/components/orders/OrderLookup'
import Footer from '@/components/layout/Footer'
import toast from 'react-hot-toast'

export default function OrdersPage() {
  const user = useUser()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'my-orders' | 'track-order'>(
    user ? 'my-orders' : 'track-order'
  )
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning'
    title: string
    message: string
    orderNumber?: string
  } | null>(null)

  // Handle payment status from URL parameters
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const cancelled = searchParams.get('cancelled')
    const payment = searchParams.get('payment')
    const orderNumber = searchParams.get('order')

    if (success === 'true' && payment === 'verified' && orderNumber) {
      setStatusMessage({
        type: 'success',
        title: 'Payment Successful!',
        message: `Your payment has been verified and your order has been confirmed. You will receive an email confirmation shortly.`,
        orderNumber
      })
      // Show success toast
      toast.success(`Order #${orderNumber} confirmed successfully!`, { duration: 5000 })
    } else if (success === 'true' && orderNumber) {
      // COD order success
      setStatusMessage({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Your order has been placed successfully. You can pay when the order is delivered.`,
        orderNumber
      })
      toast.success(`Order #${orderNumber} placed successfully!`, { duration: 5000 })
    } else if (error === 'verification' && orderNumber) {
      setStatusMessage({
        type: 'error',
        title: 'Payment Verification Failed',
        message: `There was an issue verifying your payment. Your order has been created but payment is pending. Please contact support or try paying again.`,
        orderNumber
      })
      toast.error(`Payment verification failed for Order #${orderNumber}`, { duration: 8000 })
    } else if (cancelled === 'true' && orderNumber) {
      setStatusMessage({
        type: 'warning',
        title: 'Payment Cancelled',
        message: `Your payment was cancelled, but your order has been created. You can complete the payment later from your order details.`,
        orderNumber
      })
      toast.error(`Payment cancelled for Order #${orderNumber}`, { duration: 6000 })
    }

    // Clear URL parameters after handling
    if (success || error || cancelled) {
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('error')
      url.searchParams.delete('cancelled')
      url.searchParams.delete('payment')
      url.searchParams.delete('order')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gray-50">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Orders</h1>
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`mb-8 p-6 rounded-lg border ${
              statusMessage.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : statusMessage.type === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {statusMessage.type === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {statusMessage.type === 'error' && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  {statusMessage.type === 'warning' && (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    statusMessage.type === 'success' 
                      ? 'text-green-900' 
                      : statusMessage.type === 'error'
                      ? 'text-red-900'
                      : 'text-yellow-900'
                  }`}>
                    {statusMessage.title}
                  </h3>
                  <p className={`mt-2 text-sm ${
                    statusMessage.type === 'success' 
                      ? 'text-green-700' 
                      : statusMessage.type === 'error'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}>
                    {statusMessage.message}
                  </p>
                  {statusMessage.orderNumber && (
                    <p className={`mt-2 text-sm font-medium ${
                      statusMessage.type === 'success' 
                        ? 'text-green-800' 
                        : statusMessage.type === 'error'
                        ? 'text-red-800'
                        : 'text-yellow-800'
                    }`}>
                      Order Number: #{statusMessage.orderNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setStatusMessage(null)}
                  className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 ${
                    statusMessage.type === 'success' 
                      ? 'hover:bg-green-600' 
                      : statusMessage.type === 'error'
                      ? 'hover:bg-red-600'
                      : 'hover:bg-yellow-600'
                  }`}
                >
                  <XCircle className={`w-5 h-5 ${
                    statusMessage.type === 'success' 
                      ? 'text-green-600' 
                      : statusMessage.type === 'error'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`} />
                </button>
              </div>
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            {user && (
              <button
                onClick={() => setActiveTab('my-orders')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'my-orders'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                <span>My Orders</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('track-order')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'track-order'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Track Order</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'my-orders' && user && <OrdersList />}
            {activeTab === 'track-order' && <OrderLookup />}
            {activeTab === 'my-orders' && !user && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <User className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your orders</h3>
                <p className="text-gray-600 mb-6">
                  Access your order history and track your purchases.
                </p>
                <a
                  href="/auth/login?redirect=/orders"
                  className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}