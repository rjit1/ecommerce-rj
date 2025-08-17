'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function AuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState('Completing authentication...')

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        setMessage('Verifying your session...')
        
        // Wait a moment for the session to be properly established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if session exists
        const { data: sessionData, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          return
        }

        if (sessionData.session) {
          console.log('Session confirmed for user:', sessionData.session.user.email)
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Get the intended redirect URL
          const nextUrl = searchParams.get('next') || '/'
          
          // Wait a moment to show success message
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Force a full page navigation to ensure session is recognized
          window.location.href = nextUrl
        } else {
          console.error('No session found after auth callback')
          setStatus('error')
          setMessage('Session not found. Please try logging in again.')
          
          // Redirect to login after a delay
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        }
      } catch (error) {
        console.error('Auth success handler error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    handleAuthSuccess()
  }, [supabase, router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'checking' && (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  Authenticating
                </h2>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  Success!
                </h2>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="mx-auto h-12 w-12 text-red-500 flex items-center justify-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  Authentication Error
                </h2>
              </>
            )}
            
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            
            {status === 'error' && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
