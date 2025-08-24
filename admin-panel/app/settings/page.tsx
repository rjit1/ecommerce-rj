'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { SiteSetting } from '@/types'
import toast from 'react-hot-toast'

const settingsSchema = z.object({
  delivery_fee: z.number().min(0, 'Delivery fee cannot be negative'),
  free_delivery_threshold: z.number().min(0, 'Threshold cannot be negative'),
  estimated_delivery_text: z.string().min(1, 'Delivery text is required'),
  top_header_text: z.string().min(1, 'Header text is required'),
  top_header_enabled: z.boolean(),
  site_name: z.string().min(1, 'Site name is required'),
  site_description: z.string().min(1, 'Site description is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().min(1, 'Phone number is required'),
  whatsapp_number: z.string().min(1, 'WhatsApp number is required'),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, any>>({})

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      delivery_fee: 50,
      free_delivery_threshold: 999,
      estimated_delivery_text: '3-5 business days',
      top_header_text: 'Free delivery on orders above ₹999!',
      top_header_enabled: true,
      site_name: 'RJ4WEAR',
      site_description: 'Premium clothing for modern lifestyle',
      contact_email: 'support@rj4wear.com',
      contact_phone: '+91-9876543210',
      whatsapp_number: '+91-9876543210',
    },
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')

      if (error) throw error

      // Convert array to object for easier access
      const settingsObj: Record<string, any> = {}
      data?.forEach(setting => {
        let value: any = setting.value
        
        // Convert string values to appropriate types
        if (setting.key === 'delivery_fee' || setting.key === 'free_delivery_threshold') {
          value = parseFloat(setting.value || '0')
        } else if (setting.key === 'top_header_enabled') {
          value = setting.value === 'true'
        }
        
        settingsObj[setting.key] = value
        setValue(setting.key as keyof SettingsFormData, value)
      })

      setSettings(settingsObj)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // Convert form data to array of setting updates
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value),
      }))

      // Update each setting
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' })

        if (error) throw error
      }

      toast.success('Settings updated successfully!')
      fetchSettings()
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to update settings')
    }
  }

  if (loading) {
    return (
      <MainLayout title="Settings" subtitle="Configure site settings">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="pulse-bg h-6 w-32 mb-6"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j}>
                      <div className="pulse-bg h-4 w-24 mb-2"></div>
                      <div className="pulse-bg h-10 w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Settings" subtitle="Configure site settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Site Name</label>
                <input
                  {...register('site_name')}
                  type="text"
                  className="form-input"
                  placeholder="Site name"
                />
                {errors.site_name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.site_name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Contact Email</label>
                <input
                  {...register('contact_email')}
                  type="email"
                  className="form-input"
                  placeholder="contact@example.com"
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-danger-600">{errors.contact_email.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  {...register('contact_phone')}
                  type="text"
                  className="form-input"
                  placeholder="+91-9876543210"
                />
                {errors.contact_phone && (
                  <p className="mt-1 text-sm text-danger-600">{errors.contact_phone.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">WhatsApp Number</label>
                <input
                  {...register('whatsapp_number')}
                  type="text"
                  className="form-input"
                  placeholder="+91-9876543210"
                />
                {errors.whatsapp_number && (
                  <p className="mt-1 text-sm text-danger-600">{errors.whatsapp_number.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Site Description</label>
                <textarea
                  {...register('site_description')}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Site description for SEO"
                />
                {errors.site_description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.site_description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Delivery Fee (₹)</label>
                <input
                  {...register('delivery_fee', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="50"
                />
                {errors.delivery_fee && (
                  <p className="mt-1 text-sm text-danger-600">{errors.delivery_fee.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Free Delivery Threshold (₹)</label>
                <input
                  {...register('free_delivery_threshold', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="999"
                />
                {errors.free_delivery_threshold && (
                  <p className="mt-1 text-sm text-danger-600">{errors.free_delivery_threshold.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Estimated Delivery Time</label>
                <input
                  {...register('estimated_delivery_text')}
                  type="text"
                  className="form-input"
                  placeholder="3-5 business days"
                />
                {errors.estimated_delivery_text && (
                  <p className="mt-1 text-sm text-danger-600">{errors.estimated_delivery_text.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Header Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Header Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  {...register('top_header_enabled')}
                  type="checkbox"
                  id="top_header_enabled"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="top_header_enabled" className="text-sm font-medium text-gray-900">
                  Enable top header banner
                </label>
              </div>

              <div>
                <label className="form-label">Header Text</label>
                <input
                  {...register('top_header_text')}
                  type="text"
                  className="form-input"
                  placeholder="Free delivery on orders above ₹999!"
                />
                {errors.top_header_text && (
                  <p className="mt-1 text-sm text-danger-600">{errors.top_header_text.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={fetchSettings}
              className="btn-secondary"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  )
}