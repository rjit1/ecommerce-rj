'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/helpers'
import OptimizedImage from '@/components/ui/OptimizedImage'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, loading, subtotal, totalQuantity, updateQuantity, removeItem } = useCart()

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header - Fixed */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-6 sm:px-6 border-b border-gray-200 bg-white">
                      <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Shopping Cart ({totalQuantity})
                      </Dialog.Title>
                      <button
                        type="button"
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                        onClick={onClose}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Cart Items - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 min-h-0">
                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Your cart is empty</h3>
                          <p className="text-sm text-gray-500 mb-6">Start adding some products!</p>
                          <Link
                            href="/products"
                            onClick={onClose}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {items.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                            >
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white">
                                <OptimizedImage
                                  src={item.product?.featured_image || item.product?.images?.[0]?.image_url}
                                  alt={item.product?.name || 'Product'}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                  {item.product?.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                  {item.variant?.size} • {item.variant?.color}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency(item.product?.discount_price || item.product?.price || 0)}
                                  </p>
                                  
                                  {/* Quantity Controls */}
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-medium w-6 text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-200 ml-2"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer - Fixed at bottom */}
                    {items.length > 0 && (
                      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 bg-white shadow-lg">
                        <div className="space-y-4">
                          {/* Subtotal */}
                          <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                            <span>Subtotal</span>
                            <span className="text-primary-600">{formatCurrency(subtotal)}</span>
                          </div>
                          
                          {/* Shipping note */}
                          <p className="text-sm text-gray-500 text-center">
                            Shipping and taxes calculated at checkout
                          </p>
                          
                          {/* Action buttons */}
                          <div className="space-y-3">
                            <Link
                              href="/checkout"
                              onClick={onClose}
                              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                            >
                              Proceed to Checkout
                            </Link>
                            <Link
                              href="/cart"
                              onClick={onClose}
                              className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                              View Full Cart
                            </Link>
                          </div>
                          
                          {/* Continue shopping link */}
                          <div className="text-center">
                            <button
                              type="button"
                              className="text-sm text-primary-600 font-medium hover:text-primary-500 transition-colors duration-200"
                              onClick={onClose}
                            >
                              Continue Shopping
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}