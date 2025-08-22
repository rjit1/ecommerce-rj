'use client'

import Image from 'next/image'
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard, Phone, Mail, ShoppingBag } from 'lucide-react'
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-3 py-2 sm:px-4 rounded-full border self-start sm:self-auto ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="font-medium capitalize text-sm sm:text-base">{order.status}</span>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{getStatusMessage(order.status)}</p>

        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <div className="mb-6">
            {/* Mobile: Vertical Progress (under 640px) */}
            <div className="block sm:hidden">
              <div className="space-y-4">
                {orderSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  
                  return (
                    <div key={step.key} className="relative flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-primary-600 border-primary-600 text-white' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="ml-3 flex-1">
                        <span className={`text-sm font-medium block ${
                          isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-primary-500 block mt-0.5">In Progress</span>
                        )}
                      </div>
                      {index < orderSteps.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-6 ${
                          index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tablet & Desktop: Horizontal Progress (640px and above) */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="flex items-center justify-between min-w-[600px] px-4">
                {orderSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  
                  return (
                    <div key={step.key} className="relative flex flex-col items-center" style={{ minWidth: '100px' }}>
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 ${
                        isCompleted 
                          ? 'bg-primary-600 border-primary-600 text-white' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        <StepIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <span className={`text-xs lg:text-sm mt-2 text-center whitespace-nowrap ${
                        isCurrent ? 'text-primary-600 font-medium' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                      {index < orderSteps.length - 1 && (
                        <div 
                          className={`absolute top-5 lg:top-6 left-1/2 h-0.5 ${
                            index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                          }`}
                          style={{ 
                            width: '80px',
                            marginLeft: '50px',
                            zIndex: -1
                          }} 
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Summary Cards */}
        <div className="pt-4 border-t border-gray-200">
          {/* Mobile: Stacked Cards (under 640px) */}
          <div className="block sm:hidden space-y-3">
            {/* Total Amount Card */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-700">Total Amount</p>
                    <p className="text-xs text-primary-600">Order Value</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-900">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment & Items Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {order.payment_method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Items</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(order.order_items || order.items)?.length || 0} {((order.order_items || order.items)?.length || 0) === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet & Desktop: Professional Cards (640px and above) */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Total Amount - Featured Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-6 h-6 text-primary-100" />
                  <span className="text-xs bg-primary-700/50 px-2 py-1 rounded-full uppercase tracking-wide">
                    Total
                  </span>
                </div>
                <p className="text-primary-100 text-sm mb-1">Order Value</p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wide">
                    Payment
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.payment_method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                </p>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wide">
                    Items
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">Order Items</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(order.order_items || order.items)?.length || 0} {((order.order_items || order.items)?.length || 0) === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-3 sm:space-y-4">
          {(order.order_items || order.items)?.map((item) => (
            <div key={item.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white">
                <Image
                  src={getImageUrl(item.product_image)}
                  alt={item.product_name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                  {item.product_name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Size: {item.size} • Color: {item.color}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                </p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {formatCurrency(item.total_price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer & Shipping Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            <span>Customer Information</span>
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-700 text-sm sm:text-base break-all">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-700 text-sm sm:text-base">{order.customer_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            <span>Shipping Address</span>
          </h2>
          <div className="text-gray-700 space-y-1 text-sm sm:text-base">
            <p className="break-words">{order.shipping_address_line_1}</p>
            {order.shipping_address_line_2 && <p className="break-words">{order.shipping_address_line_2}</p>}
            <p className="break-words">{order.shipping_city}, {order.shipping_state}</p>
            <p>{order.shipping_postal_code}</p>
            <p>{order.shipping_country}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span>Order Summary</span>
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm sm:text-base">Subtotal</span>
            <span className="text-gray-900 text-sm sm:text-base font-medium">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">Discount</span>
              <span className="text-green-600 text-sm sm:text-base font-medium">-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          {order.coupon_discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base break-words">Coupon ({order.coupon_code})</span>
              <span className="text-green-600 text-sm sm:text-base font-medium flex-shrink-0 ml-2">-{formatCurrency(order.coupon_discount)}</span>
            </div>
          )}
          {order.applied_delivery_fee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">Delivery Fee</span>
              <span className="text-gray-900 text-sm sm:text-base font-medium">{formatCurrency(order.applied_delivery_fee)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}