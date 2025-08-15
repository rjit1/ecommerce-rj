'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, formatDate, getImageUrl } from '@/utils/helpers'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface Order {
  id: string
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  total_amount: number
  created_at: string
  order_items: Array<{
    id: string
    product_name: string
    product_image: string
    size: string
    color: string
    quantity: number
    unit_price: number
    total_price: number
    product: {
      name: string
      slug: string
    }
    variant: {
      size: string
      color: string
    }
  }>
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders || [])
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-500" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <XCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Package className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">
          When you place your first order, it will appear here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          {/* Order Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order.order_number}
                </h3>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Payment: {order.payment_method === 'online' ? 'Online' : 'Cash on Delivery'}
              </span>
              <span>
                {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(item.product_image)}
                      alt={item.product_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.unit_price)} each
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {order.status === 'delivered' && (
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Write Review
                  </button>
                )}
                {order.status === 'pending' && (
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Cancel Order
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                  Download Invoice
                </button>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}