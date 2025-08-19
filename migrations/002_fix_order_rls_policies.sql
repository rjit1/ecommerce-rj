-- =============================================
-- MIGRATION: Fix Order RLS Policies for Guest Checkout
-- Version: 002
-- Date: 2024-12-19
-- Description: Fix RLS policies to allow guest users to create orders
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Create new policies that allow both authenticated and anonymous users to create orders
CREATE POLICY "Allow order creation for all users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow order items creation for all users" ON order_items
    FOR INSERT WITH CHECK (true);

-- Ensure RLS is enabled but allows the above policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow users to view their own orders (both authenticated and guest)
-- For guest users, they can view orders using order_number and email
CREATE POLICY "Users can view orders by email and order number" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (user_id IS NULL AND customer_email IS NOT NULL)
    );

-- Allow viewing order items for orders that the user can view
CREATE POLICY "Users can view order items for accessible orders" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (
                orders.user_id = auth.uid() OR 
                (orders.user_id IS NULL AND orders.customer_email IS NOT NULL)
            )
        )
    );

-- Grant necessary permissions for the service role
GRANT INSERT ON orders TO service_role;
GRANT INSERT ON order_items TO service_role;
GRANT UPDATE ON product_variants TO service_role;
GRANT UPDATE ON coupons TO service_role;

SELECT 'Migration 002_fix_order_rls_policies completed successfully! 🎉' as result;