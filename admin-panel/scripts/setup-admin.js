#!/usr/bin/env node

/**
 * Admin User Setup Script (JavaScript version)
 * 
 * This script creates the admin user from environment variables
 * Run with: npm run setup:admin
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase configuration missing')
  console.error('Please check your .env.local file has:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local')
    console.log('\nPlease add to your .env.local file:')
    console.log('ADMIN_EMAIL=your-admin@email.com')
    console.log('ADMIN_PASSWORD=your-secure-password')
    process.exit(1)
  }

  try {
    console.log('🚀 RJ4WEAR Admin Setup Script')
    console.log('================================')
    console.log(`📧 Admin Email: ${adminEmail}`)
    console.log('🔐 Admin Password: [HIDDEN]')
    console.log('')

    // Step 1: Check if user exists in auth.users
    console.log('Step 1: Checking existing users...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users?.find(user => user.email === adminEmail)

    let userId

    if (existingUser) {
      userId = existingUser.id
      console.log(`📧 Admin user already exists: ${adminEmail}`)
    } else {
      // Create new user
      console.log('Creating new admin user...')
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          created_by: 'admin-setup',
          created_at: new Date().toISOString()
        }
      })

      if (authError || !newUser.user) {
        console.error(`❌ Failed to create admin user: ${authError?.message}`)
        process.exit(1)
      }

      userId = newUser.user.id
      console.log(`✅ Created admin user in auth: ${adminEmail}`)
    }

    // Step 2: Check/Create admin_users entry
    console.log('\nStep 2: Setting up admin permissions...')
    
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingAdmin) {
      // Update existing admin
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ 
          is_active: true, 
          role: 'admin'
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error(`❌ Failed to update admin user: ${updateError.message}`)
        process.exit(1)
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
        console.error(`❌ Failed to create admin entry: ${adminError.message}`)
        process.exit(1)
      }

      console.log(`🆕 Created new admin user: ${adminEmail}`)
    }

    // Step 3: Verify setup
    console.log('\nStep 3: Verifying admin setup...')
    
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (verifyError || !verifyAdmin || !verifyAdmin.is_active) {
      console.error(`❌ Admin verification failed`)
      process.exit(1)
    }

    console.log(`✅ Admin user verified successfully`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Role: ${verifyAdmin.role}`)
    console.log(`   Active: ${verifyAdmin.is_active}`)

    // Step 4: List all admin users
    console.log('\nStep 4: Current admin users:')
    const { data: allAdmins } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (allAdmins && allAdmins.length > 0) {
      allAdmins.forEach((admin, index) => {
        console.log(`   ${index + 1}. User ID: ${admin.user_id.substring(0, 8)}... (${admin.role}) - ${admin.is_active ? 'Active' : 'Inactive'}`)
      })
    }

    console.log('')
    console.log('🎉 Admin setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Start the admin panel: npm run dev')
    console.log('2. Navigate to: http://localhost:3002/login')
    console.log(`3. Login with: ${adminEmail}`)
    console.log('4. Access the admin dashboard')
    console.log('')
    console.log('🔒 Security Notes:')
    console.log('- Admin credentials are stored securely in environment variables')
    console.log('- User authentication is handled by Supabase Auth')
    console.log('- Admin permissions are verified via admin_users table')
    console.log('- All admin actions are logged and audited')

  } catch (error) {
    console.error('❌ Unexpected error during setup:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the script
createAdminUser().catch(console.error)