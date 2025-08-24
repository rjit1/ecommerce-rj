'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { formatCurrency, formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: ClockIcon, 
    text: 'Pending' 
  },
  confirmed: { 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircleIcon, 
    text: 'Confirmed' 
  },
  processing: { 
    color: 'bg-purple-100 text-purple-800', 
    icon: TruckIcon, 
    text: 'Processing' 
  },
  shipped: { 
    color: 'bg-orange-100 text-orange-800', 
    icon: TruckIcon, 
    text: 'Shipped' 
  },
  delivered: { 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircleIcon, 
    text: 'Delivered' 
  },
  cancelled: { 
    color: 'bg-red-100 text-red-800', 
    icon: XCircleIcon, 
    text: 'Cancelled' 
  },
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error

      if (!data) {
        toast.error('Order not found')
        router.push('/orders')
        return
      }

      setOrder(data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      toast.error('Failed to load order details')
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return

    try {
      setUpdatingStatus(true)
      
      const updateData: any = { status: newStatus }
      
      // Set delivered_at when status is delivered
      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      if (error) throw error

      setOrder(prev => prev ? { ...prev, ...updateData } : null)
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <MainLayout title="Order Details" subtitle="Loading...">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="pulse-bg h-6 w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="pulse-bg h-4 w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </MainLayout>
    )
  }

  if (!order) {
    return (
      <MainLayout title="Order Not Found" subtitle="">
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-500">
            The requested order could not be found.
          </p>
        </div>
      </MainLayout>
    )
  }

  const StatusIcon = statusConfig[order.status].icon

  return (
    <MainLayout 
      title={`Order #${order.order_number}`} 
      subtitle={`Placed on ${formatDate(order.created_at)}`}
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
              <div className="flex items-center space-x-2">
                <StatusIcon className={`w-5 h-5 ${
                  statusConfig[order.status].color.includes('green') ? 'text-green-600' :
                  statusConfig[order.status].color.includes('blue') ? 'text-blue-600' :
                  statusConfig[order.status].color.includes('yellow') ? 'text-yellow-600' :
                  statusConfig[order.status].color.includes('red') ? 'text-red-600' :
                  statusConfig[order.status].color.includes('orange') ? 'text-orange-600' :
                  'text-purple-600'
                }`} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].color}`}>
                  {statusConfig[order.status].text}
                </span>
              </div>
            </div>

            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div>
                <label className="form-label">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                  disabled={updatingStatus}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {order.delivered_at && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Delivered on {formatDate(order.delivered_at)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
            
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.product_name}
                    </h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Size: {item.size} • Color: {item.color}</div>
                      <div>Quantity: {item.quantity}</div>
                      <div>Unit Price: {formatCurrency(item.unit_price)}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              
              {order.coupon_code && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coupon ({order.coupon_code})</span>
                  <span className="text-green-600">-{formatCurrency(order.coupon_discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-900">
                  {order.applied_delivery_fee > 0 
                    ? formatCurrency(order.applied_delivery_fee) 
                    : 'Free'
                  }
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                <div className="text-sm text-gray-900">{order.customer_name}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <div className="text-sm text-gray-900">{order.customer_email}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                <div className="text-sm text-gray-900">{order.customer_phone}</div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
            </div>
            
            <div className="text-sm text-gray-900 space-y-1">
              <div>{order.shipping_address_line_1}</div>
              {order.shipping_address_line_2 && (
                <div>{order.shipping_address_line_2}</div>
              )}
              <div>
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
              </div>
              <div>{order.shipping_country}</div>
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <CreditCardIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Method</label>
                <div className="text-sm text-gray-900 capitalize">
                  {order.payment_method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : order.payment_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : order.payment_status === 'refunded'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
              {order.razorpay_payment_id && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment ID</label>
                  <div className="text-sm text-gray-900 font-mono">{order.razorpay_payment_id}</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <button
              onClick={() => window.print()}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print Order</span>
            </button>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}