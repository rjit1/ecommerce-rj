-- =============================================
-- RJ4WEAR E-COMMERCE DATABASE SCHEMA
-- Supabase PostgreSQL with RLS Policies
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    specifications TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_hot_sale BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. PRODUCT IMAGES TABLE
-- =============================================
CREATE TABLE product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. PRODUCT VARIANTS TABLE (Size & Color combinations)
-- =============================================
CREATE TABLE product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    color_code VARCHAR(7), -- Hex color code
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT, -- Specific image for this variant
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size, color)
);

-- =============================================
-- 5. USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. USER ADDRESSES TABLE
-- =============================================
CREATE TABLE user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line_1 VARCHAR(200) NOT NULL,
    address_line_2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. COUPONS TABLE
-- =============================================
CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2), -- For percentage coupons
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. ORDERS TABLE
-- =============================================
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('online', 'cod')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    
    -- Customer Details
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Shipping Address
    shipping_address_line_1 VARCHAR(200) NOT NULL,
    shipping_address_line_2 VARCHAR(200),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'India',
    
    -- Order Totals
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    applied_delivery_fee DECIMAL(10,2) DEFAULT 0, -- Delivery fee applied at order time
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Coupon Info
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 9. ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    product_image TEXT,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. CART TABLE (for logged-in users)
-- =============================================
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);

-- =============================================
-- 11. BANNERS TABLE
-- =============================================
CREATE TABLE banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200),
    subtitle VARCHAR(300),
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 12. SITE SETTINGS TABLE
-- =============================================
CREATE TABLE site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 13. ADMIN USERS TABLE
-- =============================================
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_trending ON products(is_trending) WHERE is_trending = true;
CREATE INDEX idx_products_hot_sale ON products(is_hot_sale) WHERE is_hot_sale = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- Delivery fee related indexes (added by migration 001)
CREATE INDEX IF NOT EXISTS idx_orders_applied_delivery_fee ON orders(applied_delivery_fee);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method_subtotal ON orders(payment_method, subtotal);

-- Full-text search indexes
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_categories_search ON categories USING gin(to_tsvector('english', name));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    order_num := 'RJ' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Add column comments (added by migration 001)
COMMENT ON COLUMN orders.applied_delivery_fee IS 'Delivery fee that was applied when this order was placed (preserves historical accuracy)';

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
('delivery_fee', '50', 'Standard delivery fee in rupees'),
('free_delivery_threshold', '999', 'Minimum order amount for free delivery in rupees'),
('estimated_delivery_text', '3-5 business days', 'Estimated delivery time text'),
('top_header_text', 'Free delivery on orders above ₹999!', 'Top header announcement text'),
('top_header_enabled', 'true', 'Enable/disable top header banner'),
('site_name', 'RJ4WEAR', 'Site name'),
('site_description', 'Premium clothing for modern lifestyle', 'Site description'),
('contact_email', 'support@rj4wear.com', 'Contact email address'),
('contact_phone', '+91-9876543210', 'Contact phone number'),
('whatsapp_number', '+91-9876543210', 'WhatsApp number for customer support')
ON CONFLICT (key) DO NOTHING;

-- Function to get total stock for a product
CREATE OR REPLACE FUNCTION get_product_total_stock(product_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_stock INTEGER;
BEGIN
    SELECT COALESCE(SUM(stock_quantity), 0) INTO total_stock
    FROM product_variants
    WHERE product_id = product_uuid;
    
    RETURN total_stock;
END;
$$ LANGUAGE plpgsql;

-- Function to check low stock (≤ 3)
CREATE OR REPLACE FUNCTION is_low_stock(product_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_stock INTEGER;
BEGIN
    total_stock := get_product_total_stock(product_uuid);
    RETURN total_stock <= 3 AND total_stock > 0;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PUBLIC READ POLICIES (for main website)
-- =============================================

-- Categories - Public read for active categories
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (is_active = true);

-- Products - Public read for active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Product Images - Public read
CREATE POLICY "Public can view product images" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.is_active = true
        )
    );

-- Product Variants - Public read
CREATE POLICY "Public can view product variants" ON product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_variants.product_id 
            AND products.is_active = true
        )
    );

-- Banners - Public read for active banners
CREATE POLICY "Public can view active banners" ON banners
    FOR SELECT USING (is_active = true);

-- Site Settings - Public read
CREATE POLICY "Public can view site settings" ON site_settings
    FOR SELECT USING (true);

-- Coupons - Public read for active coupons (limited info)
CREATE POLICY "Public can view active coupons" ON coupons
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- =============================================
-- USER POLICIES (authenticated users)
-- =============================================

-- User Profiles - Users can manage their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User Addresses - Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- Cart Items - Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Orders - Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Order Items - Users can view items from their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =============================================
-- ADMIN POLICIES
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can do everything on all tables
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage product images" ON product_images
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage product variants" ON product_variants
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage banners" ON banners
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all user addresses" ON user_addresses
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL USING (is_admin());

-- =============================================
-- ORDER CREATION POLICY (for checkout)
-- =============================================
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert Site Settings
INSERT INTO site_settings (key, value, description) VALUES
('cod_fee', '50', 'Cash on Delivery fee in rupees'),
('free_delivery_threshold', '999', 'Minimum order amount for free delivery'),
('estimated_delivery_text', '5-7 business days', 'Estimated delivery time text'),
('top_header_text', '🎉 Free Delivery on Orders Above ₹999! 🚚', 'Top header banner text'),
('top_header_enabled', 'true', 'Enable/disable top header banner'),
('site_name', 'RJ4WEAR', 'Site name'),
('site_description', 'Premium Fashion & Lifestyle Store', 'Site description'),
('contact_email', 'support@rj4wear.com', 'Contact email'),
('contact_phone', '+91-9876543210', 'Contact phone number'),
('whatsapp_number', '+91-9876543210', 'WhatsApp support number');

-- Insert Categories
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('T-Shirts', 't-shirts', 'Comfortable and stylish t-shirts for all occasions', 1, true),
('Shirts', 'shirts', 'Formal and casual shirts collection', 2, true),
('Jeans', 'jeans', 'Premium quality denim jeans', 3, true),
('Hoodies', 'hoodies', 'Cozy hoodies and sweatshirts', 4, true),
('Accessories', 'accessories', 'Fashion accessories and more', 5, true);

-- Insert Sample Products
INSERT INTO products (name, slug, description, specifications, category_id, price, discount_price, is_featured, is_trending, is_hot_sale, is_active, meta_title, meta_description) VALUES
-- T-Shirts
('Premium Cotton T-Shirt', 'premium-cotton-t-shirt', 'Ultra-soft premium cotton t-shirt perfect for everyday wear. Made with 100% organic cotton for maximum comfort.', 'Material: 100% Organic Cotton\nFit: Regular\nSleeve: Short\nNeck: Round\nCare: Machine wash cold', (SELECT id FROM categories WHERE slug = 't-shirts'), 799.00, 599.00, true, true, false, true, 'Premium Cotton T-Shirt - RJ4WEAR', 'Buy premium cotton t-shirt online. Ultra-soft, comfortable, and stylish. Free delivery above ₹999.'),

('Graphic Print T-Shirt', 'graphic-print-t-shirt', 'Trendy graphic print t-shirt with unique designs. Perfect for casual outings and street style.', 'Material: Cotton Blend\nFit: Regular\nSleeve: Short\nNeck: Round\nPrint: Digital Print', (SELECT id FROM categories WHERE slug = 't-shirts'), 699.00, 499.00, false, true, true, true, 'Graphic Print T-Shirt - RJ4WEAR', 'Trendy graphic print t-shirts with unique designs. Shop now for the latest street style fashion.'),

-- Shirts
('Formal White Shirt', 'formal-white-shirt', 'Classic formal white shirt perfect for office and formal occasions. Wrinkle-free fabric with comfortable fit.', 'Material: Cotton Poly Blend\nFit: Slim Fit\nSleeve: Full\nCollar: Spread\nCare: Easy Iron', (SELECT id FROM categories WHERE slug = 'shirts'), 1299.00, 999.00, true, false, false, true, 'Formal White Shirt - RJ4WEAR', 'Classic formal white shirt for office wear. Wrinkle-free, comfortable fit. Shop formal shirts online.'),

('Casual Check Shirt', 'casual-check-shirt', 'Stylish casual check shirt perfect for weekend outings. Comfortable cotton fabric with modern fit.', 'Material: 100% Cotton\nFit: Regular\nSleeve: Full\nPattern: Check\nCollar: Button Down', (SELECT id FROM categories WHERE slug = 'shirts'), 999.00, 749.00, false, true, false, true, 'Casual Check Shirt - RJ4WEAR', 'Stylish casual check shirts for weekend wear. Comfortable cotton fabric with modern designs.'),

-- Jeans
('Slim Fit Blue Jeans', 'slim-fit-blue-jeans', 'Classic slim fit blue jeans made with premium denim. Perfect fit with stretch comfort for all-day wear.', 'Material: Denim with Stretch\nFit: Slim Fit\nRise: Mid Rise\nClosure: Button Fly\nWash: Dark Blue', (SELECT id FROM categories WHERE slug = 'jeans'), 1599.00, 1199.00, true, false, true, true, 'Slim Fit Blue Jeans - RJ4WEAR', 'Premium slim fit blue jeans with stretch comfort. Shop the best denim collection online.'),

-- Hoodies
('Cotton Hoodie', 'cotton-hoodie', 'Comfortable cotton hoodie perfect for casual wear. Soft inner fleece lining for extra warmth and comfort.', 'Material: Cotton Fleece\nFit: Regular\nSleeve: Full\nClosure: Pullover\nPockets: Kangaroo Pocket', (SELECT id FROM categories WHERE slug = 'hoodies'), 1199.00, 899.00, false, true, false, true, 'Cotton Hoodie - RJ4WEAR', 'Comfortable cotton hoodies with soft fleece lining. Perfect for casual wear and winter comfort.');

-- Insert Product Variants
INSERT INTO product_variants (product_id, size, color, color_code, stock_quantity, sku) VALUES
-- Premium Cotton T-Shirt variants
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'S', 'White', '#FFFFFF', 15, 'PCT-S-WHT'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'S', 'Black', '#000000', 12, 'PCT-S-BLK'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'M', 'White', '#FFFFFF', 20, 'PCT-M-WHT'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'M', 'Black', '#000000', 18, 'PCT-M-BLK'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'L', 'White', '#FFFFFF', 10, 'PCT-L-WHT'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'L', 'Black', '#000000', 8, 'PCT-L-BLK'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'XL', 'White', '#FFFFFF', 5, 'PCT-XL-WHT'),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'XL', 'Black', '#000000', 3, 'PCT-XL-BLK'),

-- Graphic Print T-Shirt variants
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'S', 'Navy', '#000080', 10, 'GPT-S-NVY'),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'S', 'Grey', '#808080', 8, 'GPT-S-GRY'),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'M', 'Navy', '#000080', 15, 'GPT-M-NVY'),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'M', 'Grey', '#808080', 12, 'GPT-M-GRY'),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'L', 'Navy', '#000080', 6, 'GPT-L-NVY'),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'L', 'Grey', '#808080', 4, 'GPT-L-GRY'),

-- Formal White Shirt variants
((SELECT id FROM products WHERE slug = 'formal-white-shirt'), 'S', 'White', '#FFFFFF', 12, 'FWS-S-WHT'),
((SELECT id FROM products WHERE slug = 'formal-white-shirt'), 'M', 'White', '#FFFFFF', 18, 'FWS-M-WHT'),
((SELECT id FROM products WHERE slug = 'formal-white-shirt'), 'L', 'White', '#FFFFFF', 15, 'FWS-L-WHT'),
((SELECT id FROM products WHERE slug = 'formal-white-shirt'), 'XL', 'White', '#FFFFFF', 8, 'FWS-XL-WHT'),

-- Casual Check Shirt variants
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'S', 'Blue Check', '#4169E1', 10, 'CCS-S-BLC'),
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'S', 'Red Check', '#DC143C', 8, 'CCS-S-RDC'),
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'M', 'Blue Check', '#4169E1', 14, 'CCS-M-BLC'),
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'M', 'Red Check', '#DC143C', 12, 'CCS-M-RDC'),
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'L', 'Blue Check', '#4169E1', 9, 'CCS-L-BLC'),
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'L', 'Red Check', '#DC143C', 7, 'CCS-L-RDC'),

-- Slim Fit Blue Jeans variants
((SELECT id FROM products WHERE slug = 'slim-fit-blue-jeans'), '30', 'Dark Blue', '#191970', 8, 'SFJ-30-DBL'),
((SELECT id FROM products WHERE slug = 'slim-fit-blue-jeans'), '32', 'Dark Blue', '#191970', 12, 'SFJ-32-DBL'),
((SELECT id FROM products WHERE slug = 'slim-fit-blue-jeans'), '34', 'Dark Blue', '#191970', 10, 'SFJ-34-DBL'),
((SELECT id FROM products WHERE slug = 'slim-fit-blue-jeans'), '36', 'Dark Blue', '#191970', 6, 'SFJ-36-DBL'),

-- Cotton Hoodie variants
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'S', 'Grey', '#808080', 8, 'CH-S-GRY'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'S', 'Black', '#000000', 6, 'CH-S-BLK'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'M', 'Grey', '#808080', 12, 'CH-M-GRY'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'M', 'Black', '#000000', 10, 'CH-M-BLK'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'L', 'Grey', '#808080', 7, 'CH-L-GRY'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'L', 'Black', '#000000', 5, 'CH-L-BLK'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'XL', 'Grey', '#808080', 3, 'CH-XL-GRY'),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'XL', 'Black', '#000000', 2, 'CH-XL-BLK');

-- Insert Sample Product Images (placeholder URLs - replace with actual Supabase storage URLs)
INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES
-- Premium Cotton T-Shirt images
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'https://via.placeholder.com/800x800/FFFFFF/000000?text=Premium+Cotton+T-Shirt+White', 'Premium Cotton T-Shirt White', 1),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'https://via.placeholder.com/800x800/000000/FFFFFF?text=Premium+Cotton+T-Shirt+Black', 'Premium Cotton T-Shirt Black', 2),
((SELECT id FROM products WHERE slug = 'premium-cotton-t-shirt'), 'https://via.placeholder.com/800x800/F5F5F5/333333?text=Premium+Cotton+T-Shirt+Detail', 'Premium Cotton T-Shirt Detail', 3),

-- Graphic Print T-Shirt images
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'https://via.placeholder.com/800x800/000080/FFFFFF?text=Graphic+Print+T-Shirt+Navy', 'Graphic Print T-Shirt Navy', 1),
((SELECT id FROM products WHERE slug = 'graphic-print-t-shirt'), 'https://via.placeholder.com/800x800/808080/FFFFFF?text=Graphic+Print+T-Shirt+Grey', 'Graphic Print T-Shirt Grey', 2),

-- Formal White Shirt images
((SELECT id FROM products WHERE slug = 'formal-white-shirt'), 'https://via.placeholder.com/800x800/FFFFFF/000000?text=Formal+White+Shirt', 'Formal White Shirt', 1),
((SELECT id FROM products WHERE slug = 'formal-white-shirt'), 'https://via.placeholder.com/800x800/F8F8FF/333333?text=Formal+White+Shirt+Detail', 'Formal White Shirt Detail', 2),

-- Casual Check Shirt images
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'https://via.placeholder.com/800x800/4169E1/FFFFFF?text=Casual+Check+Shirt+Blue', 'Casual Check Shirt Blue', 1),
((SELECT id FROM products WHERE slug = 'casual-check-shirt'), 'https://via.placeholder.com/800x800/DC143C/FFFFFF?text=Casual+Check+Shirt+Red', 'Casual Check Shirt Red', 2),

-- Slim Fit Blue Jeans images
((SELECT id FROM products WHERE slug = 'slim-fit-blue-jeans'), 'https://via.placeholder.com/800x800/191970/FFFFFF?text=Slim+Fit+Blue+Jeans', 'Slim Fit Blue Jeans', 1),
((SELECT id FROM products WHERE slug = 'slim-fit-blue-jeans'), 'https://via.placeholder.com/800x800/1E1E3F/FFFFFF?text=Slim+Fit+Blue+Jeans+Detail', 'Slim Fit Blue Jeans Detail', 2),

-- Cotton Hoodie images
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'https://via.placeholder.com/800x800/808080/FFFFFF?text=Cotton+Hoodie+Grey', 'Cotton Hoodie Grey', 1),
((SELECT id FROM products WHERE slug = 'cotton-hoodie'), 'https://via.placeholder.com/800x800/000000/FFFFFF?text=Cotton+Hoodie+Black', 'Cotton Hoodie Black', 2);

-- Insert Sample Banners
INSERT INTO banners (title, subtitle, image_url, link_url, is_active, display_order) VALUES
('New Collection 2024', 'Discover the latest trends in fashion', 'https://via.placeholder.com/1200x400/87CEEB/000000?text=New+Collection+2024', '/products', true, 1),
('Hot Sale - Up to 50% Off', 'Limited time offer on selected items', 'https://via.placeholder.com/1200x400/FF6347/FFFFFF?text=Hot+Sale+50%25+Off', '/products?filter=hot-sale', true, 2),
('Free Delivery', 'Free delivery on orders above ₹999', 'https://via.placeholder.com/1200x400/32CD32/FFFFFF?text=Free+Delivery+Above+999', '/products', true, 3);

-- Insert Sample Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 500.00, 100.00, 100, true, NOW() + INTERVAL '30 days'),
('FLAT50', 'fixed', 50.00, 299.00, NULL, 200, true, NOW() + INTERVAL '15 days'),
('NEWUSER20', 'percentage', 20.00, 999.00, 200.00, 50, true, NOW() + INTERVAL '60 days'),
('SAVE100', 'fixed', 100.00, 1499.00, NULL, 150, true, NOW() + INTERVAL '45 days');

-- Create a sample admin user (you'll need to replace with actual user ID after creating admin account)
-- INSERT INTO admin_users (user_id, role, is_active) VALUES 
-- ('your-admin-user-uuid-here', 'super_admin', true);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for products with category and stock info
CREATE VIEW products_with_details AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    get_product_total_stock(p.id) as total_stock,
    is_low_stock(p.id) as is_low_stock,
    (
        SELECT image_url 
        FROM product_images 
        WHERE product_id = p.id 
        ORDER BY display_order 
        LIMIT 1
    ) as featured_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- View for order summary (updated by migration 001)
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

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
SELECT 'RJ4WEAR Database Schema Created Successfully! 🎉' as message;