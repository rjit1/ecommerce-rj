import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createSupabaseServerClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
        // Check if user profile exists, if not create it
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          // Create user profile with data from user metadata
          const userData = data.user.user_metadata || {}
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              full_name: userData.full_name || '',
              phone: userData.phone || ''
            })

          if (profileError) {
            console.error('Profile creation error in callback:', profileError)
          }
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}