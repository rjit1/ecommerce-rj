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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Shopping Cart ({totalQuantity})
                      </Dialog.Title>
                      <button
                        type="button"
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      ) : items.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                          <p className="mt-1 text-sm text-gray-500">Start adding some products!</p>
                          <div className="mt-6">
                            <Link
                              href="/products"
                              onClick={onClose}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                            >
                              Continue Shopping
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {items.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-center space-x-4"
                            >
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
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
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.product?.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {item.variant?.size} / {item.variant?.color}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatCurrency(item.product?.discount_price || item.product?.price || 0)}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-1 rounded-full hover:bg-red-100 text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                          <p>Subtotal</p>
                          <p>{formatCurrency(subtotal)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 mb-6">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="space-y-3">
                          <Link
                            href="/checkout"
                            onClick={onClose}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                          >
                            Checkout
                          </Link>
                          <Link
                            href="/cart"
                            onClick={onClose}
                            className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Cart
                          </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="text-primary-600 font-medium hover:text-primary-500"
                              onClick={onClose}
                            >
                              Continue Shopping
                            </button>
                          </p>
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