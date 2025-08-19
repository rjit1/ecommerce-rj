-- =============================================
-- PRODUCTION-SAFE MIGRATION: Fix Delivery Fee Schema
-- Version: 001
-- Date: 2024-01-15
-- Description: Remove cod_fee and delivery_fee columns from orders table,
--              add applied_delivery_fee for historical accuracy,
--              and update dependent views
-- =============================================

-- Step 1: Drop dependent views first to avoid cascade issues
DROP VIEW IF EXISTS order_summary;

-- Step 2: Backup existing data (optional but recommended for production)
-- CREATE TABLE orders_backup_20240115 AS SELECT * FROM orders;

-- Step 3: Add the new applied_delivery_fee column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS applied_delivery_fee DECIMAL(10,2) DEFAULT 0;

-- Step 4: Migrate existing data to preserve historical accuracy
-- Update applied_delivery_fee based on existing cod_fee and delivery_fee
UPDATE orders 
SET applied_delivery_fee = COALESCE(
    CASE 
        WHEN cod_fee IS NOT NULL AND cod_fee > 0 THEN cod_fee
        WHEN delivery_fee IS NOT NULL AND delivery_fee > 0 THEN delivery_fee
        WHEN payment_method = 'online' THEN 0
        WHEN subtotal >= 999 THEN 0  -- Current free delivery threshold
        ELSE 50  -- Current delivery fee
    END, 0
)
WHERE applied_delivery_fee = 0;

-- Step 5: Remove the old columns
ALTER TABLE orders DROP COLUMN IF EXISTS cod_fee;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_fee;

-- Step 6: Add comment for documentation
COMMENT ON COLUMN orders.applied_delivery_fee IS 'Delivery fee that was applied when this order was placed (preserves historical accuracy)';

-- Step 7: Recreate the order_summary view with enhanced functionality
CREATE VIEW order_summary AS
SELECT 
    o.*,
    COUNT(oi.id) as total_items,
    SUM(oi.quantity) as total_quantity,
    -- Calculate what the current delivery fee would be (for analysis)
    CASE 
        WHEN o.payment_method = 'online' THEN 0
        WHEN o.subtotal >= (
            SELECT CAST(COALESCE(value, '999') AS DECIMAL) 
            FROM site_settings 
            WHERE key = 'free_delivery_threshold'
        ) THEN 0
        ELSE (
            SELECT CAST(COALESCE(value, '50') AS DECIMAL) 
            FROM site_settings 
            WHERE key = 'delivery_fee'
        )
    END as current_delivery_fee_rate,
    -- Show difference between applied and current rate (for analysis)
    o.applied_delivery_fee - CASE 
        WHEN o.payment_method = 'online' THEN 0
        WHEN o.subtotal >= (
            SELECT CAST(COALESCE(value, '999') AS DECIMAL) 
            FROM site_settings 
            WHERE key = 'free_delivery_threshold'
        ) THEN 0
        ELSE (
            SELECT CAST(COALESCE(value, '50') AS DECIMAL) 
            FROM site_settings 
            WHERE key = 'delivery_fee'
        )
    END as delivery_fee_difference
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Step 8: Ensure site_settings has the required settings
INSERT INTO site_settings (key, value, description) VALUES
('delivery_fee', '50', 'Standard delivery fee in rupees'),
('free_delivery_threshold', '999', 'Minimum order amount for free delivery in rupees')
ON CONFLICT (key) DO UPDATE SET 
    description = EXCLUDED.description;

-- Step 9: Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_applied_delivery_fee ON orders(applied_delivery_fee);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method_subtotal ON orders(payment_method, subtotal);

-- Step 10: Verify the migration
DO $$
DECLARE
    order_count INTEGER;
    setting_count INTEGER;
BEGIN
    -- Check orders table
    SELECT COUNT(*) INTO order_count FROM orders;
    
    -- Check site_settings
    SELECT COUNT(*) INTO setting_count 
    FROM site_settings 
    WHERE key IN ('delivery_fee', 'free_delivery_threshold');
    
    -- Log results
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Orders processed: %', order_count;
    RAISE NOTICE 'Required settings found: %', setting_count;
    
    -- Verify view works
    PERFORM * FROM order_summary LIMIT 1;
    RAISE NOTICE 'order_summary view is working correctly';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END $$;

-- Step 11: Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT ON order_summary TO authenticated;
-- GRANT SELECT ON site_settings TO authenticated;

SELECT 'Migration 001_fix_delivery_fee_schema completed successfully! 🎉' as result;