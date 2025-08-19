'use client'

import Image from 'next/image'
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, formatDate, getImageUrl } from '@/utils/helpers'
import { Order } from '@/types'

interface OrderDetailsProps {
  order: Order
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />
      case 'processing':
        return <Package className="w-6 h-6 text-purple-500" />
      case 'shipped':
        return <Truck className="w-6 h-6 text-orange-500" />
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Clock className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'shipped':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being processed.'
      case 'confirmed':
        return 'Your order has been confirmed and will be processed soon.'
      case 'processing':
        return 'Your order is being prepared for shipment.'
      case 'shipped':
        return 'Your order has been shipped and is on its way to you.'
      case 'delivered':
        return 'Your order has been successfully delivered.'
      case 'cancelled':
        return 'Your order has been cancelled.'
      default:
        return 'Order status is being updated.'
    }
  }

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ]

  const getCurrentStepIndex = () => {
    if (order.status === 'cancelled') return -1
    return orderSteps.findIndex(step => step.key === order.status)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Order Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="font-medium capitalize">{order.status}</span>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{getStatusMessage(order.status)}</p>

        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {orderSteps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-primary-600 border-primary-600 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      isCurrent ? 'text-primary-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < orderSteps.length - 1 && (
                      <div className={`absolute h-0.5 w-full mt-5 ${
                        index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                      }`} style={{ 
                        left: '50%', 
                        right: '-50%',
                        zIndex: -1
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(order.total_amount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="text-lg font-semibold text-gray-900">
              {order.payment_method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Items</p>
            <p className="text-lg font-semibold text-gray-900">
              {(order.order_items || order.items)?.length || 0} {((order.order_items || order.items)?.length || 0) === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {(order.order_items || order.items)?.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white">
                <Image
                  src={getImageUrl(item.product_image)}
                  alt={item.product_name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.product_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Size: {item.size} • Color: {item.color}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
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
      </div>

      {/* Customer & Shipping Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-700">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-700">{order.customer_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Shipping Address
          </h2>
          <div className="text-gray-700 space-y-1">
            <p>{order.shipping_address_line_1}</p>
            {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
            <p>{order.shipping_city}, {order.shipping_state}</p>
            <p>{order.shipping_postal_code}</p>
            <p>{order.shipping_country}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Order Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          {order.coupon_discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Coupon ({order.coupon_code})</span>
              <span className="text-green-600">-{formatCurrency(order.coupon_discount)}</span>
            </div>
          )}
          {order.applied_delivery_fee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900">{formatCurrency(order.applied_delivery_fee)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}