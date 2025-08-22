'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import OrderDetails from '@/components/orders/OrderDetails'
import { Order } from '@/types'
import { toast } from 'react-hot-toast'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
      } else {
        if (response.status === 404) {
          setError('Order not found')
        } else if (response.status === 403) {
          setError('You do not have permission to view this order')
        } else {
          setError(data.error || 'Failed to load order details')
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-full max-w-xs mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 sm:h-10 bg-gray-200 rounded w-20 sm:w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-16 sm:h-20 bg-gray-200 rounded w-full"></div>
            </div>

            {/* Items skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-full max-w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 flex-shrink-0"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-400 mb-4">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Order
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 justify-center">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
              <button
                onClick={fetchOrder}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm sm:text-base"
              >
                <Package className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with back button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </button>
        </div>

        {/* Order Details */}
        <OrderDetails order={order} />
      </div>
    </div>
  )
}