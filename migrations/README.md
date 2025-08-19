# Database Migrations

## Migration 001: Fix Delivery Fee Schema

### Problem
The original schema had both `cod_fee` and `delivery_fee` columns in the orders table, which created confusion and dependency issues. The `order_summary` view depended on these columns, preventing safe schema changes.

### Solution
This migration implements a production-safe approach:

1. **Preserves Historical Data**: Existing orders retain their original delivery fee amounts
2. **Simplifies Schema**: Removes redundant columns and consolidates into `applied_delivery_fee`
3. **Maintains Flexibility**: Delivery fee is managed via `site_settings` for easy admin control
4. **Enhances Reporting**: New view provides both historical and current delivery fee analysis

### Files
- `001_fix_delivery_fee_schema.sql` - Main migration script
- `001_rollback_delivery_fee_schema.sql` - Rollback script (use only if needed)

### How to Run

#### Production Environment
```sql
-- 1. Create a backup first
CREATE TABLE orders_backup_$(date +%Y%m%d) AS SELECT * FROM orders;

-- 2. Run the migration
\i migrations/001_fix_delivery_fee_schema.sql

-- 3. Verify the results
SELECT * FROM order_summary LIMIT 5;
SELECT key, value FROM site_settings WHERE key IN ('delivery_fee', 'free_delivery_threshold');
```

#### Development Environment
```sql
-- Run directly
\i migrations/001_fix_delivery_fee_schema.sql
```

### Verification Steps

After running the migration, verify:

1. **Orders table structure**:
   ```sql
   \d orders
   ```
   Should show `applied_delivery_fee` column, no `cod_fee` or `delivery_fee`

2. **Data integrity**:
   ```sql
   SELECT 
       COUNT(*) as total_orders,
       COUNT(*) FILTER (WHERE applied_delivery_fee >= 0) as orders_with_delivery_fee,
       AVG(applied_delivery_fee) as avg_delivery_fee
   FROM orders;
   ```

3. **View functionality**:
   ```sql
   SELECT * FROM order_summary WHERE applied_delivery_fee > 0 LIMIT 3;
   ```

4. **Settings**:
   ```sql
   SELECT * FROM site_settings WHERE key LIKE '%delivery%' OR key LIKE '%threshold%';
   ```

### Rollback Instructions

If you need to rollback (NOT recommended in production):

```sql
-- WARNING: This may cause data loss
\i migrations/001_rollback_delivery_fee_schema.sql
```

### Application Code Changes

The following application files were updated to work with the new schema:

- `types/index.ts` - Updated Order and SiteSettings interfaces
- `app/api/orders/route.ts` - Updated to store applied_delivery_fee
- `components/checkout/CheckoutContent.tsx` - Updated to pass delivery fee to API
- `supabase.sql` - Updated schema definition

### Benefits

1. **Admin Flexibility**: Delivery fee can be changed in site_settings without code deployment
2. **Historical Accuracy**: Past orders retain their original delivery fee amounts
3. **Simplified Logic**: No more confusion between cod_fee and delivery_fee
4. **Better Reporting**: Enhanced view provides delivery fee analysis capabilities
5. **Production Safe**: Migration preserves all existing data

### Testing

Before deploying to production:

1. Test the migration on a copy of production data
2. Verify all checkout flows work correctly
3. Test admin delivery fee changes in site_settings
4. Verify order history displays correctly
5. Test both online and COD payment methods

### Support

If you encounter issues:

1. Check the migration logs for any error messages
2. Verify all required site_settings exist
3. Ensure the order_summary view was created successfully
4. Contact the development team if rollback is needed