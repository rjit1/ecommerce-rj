const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testData() {
  console.log('Testing database connection and data...');

  try {
    // Test banners
    console.log('\n=== Testing Banners ===');
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true);
    
    if (bannersError) {
      console.error('Banners error:', bannersError);
    } else {
      console.log('Banners found:', banners?.length || 0);
      banners?.forEach(banner => {
        console.log(`- ${banner.title}: ${banner.image_url}`);
      });
    }

    // Test categories
    console.log('\n=== Testing Categories ===');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
    
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
    } else {
      console.log('Categories found:', categories?.length || 0);
      categories?.forEach(category => {
        console.log(`- ${category.name}: ${category.image_url}`);
      });
    }

    // Test products
    console.log('\n=== Testing Products ===');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .limit(3);
    
    if (productsError) {
      console.error('Products error:', productsError);
    } else {
      console.log('Products found:', products?.length || 0);
      products?.forEach(product => {
        console.log(`- ${product.name}`);
        console.log(`  Slug: ${product.slug}`);
        console.log(`  Images: ${product.images?.length || 0}`);
        console.log(`  Variants: ${product.variants?.length || 0}`);
        if (product.images?.[0]) {
          console.log(`  First image: ${product.images[0].image_url}`);
        }
      });
    }

    // Test site settings
    console.log('\n=== Testing Site Settings ===');
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*');
    
    if (settingsError) {
      console.error('Settings error:', settingsError);
    } else {
      console.log('Settings found:', settings?.length || 0);
      settings?.forEach(setting => {
        console.log(`- ${setting.key}: ${setting.value}`);
      });
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testData();