import { supabase } from './supabase'

/**
 * Secure Admin User Management
 * This utility helps create and manage admin users using environment variables
 */

export interface AdminUserCreationResult {
  success: boolean
  message: string
  userId?: string
  error?: string
}

/**
 * Create admin user from environment variables
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in environment
 */
export async function createAdminFromEnv(): Promise<AdminUserCreationResult> {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return {
      success: false,
      message: 'Admin credentials not found in environment variables',
      error: 'ADMIN_EMAIL or ADMIN_PASSWORD not set'
    }
  }

  try {
    // Check if admin already exists in auth.users
    const { data: existingAuthUser } = await supabase.auth.admin.listUsers()
    const existingUser = existingAuthUser.users?.find(user => user.email === adminEmail)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      console.log(`📧 Admin user already exists: ${adminEmail}`)
    } else {
      // Create new user in Supabase Auth
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: 'admin',
          created_by: 'admin-setup',
          created_at: new Date().toISOString()
        }
      })

      if (authError || !newUser.user) {
        return {
          success: false,
          message: 'Failed to create admin user in authentication',
          error: authError?.message || 'Unknown auth error'
        }
      }

      userId = newUser.user.id
      console.log(`✅ Created admin user in auth: ${adminEmail}`)
    }

    // Check if admin already exists in admin_users table
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingAdmin) {
      // Update existing admin to ensure it's active
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ 
          is_active: true, 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        return {
          success: false,
          message: 'Failed to update existing admin user',
          error: updateError.message
        }
      }

      console.log(`🔄 Updated existing admin user: ${adminEmail}`)
    } else {
      // Create new admin entry
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role: 'admin',
          is_active: true
        })

      if (adminError) {
        return {
          success: false,
          message: 'Failed to create admin user in admin_users table',
          error: adminError.message
        }
      }

      console.log(`🆕 Created new admin user: ${adminEmail}`)
    }

    return {
      success: true,
      message: `Admin user successfully configured: ${adminEmail}`,
      userId
    }

  } catch (error: any) {
    return {
      success: false,
      message: 'Unexpected error during admin user creation',
      error: error.message
    }
  }
}

/**
 * Verify admin user exists and has correct permissions
 */
export async function verifyAdminUser(email: string): Promise<AdminUserCreationResult> {
  try {
    // Get user from auth
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers.users?.find(user => user.email === email)

    if (!authUser) {
      return {
        success: false,
        message: 'User not found in authentication system',
        error: `No auth user found for email: ${email}`
      }
    }

    // Check admin_users table
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (error || !adminUser) {
      return {
        success: false,
        message: 'User exists but is not configured as admin',
        error: error?.message || 'Not found in admin_users table'
      }
    }

    if (!adminUser.is_active) {
      return {
        success: false,
        message: 'Admin user exists but is not active',
        error: 'Admin user is deactivated'
      }
    }

    return {
      success: true,
      message: `Admin user verified successfully: ${email}`,
      userId: authUser.id
    }

  } catch (error: any) {
    return {
      success: false,
      message: 'Error verifying admin user',
      error: error.message
    }
  }
}

/**
 * List all admin users
 */
export async function listAdminUsers() {
  try {
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        user:user_id (
          email,
          created_at,
          last_sign_in_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return adminUsers
  } catch (error: any) {
    console.error('Error listing admin users:', error)
    return []
  }
}