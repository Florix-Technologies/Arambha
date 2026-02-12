-- ============================================================
-- ARAMBHA SUPABASE DATABASE SETUP
-- This script creates all necessary tables for the application
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  collection TEXT NOT NULL CHECK (collection IN ('furniture', 'interiors')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(slug, collection)
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CREATE RLS POLICIES (PUBLIC READ + WRITE ACCESS)
-- ============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON products;
DROP POLICY IF EXISTS "Enable delete for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON products;

-- Categories - Allow public read
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

-- Categories - Allow public insert
CREATE POLICY "Enable insert for all users" ON categories
  FOR INSERT WITH CHECK (true);

-- Categories - Allow public delete
CREATE POLICY "Enable delete for all users" ON categories
  FOR DELETE USING (true);

-- Products - Allow public read
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

-- Products - Allow public insert
CREATE POLICY "Enable insert for all users" ON products
  FOR INSERT WITH CHECK (true);

-- Products - Allow public delete
CREATE POLICY "Enable delete for all users" ON products
  FOR DELETE USING (true);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_categories_collection ON categories(collection);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================================
-- SAMPLE DATA (Optional - Remove if not needed)
-- ============================================================

-- Sample categories for Furniture
INSERT INTO categories (name, slug, collection) VALUES
('Sofas', 'sofas', 'furniture'),
('Chairs', 'chairs', 'furniture'),
('Tables', 'tables', 'furniture'),
('Beds', 'beds', 'furniture')
ON CONFLICT DO NOTHING;

-- Sample categories for Interiors
INSERT INTO categories (name, slug, collection) VALUES
('Wooden Interior', 'wooden-interior', 'interiors'),m 
('Aluminium Interior', 'aluminium-interior', 'interiors'),
('Kitchen Designs', 'kitchen-designs', 'interiors'),
('Living Room', 'living-room', 'interiors'),
('Bedrooms', 'bedrooms', 'interiors'),
('Wardrobes', 'wardrobes', 'interiors')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE PRODUCTS FOR INTERIORS
-- ============================================================

-- Products for Wooden Interior
INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'wooden-interior' AND collection = 'interiors'),
  'Wooden Wall Paneling',
  'Premium solid wood paneling with traditional craftsmanship. Perfect for creating a warm, sophisticated ambiance in any room.',
  'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1616047207529-3ebe3f92d6d9?w=500&h=500&fit=crop'],
  45000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'wooden-interior' AND collection = 'interiors'),
  'Wooden Flooring Package',
  'Beautiful engineered wooden flooring with lifetime durability. Complements modern and traditional interiors equally well.',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'],
  35000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'wooden-interior' AND collection = 'interiors'),
  'Custom Wooden Furniture Suite',
  'Handcrafted wooden furniture set designed specifically for your space. Includes customization options for finish and dimensions.',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop'],
  75000
);

-- Products for Aluminium Interior
INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'aluminium-interior' AND collection = 'interiors'),
  'Sleek Aluminium Window Frames',
  'Modern aluminium window and door frames with thermal insulation. Contemporary design meets functional excellence.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1552078526-7da38dd2b8b2?w=500&h=500&fit=crop'],
  32000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'aluminium-interior' AND collection = 'interiors'),
  'Aluminium Glass Partition Wall',
  'Stylish partition system with frosted or clear glass panels. Ideal for creating open yet defined spaces in modern offices and homes.',
  'https://images.unsplash.com/photo-1534183886241-2f3fab999f57?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1534183886241-2f3fab999f57?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1542575215-cdde9dbfc8be?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1564069114553-7215e50023cb?w=500&h=500&fit=crop'],
  28000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'aluminium-interior' AND collection = 'interiors'),
  'Premium Aluminium Kitchen System',
  'Space-saving modular kitchen with premium aluminium framework. Anti-corrosion and easy-to-maintain design.',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop'],
  52000
);

-- ============================================================
-- IMPORTANT NOTES
-- ============================================================
-- 1. RLS is enabled with public read/write access (DEVELOPMENT ONLY)
-- 2. For production, implement authentication:
--    - Add Supabase Auth
--    - Restrict INSERT/DELETE to authenticated users
--    - Use service role key only on backend
-- 3. Images array stores multiple image URLs
-- 4. Price is optional (can be NULL)
-- 5. Current setup allows anyone to modify data - this is for development testing
-- 6. To make it production-ready, add authentication and update RLS policies
