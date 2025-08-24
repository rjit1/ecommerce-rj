import { createSupabaseServerClient, supabase } from './supabase'
import { redirect } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  user_id: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  created_at: string
}

export interface AuthUser extends User {
  admin_profile?: AdminUser
}

// Check if user is authenticated and is an admin
export async function requireAuth(): Promise<AuthUser> {
  const supabase = createSupabaseServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: adminProfile } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminProfile) {
    redirect('/unauthorized')
  }

  return {
    ...user,
    admin_profile: adminProfile
  }
}

// Client-side auth check
export async function checkAdminAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAuthenticated: false, isAdmin: false, user: null }
  }

  const { data: adminProfile } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return {
    isAuthenticated: true,
    isAdmin: !!adminProfile,
    user: {
      ...user,
      admin_profile: adminProfile
    }
  }
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  // Verify admin status after successful login
  if (data.user) {
    const { data: adminProfile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .single()

    if (!adminProfile) {
      await supabase.auth.signOut()
      throw new Error('Access denied. Admin privileges required.')
    }
  }

  return data
}

// Sign in with magic link
export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}