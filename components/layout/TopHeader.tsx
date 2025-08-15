'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'

interface TopHeaderProps {
  initialText?: string
  initialEnabled?: boolean
}

export default function TopHeader({ initialText, initialEnabled }: TopHeaderProps) {
  const [isVisible, setIsVisible] = useState(initialEnabled ?? true)
  const [headerText, setHeaderText] = useState(initialText ?? '🎉 Free Delivery on Orders Above ₹999! 🚚')
  const [isDismissed, setIsDismissed] = useState(false)
  const supabase = createSupabaseClient()



  useEffect(() => {
    // Check if user has dismissed the header
    const dismissed = localStorage.getItem('top-header-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // Fetch latest header settings
    const fetchHeaderSettings = async () => {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['top_header_text', 'top_header_enabled'])

        if (settings) {
          const textSetting = settings.find(s => s.key === 'top_header_text')
          const enabledSetting = settings.find(s => s.key === 'top_header_enabled')

          if (textSetting?.value) {
            setHeaderText(textSetting.value)
          }
          
          if (enabledSetting?.value) {
            setIsVisible(enabledSetting.value === 'true')
          }
        }
      } catch (error) {
        console.error('Error fetching header settings:', error)
      }
    }

    fetchHeaderSettings()
  }, [supabase])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('top-header-dismissed', 'true')
  }

  if (!isVisible || isDismissed || !headerText) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-primary-500 to-accent-600 text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-center text-center">
        <p className="text-sm font-medium flex-1 px-8">
          {headerText}
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}