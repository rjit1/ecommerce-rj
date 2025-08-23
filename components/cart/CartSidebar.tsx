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
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-6 md:pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500 md:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500 md:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm sm:max-w-md md:max-w-lg">
                  <div className="flex h-full flex-col bg-white shadow-xl border-l border-gray-200">
                    {/* Header - Fixed */}
                    <div className="flex-shrink-0 flex items-center justify-between px-3 py-4 sm:px-6 sm:py-6 border-b border-gray-200 bg-white">
                      <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-600" />
                        <span className="truncate">Cart ({totalQuantity})</span>
                      </Dialog.Title>
                      <button
                        type="button"
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200 touch-manipulation hover:bg-gray-100 rounded-full"
                        onClick={onClose}
                        aria-label="Close cart"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Cart Items - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 min-h-0">
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary-600"></div>
                        </div>
                      ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-2">
                          <div className="p-3 bg-gray-50 rounded-full mb-4">
                            <ShoppingBag className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-6 px-2 max-w-xs">Discover amazing products and start building your perfect collection!</p>
                          <Link
                            href="/products"
                            onClick={onClose}
                            className="inline-flex items-center px-4 py-2.5 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-semibold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 touch-manipulation hover:shadow-lg"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                                <OptimizedImage
                                  src={item.product?.featured_image || item.product?.images?.[0]?.image_url}
                                  alt={item.product?.name || 'Product'}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                                  {item.product?.name}
                                </h4>
                                <div className="flex items-center space-x-1 mb-2">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    {item.variant?.size}
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    {item.variant?.color}
                                  </span>
                                </div>
                                
                                {/* Price Row */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex flex-col">
                                    <p className="text-sm sm:text-base font-bold text-primary-600">
                                      {formatCurrency(item.product?.discount_price || item.product?.price || 0)}
                                    </p>
                                    {item.product?.discount_price && item.product?.price && item.product.discount_price < item.product.price && (
                                      <p className="text-xs text-gray-400 line-through">
                                        {formatCurrency(item.product.price)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Quantity Controls Row */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 touch-manipulation border border-gray-300"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    <span className="text-sm font-semibold w-8 text-center py-1">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 touch-manipulation border border-gray-300"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors duration-200 touch-manipulation border border-red-200"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer - Fixed at bottom */}
                    {items.length > 0 && (
                      <div className="flex-shrink-0 border-t border-gray-200 px-3 pt-3 pb-6 sm:px-6 sm:py-6 bg-white shadow-lg">
                        <div className="space-y-2.5">
                          {/* Continue shopping link */}
                          <div className="text-center">
                            <button
                              type="button"
                              className="text-sm text-primary-600 font-medium hover:text-primary-500 transition-colors duration-200 touch-manipulation underline"
                              onClick={onClose}
                            >
                              ← Continue Shopping
                            </button>
                          </div>
                          
                          {/* Subtotal */}
                          <div className="flex justify-between items-center text-base sm:text-lg font-bold text-gray-900 py-1.5 border-t border-gray-100">
                            <span>Subtotal</span>
                            <span className="text-primary-600">{formatCurrency(subtotal)}</span>
                          </div>
                          
                          {/* Shipping note */}
                          <p className="text-xs sm:text-sm text-gray-500 text-center pb-1">
                            Shipping and taxes calculated at checkout
                          </p>
                          
                          {/* Action buttons */}
                          <div className="space-y-2">
                            <Link
                              href="/checkout"
                              onClick={onClose}
                              className="w-full flex justify-center items-center px-4 py-2.5 sm:px-6 sm:py-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 touch-manipulation hover:shadow-lg"
                            >
                              Proceed to Checkout
                            </Link>
                            <Link
                              href="/cart"
                              onClick={onClose}
                              className="w-full flex justify-center items-center px-4 py-2 sm:px-6 sm:py-3 border-2 border-primary-200 rounded-lg shadow-sm text-sm sm:text-base font-semibold text-primary-600 bg-white hover:bg-primary-50 transition-all duration-200 touch-manipulation"
                            >
                              View Full Cart
                            </Link>
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