-- =============================================
-- MIGRATION: Fix User Address RLS Policies
-- Version: 003
-- Date: 2024-12-19
-- Description: Ensure user_addresses table has proper RLS policies
--              for both INSERT and other operations
-- =============================================

-- Drop existing user address policies to recreate them
DROP POLICY IF EXISTS "Users can manage own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Admins can view all user addresses" ON user_addresses;

-- Create comprehensive policies for user addresses
CREATE POLICY "Users can view own addresses" ON user_addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON user_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON user_addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON user_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for user addresses
CREATE POLICY "Admins can view all user addresses" ON user_addresses
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all user addresses" ON user_addresses
    FOR ALL USING (is_admin());

-- Verify the table exists and has the correct structure
DO $$
DECLARE
    table_exists BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_addresses'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'user_addresses table does not exist!';
    END IF;
    
    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'user_addresses' 
    AND schemaname = 'public';
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'user_addresses table exists: %', table_exists;
    RAISE NOTICE 'Total policies on user_addresses: %', policy_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END $$;

SELECT 'Migration 003_fix_user_address_policies completed successfully! 🎉' as result;