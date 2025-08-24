-- =============================================
-- SUPABASE STORAGE BUCKET POLICIES SETUP
-- RJ4WEAR E-Commerce Platform
-- =============================================
-- 
-- This file sets up all necessary RLS policies for Supabase Storage buckets
-- Run this in Supabase SQL Editor after creating the storage buckets
--
-- Required buckets: products, banners, categories, variants
-- =============================================

-- =============================================
-- 1. ENABLE RLS ON STORAGE BUCKETS
-- =============================================

-- Enable Row Level Security on storage buckets table
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on storage objects table  
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. CREATE HELPER FUNCTION FOR ADMIN CHECK
-- =============================================

-- Create function to check if user is admin (if not exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user exists in admin_users table and is active
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- =============================================
-- 3. STORAGE BUCKET ACCESS POLICIES
-- =============================================

-- Policy: Allow public read access to all buckets
CREATE POLICY "Public can view all buckets" ON storage.buckets
FOR SELECT USING (true);

-- Policy: Allow admins to create buckets (optional - usually done via dashboard)
CREATE POLICY "Admins can create buckets" ON storage.buckets
FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- 4. STORAGE OBJECTS POLICIES
-- =============================================

-- =============================================
-- 4.1 PRODUCTS BUCKET POLICIES
-- =============================================

-- Policy: Public can view product images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Policy: Admins can upload product images
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' 
  AND is_admin()
);

-- Policy: Admins can update product images
CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' 
  AND is_admin()
);

-- Policy: Admins can delete product images
CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' 
  AND is_admin()
);

-- =============================================
-- 4.2 BANNERS BUCKET POLICIES
-- =============================================

-- Policy: Public can view banner images
CREATE POLICY "Public can view banner images" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

-- Policy: Admins can upload banner images
CREATE POLICY "Admins can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners' 
  AND is_admin()
);

-- Policy: Admins can update banner images
CREATE POLICY "Admins can update banner images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'banners' 
  AND is_admin()
);

-- Policy: Admins can delete banner images
CREATE POLICY "Admins can delete banner images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banners' 
  AND is_admin()
);

-- =============================================
-- 4.3 CATEGORIES BUCKET POLICIES
-- =============================================

-- Policy: Public can view category images
CREATE POLICY "Public can view category images" ON storage.objects
FOR SELECT USING (bucket_id = 'categories');

-- Policy: Admins can upload category images
CREATE POLICY "Admins can upload category images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'categories' 
  AND is_admin()
);

-- Policy: Admins can update category images
CREATE POLICY "Admins can update category images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'categories' 
  AND is_admin()
);

-- Policy: Admins can delete category images
CREATE POLICY "Admins can delete category images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'categories' 
  AND is_admin()
);

-- =============================================
-- 4.4 VARIANTS BUCKET POLICIES (Future Use)
-- =============================================

-- Policy: Public can view variant images
CREATE POLICY "Public can view variant images" ON storage.objects
FOR SELECT USING (bucket_id = 'variants');

-- Policy: Admins can upload variant images
CREATE POLICY "Admins can upload variant images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'variants' 
  AND is_admin()
);

-- Policy: Admins can update variant images
CREATE POLICY "Admins can update variant images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'variants' 
  AND is_admin()
);

-- Policy: Admins can delete variant images
CREATE POLICY "Admins can delete variant images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'variants' 
  AND is_admin()
);

-- =============================================
-- 5. ALTERNATIVE POLICIES FOR DEVELOPMENT/TESTING
-- =============================================
-- Uncomment the policies below ONLY for development/testing
-- DO NOT use in production as they allow unrestricted access

-- Development: Allow authenticated users to upload to any bucket (DEVELOPMENT ONLY)
/*
CREATE POLICY "DEV: Authenticated can upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
*/

-- Development: Allow public uploads (VERY INSECURE - DEVELOPMENT ONLY)  
/*
CREATE POLICY "DEV: Public uploads allowed" ON storage.objects
FOR INSERT WITH CHECK (true);
*/

-- =============================================
-- 6. VERIFICATION QUERIES
-- =============================================

-- Check if policies are created correctly
-- Run these queries to verify the setup:

-- List all storage policies
/*
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
ORDER BY tablename, policyname;
*/

-- Check bucket accessibility
/*
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY name;
*/

-- =============================================
-- 7. CLEANUP POLICIES (IF NEEDED)
-- =============================================
-- Uncomment and run these if you need to remove policies

-- Remove all storage policies (CAREFUL!)
/*
DROP POLICY IF EXISTS "Public can view all buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can create buckets" ON storage.buckets;

-- Products
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Banners  
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- Categories
DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;

-- Variants
DROP POLICY IF EXISTS "Public can view variant images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload variant images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update variant images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete variant images" ON storage.objects;
*/

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- If you see this message, the storage policies setup is complete!
DO $$
BEGIN
    RAISE NOTICE '✅ STORAGE BUCKET POLICIES SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '📂 Configured buckets: products, banners, categories, variants';
    RAISE NOTICE '🔒 Security: Public read, Admin write access';
    RAISE NOTICE '🎯 Next: Test uploads through admin panel';
END $$;