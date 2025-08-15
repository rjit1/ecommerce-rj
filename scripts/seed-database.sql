-- =============================================
-- SAMPLE DATA FOR RJ4WEAR E-COMMERCE
-- =============================================

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, is_active, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'T-Shirts', 't-shirts', 'Premium quality t-shirts for all occasions', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Shirts', 'shirts', 'Formal and casual shirts collection', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', true, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Jeans', 'jeans', 'Comfortable and stylish jeans', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', true, 3),
('550e8400-e29b-41d4-a716-446655440004', 'Hoodies', 'hoodies', 'Cozy hoodies for casual wear', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', true, 4),
('550e8400-e29b-41d4-a716-446655440005', 'Accessories', 'accessories', 'Fashion accessories and more', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', true, 5);

-- Insert Products
INSERT INTO products (id, name, slug, description, specifications, category_id, price, discount_price, is_featured, is_trending, is_hot_sale, is_active, meta_title, meta_description) VALUES
-- T-Shirts
('650e8400-e29b-41d4-a716-446655440001', 'Premium Cotton T-Shirt White', 'premium-cotton-t-shirt-white', 'High-quality 100% cotton t-shirt perfect for everyday wear. Soft, comfortable, and durable.', 'Material: 100% Cotton, Weight: 180 GSM, Fit: Regular, Care: Machine wash cold', '550e8400-e29b-41d4-a716-446655440001', 899.00, 699.00, true, true, false, true, 'Premium Cotton T-Shirt White - RJ4WEAR', 'Buy premium quality cotton t-shirt in white color. Comfortable, durable and stylish.'),
('650e8400-e29b-41d4-a716-446655440002', 'Graphic Print T-Shirt Navy', 'graphic-print-t-shirt-navy', 'Trendy graphic print t-shirt in navy blue. Perfect for casual outings and street style.', 'Material: Cotton Blend, Weight: 160 GSM, Fit: Slim, Care: Machine wash cold', '550e8400-e29b-41d4-a716-446655440001', 1299.00, 999.00, true, false, true, true, 'Graphic Print T-Shirt Navy - RJ4WEAR', 'Stylish graphic print t-shirt in navy blue. Perfect for casual wear.'),

-- Shirts
('650e8400-e29b-41d4-a716-446655440003', 'Formal White Shirt', 'formal-white-shirt', 'Classic formal white shirt perfect for office and formal occasions. Crisp, clean, and professional.', 'Material: Cotton Blend, Fit: Slim, Collar: Spread, Care: Dry clean recommended', '550e8400-e29b-41d4-a716-446655440002', 1899.00, 1499.00, true, true, false, true, 'Formal White Shirt - RJ4WEAR', 'Premium formal white shirt for office and formal occasions.'),
('650e8400-e29b-41d4-a716-446655440004', 'Casual Check Shirt Blue', 'casual-check-shirt-blue', 'Comfortable casual check shirt in blue. Perfect for weekend outings and casual meetings.', 'Material: Cotton, Pattern: Check, Fit: Regular, Care: Machine wash', '550e8400-e29b-41d4-a716-446655440002', 1599.00, 1299.00, false, true, true, true, 'Casual Check Shirt Blue - RJ4WEAR', 'Stylish casual check shirt in blue color. Perfect for casual wear.'),

-- Jeans
('650e8400-e29b-41d4-a716-446655440005', 'Slim Fit Blue Jeans', 'slim-fit-blue-jeans', 'Modern slim fit jeans in classic blue wash. Comfortable stretch fabric with perfect fit.', 'Material: Denim with Stretch, Fit: Slim, Wash: Medium Blue, Care: Machine wash cold', '550e8400-e29b-41d4-a716-446655440003', 2499.00, 1999.00, true, false, true, true, 'Slim Fit Blue Jeans - RJ4WEAR', 'Premium slim fit jeans in blue wash. Comfortable and stylish.'),

-- Hoodies
('650e8400-e29b-41d4-a716-446655440006', 'Cotton Hoodie Grey', 'cotton-hoodie-grey', 'Cozy cotton hoodie in grey color. Perfect for casual wear and layering during cooler weather.', 'Material: Cotton Fleece, Fit: Regular, Features: Kangaroo Pocket, Care: Machine wash', '550e8400-e29b-41d4-a716-446655440004', 2299.00, 1899.00, false, true, false, true, 'Cotton Hoodie Grey - RJ4WEAR', 'Comfortable cotton hoodie in grey color. Perfect for casual wear.');

-- Insert Product Images
INSERT INTO product_images (id, product_id, image_url, alt_text, display_order) VALUES
-- Premium Cotton T-Shirt White
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', 'Premium Cotton T-Shirt White - Front View', 0),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=800&h=800&fit=crop', 'Premium Cotton T-Shirt White - Back View', 1),

-- Graphic Print T-Shirt Navy
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop', 'Graphic Print T-Shirt Navy - Front View', 0),

-- Formal White Shirt
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', 'Formal White Shirt - Front View', 0),

-- Casual Check Shirt Blue
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop', 'Casual Check Shirt Blue - Front View', 0),

-- Slim Fit Blue Jeans
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', 'Slim Fit Blue Jeans - Front View', 0),

-- Cotton Hoodie Grey
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop', 'Cotton Hoodie Grey - Front View', 0);

-- Insert Product Variants
INSERT INTO product_variants (id, product_id, size, color, color_code, stock_quantity, sku) VALUES
-- Premium Cotton T-Shirt White
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'S', 'White', '#FFFFFF', 25, 'RJ-TSHIRT-WHITE-S'),
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'M', 'White', '#FFFFFF', 30, 'RJ-TSHIRT-WHITE-M'),
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'L', 'White', '#FFFFFF', 20, 'RJ-TSHIRT-WHITE-L'),
('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'XL', 'White', '#FFFFFF', 15, 'RJ-TSHIRT-WHITE-XL'),

-- Graphic Print T-Shirt Navy
('850e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'S', 'Navy', '#000080', 20, 'RJ-TSHIRT-NAVY-S'),
('850e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'M', 'Navy', '#000080', 25, 'RJ-TSHIRT-NAVY-M'),
('850e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 'L', 'Navy', '#000080', 18, 'RJ-TSHIRT-NAVY-L'),
('850e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', 'XL', 'Navy', '#000080', 12, 'RJ-TSHIRT-NAVY-XL'),

-- Formal White Shirt
('850e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'S', 'White', '#FFFFFF', 15, 'RJ-SHIRT-WHITE-S'),
('850e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', 'M', 'White', '#FFFFFF', 20, 'RJ-SHIRT-WHITE-M'),
('850e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440003', 'L', 'White', '#FFFFFF', 18, 'RJ-SHIRT-WHITE-L'),
('850e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 'XL', 'White', '#FFFFFF', 10, 'RJ-SHIRT-WHITE-XL'),

-- Casual Check Shirt Blue
('850e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440004', 'S', 'Blue', '#4169E1', 12, 'RJ-SHIRT-BLUE-S'),
('850e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440004', 'M', 'Blue', '#4169E1', 15, 'RJ-SHIRT-BLUE-M'),
('850e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440004', 'L', 'Blue', '#4169E1', 10, 'RJ-SHIRT-BLUE-L'),
('850e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440004', 'XL', 'Blue', '#4169E1', 8, 'RJ-SHIRT-BLUE-XL'),

-- Slim Fit Blue Jeans
('850e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440005', '30', 'Blue', '#191970', 15, 'RJ-JEANS-BLUE-30'),
('850e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440005', '32', 'Blue', '#191970', 20, 'RJ-JEANS-BLUE-32'),
('850e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440005', '34', 'Blue', '#191970', 18, 'RJ-JEANS-BLUE-34'),
('850e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440005', '36', 'Blue', '#191970', 12, 'RJ-JEANS-BLUE-36'),

-- Cotton Hoodie Grey
('850e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440006', 'S', 'Grey', '#808080', 10, 'RJ-HOODIE-GREY-S'),
('850e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440006', 'M', 'Grey', '#808080', 15, 'RJ-HOODIE-GREY-M'),
('850e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440006', 'L', 'Grey', '#808080', 12, 'RJ-HOODIE-GREY-L'),
('850e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440006', 'XL', 'Grey', '#808080', 8, 'RJ-HOODIE-GREY-XL');

-- Insert Banners
INSERT INTO banners (id, title, subtitle, image_url, link_url, is_active, display_order) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'New Collection 2024', 'Discover the latest trends in fashion', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', '/products', true, 1),
('950e8400-e29b-41d4-a716-446655440002', 'Summer Sale', 'Up to 50% off on selected items', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=400&fit=crop', '/products?hot_sale=true', true, 2);

-- Insert Site Settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'RJ4WEAR', 'Site name'),
('site_description', 'Premium Fashion & Lifestyle Store offering quality products with fast delivery and great customer service.', 'Site description'),
('top_header_text', '🎉 Free Delivery on Orders Above ₹999! 🚚', 'Top header announcement text'),
('top_header_enabled', 'true', 'Enable/disable top header'),
('contact_email', 'support@rj4wear.com', 'Contact email'),
('contact_phone', '+91-9876543210', 'Contact phone'),
('whatsapp_number', '+919876543210', 'WhatsApp number'),
('cod_fee', '50', 'Cash on delivery fee'),
('free_delivery_threshold', '999', 'Free delivery threshold amount');

-- Insert Sample Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active, expires_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'WELCOME10', 'percentage', 10.00, 500.00, 200.00, 100, 0, true, '2024-12-31 23:59:59+00'),
('a50e8400-e29b-41d4-a716-446655440002', 'SAVE100', 'fixed', 100.00, 1000.00, NULL, 50, 0, true, '2024-12-31 23:59:59+00'),
('a50e8400-e29b-41d4-a716-446655440003', 'FIRST20', 'percentage', 20.00, 800.00, 300.00, 200, 0, true, '2024-12-31 23:59:59+00');