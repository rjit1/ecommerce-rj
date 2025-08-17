import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`)
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.email)

        // Check if user profile exists using admin client to bypass RLS
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('user_profiles')
          .select('id, full_name, phone')
          .eq('id', data.user.id)
          .single()

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('Profile check error:', profileCheckError)
        }

        if (!existingProfile) {
          console.log('Creating user profile for:', data.user.email)

          // Create user profile with data from user metadata using admin client
          const userData = data.user.user_metadata || {}

          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              full_name: userData.full_name || '',
              phone: userData.phone || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Profile creation error in callback:', profileError)
            // Don't fail the auth flow, just log the error
          } else {
            console.log('User profile created successfully')
          }
        } else {
          console.log('User profile already exists')
        }

        // Check the type of authentication flow
        const authType = searchParams.get('type')

        if (authType === 'signup') {
          // For email verification after signup, check if user has an active session
          if (data.session) {
            // User is already logged in, redirect to home page
            console.log('Email verified and user is already logged in, redirecting to home page')
            return NextResponse.redirect(`${origin}/`)
          } else {
            // User needs to log in, redirect to login page
            console.log('Email verified after signup, redirecting to login page')
            return NextResponse.redirect(`${origin}/auth/login?verified=true`)
          }
        } else if (authType === 'magic_link' || data.session) {
          // For magic link login, redirect to a special success page that handles session sync
          console.log('Magic link login successful, redirecting to auth success page')
          return NextResponse.redirect(`${origin}/auth/success?next=${encodeURIComponent(next)}`)
        } else {
          // Default case - redirect to login page
          console.log('Authentication completed, redirecting to login page')
          return NextResponse.redirect(`${origin}/auth/login?verified=true`)
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=callback_failed`)
    }
  }

  // No code provided
  console.error('No auth code provided in callback')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}