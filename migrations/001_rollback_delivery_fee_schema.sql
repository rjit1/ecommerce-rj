-- =============================================
-- ROLLBACK SCRIPT: Fix Delivery Fee Schema
-- Version: 001_rollback
-- Date: 2024-01-15
-- Description: Rollback the delivery fee schema changes
-- WARNING: This will restore the old schema but may lose some data
-- =============================================

-- Step 1: Drop the new view
DROP VIEW IF EXISTS order_summary;

-- Step 2: Add back the old columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;

-- Step 3: Migrate data back (best effort)
UPDATE orders 
SET 
    cod_fee = CASE WHEN payment_method = 'cod' THEN applied_delivery_fee ELSE 0 END,
    delivery_fee = applied_delivery_fee
WHERE applied_delivery_fee > 0;

-- Step 4: Remove the new column
ALTER TABLE orders DROP COLUMN IF EXISTS applied_delivery_fee;

-- Step 5: Recreate the original view
CREATE VIEW order_summary AS
SELECT 
    o.*,
    COUNT(oi.id) as total_items,
    SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Step 6: Remove indexes
DROP INDEX IF EXISTS idx_orders_applied_delivery_fee;
DROP INDEX IF EXISTS idx_orders_payment_method_subtotal;

SELECT 'Rollback completed - schema restored to previous state' as result;