const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearDatabase() {
  console.log('Clearing database...');

  try {
    // Delete in reverse order of dependencies
    console.log('Deleting cart items...');
    await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting order items...');
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting orders...');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting product variants...');
    await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting product images...');
    await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting products...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting categories...');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting banners...');
    await supabase.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting site settings...');
    await supabase.from('site_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting coupons...');
    await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Database cleared successfully!');

  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

clearDatabase();