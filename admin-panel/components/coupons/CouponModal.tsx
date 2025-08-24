'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon, TicketIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { Coupon, CouponFormData } from '@/types'
import toast from 'react-hot-toast'

const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50, 'Code too long'),
  discount_type: z.enum(['percentage', 'fixed'], {
    required_error: 'Discount type is required',
  }),
  discount_value: z.number().min(0.01, 'Discount value must be positive'),
  min_order_amount: z.number().min(0, 'Min order amount cannot be negative'),
  max_discount_amount: z.number().optional(),
  usage_limit: z.number().min(1, 'Usage limit must be at least 1').optional(),
  is_active: z.boolean(),
  expires_at: z.string().optional().or(z.literal('')),
})

interface CouponModalProps {
  coupon?: Coupon | null
  onSuccess: () => void
  onClose: () => void
}

export default function CouponModal({ coupon, onSuccess, onClose }: CouponModalProps) {
  const isEditing = !!coupon

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || '',
      discount_type: coupon?.discount_type || 'percentage',
      discount_value: coupon?.discount_value || 0,
      min_order_amount: coupon?.min_order_amount || 0,
      max_discount_amount: coupon?.max_discount_amount || undefined,
      usage_limit: coupon?.usage_limit || undefined,
      is_active: coupon?.is_active ?? true,
      expires_at: coupon?.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
    },
  })

  const watchDiscountType = watch('discount_type')

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', result)
  }

  const onSubmit = async (data: CouponFormData) => {
    try {
      // Prepare the data
      const couponData = {
        ...data,
        code: data.code.toUpperCase().trim(),
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        max_discount_amount: watchDiscountType === 'percentage' ? data.max_discount_amount : null,
        usage_limit: data.usage_limit || null,
      }

      if (isEditing) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', coupon.id)

        if (error) throw error
        toast.success('Coupon updated successfully!')
      } else {
        // Create new coupon
        const { error } = await supabase
          .from('coupons')
          .insert(couponData)

        if (error) throw error
        toast.success('Coupon created successfully!')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Failed to save coupon:', error)
      
      // Handle specific errors
      if (error.code === '23505') {
        toast.error('A coupon with this code already exists')
      } else {
        toast.error('Failed to save coupon')
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <TicketIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Edit Coupon' : 'Create Coupon'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isEditing ? 'Update coupon details' : 'Create a new discount coupon'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="form-label">Coupon Code *</label>
                <div className="flex space-x-2">
                  <input
                    {...register('code')}
                    type="text"
                    className="form-input flex-1 font-mono"
                    placeholder="SAVE10"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={generateCouponCode}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-1 text-sm text-danger-600">{errors.code.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Discount Type *</label>
                  <select
                    {...register('discount_type')}
                    className="form-input"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                  {errors.discount_type && (
                    <p className="mt-1 text-sm text-danger-600">{errors.discount_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Discount Value * {watchDiscountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    {...register('discount_value', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={watchDiscountType === 'percentage' ? "100" : undefined}
                    className="form-input"
                    placeholder={watchDiscountType === 'percentage' ? '10' : '100'}
                  />
                  {errors.discount_value && (
                    <p className="mt-1 text-sm text-danger-600">{errors.discount_value.message}</p>
                  )}
                </div>
              </div>

              {watchDiscountType === 'percentage' && (
                <div>
                  <label className="form-label">Max Discount Amount (₹)</label>
                  <input
                    {...register('max_discount_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="500"
                  />
                  {errors.max_discount_amount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.max_discount_amount.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum discount amount for percentage coupons (optional)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Min Order Amount (₹) *</label>
                  <input
                    {...register('min_order_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0"
                  />
                  {errors.min_order_amount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.min_order_amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Usage Limit</label>
                  <input
                    {...register('usage_limit', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="100"
                  />
                  {errors.usage_limit && (
                    <p className="mt-1 text-sm text-danger-600">{errors.usage_limit.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    How many times this coupon can be used (optional)
                  </p>
                </div>
              </div>

              <div>
                <label className="form-label">Expiry Date</label>
                <input
                  {...register('expires_at')}
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.expires_at && (
                  <p className="mt-1 text-sm text-danger-600">{errors.expires_at.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for no expiry date
                </p>
              </div>

              <div className="flex items-center">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  id="is_active"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">
                  Active coupon
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Coupon' : 'Create Coupon'}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}