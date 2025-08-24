import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${error.message}`)
    }

    if (data.user) {
      // Check if user is admin
      const { data: adminProfile } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .single()

      if (!adminProfile) {
        // Sign out if not admin
        await supabase.auth.signOut()
        return NextResponse.redirect(`${requestUrl.origin}/unauthorized`)
      }

      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}