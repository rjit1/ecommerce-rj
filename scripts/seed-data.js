const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Insert Categories
    console.log('Inserting categories...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'T-Shirts',
          slug: 't-shirts',
          description: 'Premium quality t-shirts for all occasions',
          image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          is_active: true,
          display_order: 1
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Shirts',
          slug: 'shirts',
          description: 'Formal and casual shirts collection',
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
          is_active: true,
          display_order: 2
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Jeans',
          slug: 'jeans',
          description: 'Comfortable and stylish jeans',
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          is_active: true,
          display_order: 3
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Hoodies',
          slug: 'hoodies',
          description: 'Cozy hoodies for casual wear',
          image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          is_active: true,
          display_order: 4
        }
      ]);

    if (categoriesError) {
      console.error('Error inserting categories:', categoriesError);
    } else {
      console.log('Categories inserted successfully');
    }

    // Insert Products
    console.log('Inserting products...');
    const { error: productsError } = await supabase
      .from('products')
      .upsert([
        {
          id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Premium Cotton T-Shirt White',
          slug: 'premium-cotton-t-shirt-white',
          description: 'High-quality 100% cotton t-shirt perfect for everyday wear. Soft, comfortable, and durable.',
          specifications: 'Material: 100% Cotton, Weight: 180 GSM, Fit: Regular, Care: Machine wash cold',
          category_id: '550e8400-e29b-41d4-a716-446655440001',
          price: 899.00,
          discount_price: 699.00,
          is_featured: true,
          is_trending: true,
          is_hot_sale: false,
          is_active: true,
          meta_title: 'Premium Cotton T-Shirt White - RJ4WEAR',
          meta_description: 'Buy premium quality cotton t-shirt in white color. Comfortable, durable and stylish.'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440002',
          name: 'Graphic Print T-Shirt Navy',
          slug: 'graphic-print-t-shirt-navy',
          description: 'Trendy graphic print t-shirt in navy blue. Perfect for casual outings and street style.',
          specifications: 'Material: Cotton Blend, Weight: 160 GSM, Fit: Slim, Care: Machine wash cold',
          category_id: '550e8400-e29b-41d4-a716-446655440001',
          price: 1299.00,
          discount_price: 999.00,
          is_featured: true,
          is_trending: false,
          is_hot_sale: true,
          is_active: true,
          meta_title: 'Graphic Print T-Shirt Navy - RJ4WEAR',
          meta_description: 'Stylish graphic print t-shirt in navy blue. Perfect for casual wear.'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440003',
          name: 'Formal White Shirt',
          slug: 'formal-white-shirt',
          description: 'Classic formal white shirt perfect for office and formal occasions. Crisp, clean, and professional.',
          specifications: 'Material: Cotton Blend, Fit: Slim, Collar: Spread, Care: Dry clean recommended',
          category_id: '550e8400-e29b-41d4-a716-446655440002',
          price: 1899.00,
          discount_price: 1499.00,
          is_featured: true,
          is_trending: true,
          is_hot_sale: false,
          is_active: true,
          meta_title: 'Formal White Shirt - RJ4WEAR',
          meta_description: 'Premium formal white shirt for office and formal occasions.'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440004',
          name: 'Casual Check Shirt Blue',
          slug: 'casual-check-shirt-blue',
          description: 'Comfortable casual check shirt in blue. Perfect for weekend outings and casual meetings.',
          specifications: 'Material: Cotton, Pattern: Check, Fit: Regular, Care: Machine wash',
          category_id: '550e8400-e29b-41d4-a716-446655440002',
          price: 1599.00,
          discount_price: 1299.00,
          is_featured: false,
          is_trending: true,
          is_hot_sale: true,
          is_active: true,
          meta_title: 'Casual Check Shirt Blue - RJ4WEAR',
          meta_description: 'Stylish casual check shirt in blue color. Perfect for casual wear.'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440005',
          name: 'Slim Fit Blue Jeans',
          slug: 'slim-fit-blue-jeans',
          description: 'Modern slim fit jeans in classic blue wash. Comfortable stretch fabric with perfect fit.',
          specifications: 'Material: Denim with Stretch, Fit: Slim, Wash: Medium Blue, Care: Machine wash cold',
          category_id: '550e8400-e29b-41d4-a716-446655440003',
          price: 2499.00,
          discount_price: 1999.00,
          is_featured: true,
          is_trending: false,
          is_hot_sale: true,
          is_active: true,
          meta_title: 'Slim Fit Blue Jeans - RJ4WEAR',
          meta_description: 'Premium slim fit jeans in blue wash. Comfortable and stylish.'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440006',
          name: 'Cotton Hoodie Grey',
          slug: 'cotton-hoodie-grey',
          description: 'Cozy cotton hoodie in grey color. Perfect for casual wear and layering during cooler weather.',
          specifications: 'Material: Cotton Fleece, Fit: Regular, Features: Kangaroo Pocket, Care: Machine wash',
          category_id: '550e8400-e29b-41d4-a716-446655440004',
          price: 2299.00,
          discount_price: 1899.00,
          is_featured: false,
          is_trending: true,
          is_hot_sale: false,
          is_active: true,
          meta_title: 'Cotton Hoodie Grey - RJ4WEAR',
          meta_description: 'Comfortable cotton hoodie in grey color. Perfect for casual wear.'
        }
      ]);

    if (productsError) {
      console.error('Error inserting products:', productsError);
    } else {
      console.log('Products inserted successfully');
    }

    // Insert Product Images
    console.log('Inserting product images...');
    const { error: imagesError } = await supabase
      .from('product_images')
      .upsert([
        {
          id: '750e8400-e29b-41d4-a716-446655440001',
          product_id: '650e8400-e29b-41d4-a716-446655440001',
          image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          alt_text: 'Premium Cotton T-Shirt White - Front View',
          display_order: 0
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440002',
          product_id: '650e8400-e29b-41d4-a716-446655440002',
          image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          alt_text: 'Graphic Print T-Shirt Navy - Front View',
          display_order: 0
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440003',
          product_id: '650e8400-e29b-41d4-a716-446655440003',
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          alt_text: 'Formal White Shirt - Front View',
          display_order: 0
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440004',
          product_id: '650e8400-e29b-41d4-a716-446655440004',
          image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          alt_text: 'Casual Check Shirt Blue - Front View',
          display_order: 0
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440005',
          product_id: '650e8400-e29b-41d4-a716-446655440005',
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          alt_text: 'Slim Fit Blue Jeans - Front View',
          display_order: 0
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440006',
          product_id: '650e8400-e29b-41d4-a716-446655440006',
          image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          alt_text: 'Cotton Hoodie Grey - Front View',
          display_order: 0
        }
      ]);

    if (imagesError) {
      console.error('Error inserting product images:', imagesError);
    } else {
      console.log('Product images inserted successfully');
    }

    // Insert Product Variants
    console.log('Inserting product variants...');
    const variants = [
      // Premium Cotton T-Shirt White
      { id: '850e8400-e29b-41d4-a716-446655440001', product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'S', color: 'White', color_code: '#FFFFFF', stock_quantity: 25, sku: 'RJ-TSHIRT-WHITE-S' },
      { id: '850e8400-e29b-41d4-a716-446655440002', product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'M', color: 'White', color_code: '#FFFFFF', stock_quantity: 30, sku: 'RJ-TSHIRT-WHITE-M' },
      { id: '850e8400-e29b-41d4-a716-446655440003', product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'L', color: 'White', color_code: '#FFFFFF', stock_quantity: 20, sku: 'RJ-TSHIRT-WHITE-L' },
      { id: '850e8400-e29b-41d4-a716-446655440004', product_id: '650e8400-e29b-41d4-a716-446655440001', size: 'XL', color: 'White', color_code: '#FFFFFF', stock_quantity: 15, sku: 'RJ-TSHIRT-WHITE-XL' },
      
      // Graphic Print T-Shirt Navy
      { id: '850e8400-e29b-41d4-a716-446655440005', product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'S', color: 'Navy', color_code: '#000080', stock_quantity: 20, sku: 'RJ-TSHIRT-NAVY-S' },
      { id: '850e8400-e29b-41d4-a716-446655440006', product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'M', color: 'Navy', color_code: '#000080', stock_quantity: 25, sku: 'RJ-TSHIRT-NAVY-M' },
      { id: '850e8400-e29b-41d4-a716-446655440007', product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'L', color: 'Navy', color_code: '#000080', stock_quantity: 18, sku: 'RJ-TSHIRT-NAVY-L' },
      { id: '850e8400-e29b-41d4-a716-446655440008', product_id: '650e8400-e29b-41d4-a716-446655440002', size: 'XL', color: 'Navy', color_code: '#000080', stock_quantity: 12, sku: 'RJ-TSHIRT-NAVY-XL' },
      
      // Add more variants for other products...
      { id: '850e8400-e29b-41d4-a716-446655440009', product_id: '650e8400-e29b-41d4-a716-446655440003', size: 'M', color: 'White', color_code: '#FFFFFF', stock_quantity: 20, sku: 'RJ-SHIRT-WHITE-M' },
      { id: '850e8400-e29b-41d4-a716-446655440010', product_id: '650e8400-e29b-41d4-a716-446655440003', size: 'L', color: 'White', color_code: '#FFFFFF', stock_quantity: 18, sku: 'RJ-SHIRT-WHITE-L' },
      
      { id: '850e8400-e29b-41d4-a716-446655440011', product_id: '650e8400-e29b-41d4-a716-446655440004', size: 'M', color: 'Blue', color_code: '#4169E1', stock_quantity: 15, sku: 'RJ-SHIRT-BLUE-M' },
      { id: '850e8400-e29b-41d4-a716-446655440012', product_id: '650e8400-e29b-41d4-a716-446655440004', size: 'L', color: 'Blue', color_code: '#4169E1', stock_quantity: 10, sku: 'RJ-SHIRT-BLUE-L' },
      
      { id: '850e8400-e29b-41d4-a716-446655440013', product_id: '650e8400-e29b-41d4-a716-446655440005', size: '32', color: 'Blue', color_code: '#191970', stock_quantity: 20, sku: 'RJ-JEANS-BLUE-32' },
      { id: '850e8400-e29b-41d4-a716-446655440014', product_id: '650e8400-e29b-41d4-a716-446655440005', size: '34', color: 'Blue', color_code: '#191970', stock_quantity: 18, sku: 'RJ-JEANS-BLUE-34' },
      
      { id: '850e8400-e29b-41d4-a716-446655440015', product_id: '650e8400-e29b-41d4-a716-446655440006', size: 'M', color: 'Grey', color_code: '#808080', stock_quantity: 15, sku: 'RJ-HOODIE-GREY-M' },
      { id: '850e8400-e29b-41d4-a716-446655440016', product_id: '650e8400-e29b-41d4-a716-446655440006', size: 'L', color: 'Grey', color_code: '#808080', stock_quantity: 12, sku: 'RJ-HOODIE-GREY-L' }
    ];

    const { error: variantsError } = await supabase
      .from('product_variants')
      .upsert(variants);

    if (variantsError) {
      console.error('Error inserting product variants:', variantsError);
    } else {
      console.log('Product variants inserted successfully');
    }

    // Insert Banners
    console.log('Inserting banners...');
    const { error: bannersError } = await supabase
      .from('banners')
      .upsert([
        {
          id: '950e8400-e29b-41d4-a716-446655440001',
          title: 'New Collection 2024',
          subtitle: 'Discover the latest trends in fashion',
          image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
          link_url: '/products',
          is_active: true,
          display_order: 1
        },
        {
          id: '950e8400-e29b-41d4-a716-446655440002',
          title: 'Summer Sale',
          subtitle: 'Up to 50% off on selected items',
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
          link_url: '/products?hot_sale=true',
          is_active: true,
          display_order: 2
        }
      ]);

    if (bannersError) {
      console.error('Error inserting banners:', bannersError);
    } else {
      console.log('Banners inserted successfully');
    }

    // Insert Site Settings
    console.log('Inserting site settings...');
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert([
        { key: 'site_name', value: 'RJ4WEAR', description: 'Site name' },
        { key: 'site_description', value: 'Premium Fashion & Lifestyle Store offering quality products with fast delivery and great customer service.', description: 'Site description' },
        { key: 'top_header_text', value: '🎉 Free Delivery on Orders Above ₹999! 🚚', description: 'Top header announcement text' },
        { key: 'top_header_enabled', value: 'true', description: 'Enable/disable top header' },
        { key: 'contact_email', value: 'support@rj4wear.com', description: 'Contact email' },
        { key: 'contact_phone', value: '+91-9876543210', description: 'Contact phone' },
        { key: 'whatsapp_number', value: '+919876543210', description: 'WhatsApp number' },
        { key: 'cod_fee', value: '50', description: 'Cash on delivery fee' },
        { key: 'free_delivery_threshold', value: '999', description: 'Free delivery threshold amount' }
      ]);

    if (settingsError) {
      console.error('Error inserting site settings:', settingsError);
    } else {
      console.log('Site settings inserted successfully');
    }

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();