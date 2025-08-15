 'use client'

import { CreditCard, Banknote, Truck, Gift } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'

interface PaymentMethodsProps {
  selectedMethod: 'online' | 'cod'
  onMethodSelect: (method: 'online' | 'cod') => void
  codFee: number
  subtotal: number
  freeDeliveryThreshold: number
}

export default function PaymentMethods({
  selectedMethod,
  onMethodSelect,
  codFee,
  subtotal,
  freeDeliveryThreshold
}: PaymentMethodsProps) {
  const isEligibleForFreeDelivery = subtotal >= freeDeliveryThreshold

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>

      <div className="space-y-4">
        {/* Online Payment */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
            selectedMethod === 'online'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onMethodSelect('online')}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
              selectedMethod === 'online'
                ? 'border-primary-500 bg-primary-500'
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'online' && (
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium text-gray-900">Online Payment</h3>
                {!isEligibleForFreeDelivery && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <Gift className="w-3 h-3" />
                    <span>Free Delivery</span>
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Pay securely using UPI, Credit/Debit Cards, Net Banking, or Wallets
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img src="/images/payment/upi.png" alt="UPI" className="h-6" />
                  <img src="/images/payment/visa.png" alt="Visa" className="h-6" />
                  <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-6" />
                  <img src="/images/payment/rupay.png" alt="RuPay" className="h-6" />
                </div>
              </div>
              
              {!isEligibleForFreeDelivery && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Get FREE delivery with online payment!
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Save ₹50 on delivery charges by paying online
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cash on Delivery */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
            selectedMethod === 'cod'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onMethodSelect('cod')}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
              selectedMethod === 'cod'
                ? 'border-primary-500 bg-primary-500'
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'cod' && (
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Banknote className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                {codFee > 0 && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    +{formatCurrency(codFee)} fee
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Pay with cash when your order is delivered to your doorstep
              </p>
              
              {codFee > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>COD Fee:</strong> {formatCurrency(codFee)} will be added to your order total
                  </p>
                  {!isEligibleForFreeDelivery && (
                    <p className="text-xs text-orange-600 mt-1">
                      Plus ₹50 delivery charges (Free above {formatCurrency(freeDeliveryThreshold)})
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No need to pay online</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Inspect before payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Easy returns if not satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Security Note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Secure Payment</h4>
            <p className="text-sm text-gray-600">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}