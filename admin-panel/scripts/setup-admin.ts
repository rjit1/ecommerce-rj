#!/usr/bin/env ts-node

/**
 * Admin User Setup Script
 * 
 * This script creates the admin user from environment variables
 * Run with: npm run setup:admin
 */

import dotenv from 'dotenv'
import path from 'path'
import { createAdminFromEnv, verifyAdminUser, listAdminUsers } from '../lib/admin-setup'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function main() {
  console.log('🚀 RJ4WEAR Admin Setup Script')
  console.log('================================')

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local')
    console.log('\nPlease add to your .env.local file:')
    console.log('ADMIN_EMAIL=your-admin@email.com')
    console.log('ADMIN_PASSWORD=your-secure-password')
    process.exit(1)
  }

  console.log(`📧 Admin Email: ${adminEmail}`)
  console.log('🔐 Admin Password: [HIDDEN]')
  console.log('')

  try {
    // Step 1: Create/Update admin user
    console.log('Step 1: Creating admin user...')
    const createResult = await createAdminFromEnv()
    
    if (!createResult.success) {
      console.error(`❌ Failed to create admin user: ${createResult.message}`)
      if (createResult.error) {
        console.error(`   Error: ${createResult.error}`)
      }
      process.exit(1)
    }

    console.log(`✅ ${createResult.message}`)
    console.log(`   User ID: ${createResult.userId}`)
    console.log('')

    // Step 2: Verify admin user
    console.log('Step 2: Verifying admin user...')
    const verifyResult = await verifyAdminUser(adminEmail)
    
    if (!verifyResult.success) {
      console.error(`❌ Admin verification failed: ${verifyResult.message}`)
      if (verifyResult.error) {
        console.error(`   Error: ${verifyResult.error}`)
      }
      process.exit(1)
    }

    console.log(`✅ ${verifyResult.message}`)
    console.log('')

    // Step 3: List all admin users
    console.log('Step 3: Current admin users:')
    const adminUsers = await listAdminUsers()
    
    if (adminUsers.length === 0) {
      console.log('   No admin users found')
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${(admin as any).user?.email || 'Unknown'} (${admin.role}) - ${admin.is_active ? 'Active' : 'Inactive'}`)
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

  } catch (error: any) {
    console.error('❌ Unexpected error during setup:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main }