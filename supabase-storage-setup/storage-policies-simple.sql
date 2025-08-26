-- =============================================
-- SIMPLE STORAGE POLICIES SETUP
-- RJ4WEAR E-Commerce Platform
-- Safe version - doesn't touch existing functions
-- =============================================

-- =============================================
-- 1. VERIFY ADMIN FUNCTION EXISTS
-- =============================================

-- Check if admin function exists (don't recreate it)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        RAISE NOTICE '✅ Admin function exists - using existing function';
    ELSE
        RAISE EXCEPTION '❌ Admin function not found. Please run main database schema first.';
    END IF;
END $$;

-- =============================================
-- 2. ENABLE RLS ON STORAGE TABLES (if possible)
-- =============================================

-- Try to enable RLS on storage tables
DO $$
BEGIN
    -- Enable RLS on storage.buckets
    BEGIN
        ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on storage.buckets';
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '⚠️  Cannot enable RLS on storage.buckets (insufficient privilege)';
            RAISE NOTICE '📝 Please enable RLS via Supabase Dashboard or contact admin';
        WHEN others THEN
            RAISE NOTICE '⚠️  RLS might already be enabled on storage.buckets';
    END;

    -- Enable RLS on storage.objects  
    BEGIN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on storage.objects';
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '⚠️  Cannot enable RLS on storage.objects (insufficient privilege)';
            RAISE NOTICE '📝 Please enable RLS via Supabase Dashboard or contact admin';
        WHEN others THEN
            RAISE NOTICE '⚠️  RLS might already be enabled on storage.objects';
    END;
END $$;

-- =============================================
-- 3. CLEAN UP EXISTING STORAGE POLICIES ONLY
-- =============================================

-- Drop only storage-related policies (not the main table policies)
DO $$
BEGIN
    -- Drop bucket policies
    BEGIN
        DROP POLICY IF EXISTS "Public can view all buckets" ON storage.buckets;
        DROP POLICY IF EXISTS "Admins can create buckets" ON storage.buckets;
        RAISE NOTICE '🧹 Cleaned up existing bucket policies';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'ℹ️  No existing bucket policies to clean';
    END;
    
    -- Drop storage object policies
    BEGIN
        DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
        
        DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;
        
        DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;
        
        DROP POLICY IF EXISTS "Public can view variant images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can upload variant images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can update variant images" ON storage.objects;
        DROP POLICY IF EXISTS "Admins can delete variant images" ON storage.objects;
        
        RAISE NOTICE '🧹 Cleaned up existing object policies';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'ℹ️  No existing object policies to clean';
    END;
END $$;

-- =============================================
-- 4. CREATE STORAGE BUCKET POLICIES
-- =============================================

-- Try to create bucket policies
DO $$
BEGIN
    -- Public read access to buckets
    BEGIN
        CREATE POLICY "Public can view all buckets" ON storage.buckets
        FOR SELECT USING (true);
        RAISE NOTICE '✅ Created: Public bucket view policy';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '⚠️  Could not create bucket view policy: %', SQLERRM;
    END;

    -- Admin create buckets
    BEGIN
        CREATE POLICY "Admins can create buckets" ON storage.buckets
        FOR INSERT WITH CHECK (public.is_admin());
        RAISE NOTICE '✅ Created: Admin bucket create policy';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '⚠️  Could not create bucket create policy: %', SQLERRM;
    END;
END $$;

-- =============================================
-- 5. CREATE STORAGE OBJECT POLICIES
-- =============================================

-- Products bucket policies
DO $$
BEGIN
    CREATE POLICY "Public can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');
    
    CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products' AND public.is_admin());
    
    CREATE POLICY "Admins can update product images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'products' AND public.is_admin());
    
    CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE USING (bucket_id = 'products' AND public.is_admin());
    
    RAISE NOTICE '✅ Created: Products bucket policies (4 policies)';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️  Error creating products policies: %', SQLERRM;
END $$;

-- Banners bucket policies
DO $$
BEGIN
    CREATE POLICY "Public can view banner images" ON storage.objects
    FOR SELECT USING (bucket_id = 'banners');
    
    CREATE POLICY "Admins can upload banner images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'banners' AND public.is_admin());
    
    CREATE POLICY "Admins can update banner images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'banners' AND public.is_admin());
    
    CREATE POLICY "Admins can delete banner images" ON storage.objects
    FOR DELETE USING (bucket_id = 'banners' AND public.is_admin());
    
    RAISE NOTICE '✅ Created: Banners bucket policies (4 policies)';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️  Error creating banners policies: %', SQLERRM;
END $$;

-- Categories bucket policies
DO $$
BEGIN
    CREATE POLICY "Public can view category images" ON storage.objects
    FOR SELECT USING (bucket_id = 'categories');
    
    CREATE POLICY "Admins can upload category images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'categories' AND public.is_admin());
    
    CREATE POLICY "Admins can update category images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'categories' AND public.is_admin());
    
    CREATE POLICY "Admins can delete category images" ON storage.objects
    FOR DELETE USING (bucket_id = 'categories' AND public.is_admin());
    
    RAISE NOTICE '✅ Created: Categories bucket policies (4 policies)';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️  Error creating categories policies: %', SQLERRM;
END $$;

-- Variants bucket policies  
DO $$
BEGIN
    CREATE POLICY "Public can view variant images" ON storage.objects
    FOR SELECT USING (bucket_id = 'variants');
    
    CREATE POLICY "Admins can upload variant images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'variants' AND public.is_admin());
    
    CREATE POLICY "Admins can update variant images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'variants' AND public.is_admin());
    
    CREATE POLICY "Admins can delete variant images" ON storage.objects
    FOR DELETE USING (bucket_id = 'variants' AND public.is_admin());
    
    RAISE NOTICE '✅ Created: Variants bucket policies (4 policies)';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️  Error creating variants policies: %', SQLERRM;
END $$;

-- =============================================
-- 6. FINAL VERIFICATION AND SUMMARY
-- =============================================

DO $$
DECLARE
    bucket_policies_count INTEGER;
    object_policies_count INTEGER;
    total_policies_count INTEGER;
BEGIN
    -- Count storage policies
    SELECT COUNT(*) INTO bucket_policies_count
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'buckets';
    
    SELECT COUNT(*) INTO object_policies_count
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects';
    
    total_policies_count := bucket_policies_count + object_policies_count;
    
    -- Final report
    RAISE NOTICE '================================';
    RAISE NOTICE '🎯 STORAGE SETUP SUMMARY';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Bucket policies: % / 2 expected', bucket_policies_count;
    RAISE NOTICE 'Object policies: % / 16 expected', object_policies_count;
    RAISE NOTICE 'Total policies: %', total_policies_count;
    
    IF total_policies_count = 18 THEN
        RAISE NOTICE '✅ SUCCESS: All storage policies created!';
    ELSE
        RAISE NOTICE '⚠️  PARTIAL: Some policies may need manual creation';
    END IF;
    
    RAISE NOTICE '📂 Configured for: products, banners, categories, variants';
    RAISE NOTICE '🔒 Security: Public read, Admin write access';
    RAISE NOTICE '================================';
    
    -- Next steps guidance
    IF bucket_policies_count = 0 AND object_policies_count = 0 THEN
        RAISE NOTICE '❌ NO POLICIES CREATED';
        RAISE NOTICE '📝 Possible issues:';
        RAISE NOTICE '   1. RLS not enabled on storage tables';
        RAISE NOTICE '   2. Insufficient permissions';
        RAISE NOTICE '   3. Storage buckets do not exist';
        RAISE NOTICE '📞 Next: Check Supabase Dashboard → Storage';
    END IF;
END $$;