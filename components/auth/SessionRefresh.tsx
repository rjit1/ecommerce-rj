'use client'

import { useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SessionRefresh() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we need to refresh due to auth callback
    const shouldRefresh = searchParams.get('refresh') === 'true'

    if (shouldRefresh) {
      console.log('Auth callback refresh detected, updating session...')

      // Remove the refresh parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('refresh')
      window.history.replaceState({}, '', newUrl.toString())

      // Force refresh the session and page
      const refreshSession = async () => {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (data.session) {
            console.log('Session found after magic link, refreshing UI...')
            // Force a full page refresh to update all components
            window.location.reload()
          }
        } catch (error) {
          console.error('Error refreshing session:', error)
        }
      }

      // Small delay to ensure the session is properly set
      const timer = setTimeout(refreshSession, 500)
      return () => clearTimeout(timer)
    }
  }, [supabase, router, searchParams])

  return null // This component doesn't render anything
}
