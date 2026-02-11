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
('Kitchen Designs', 'kitchen-designs', 'interiors'),
('Living Room', 'living-room', 'interiors'),
('Bedrooms', 'bedrooms', 'interiors'),
('Wardrobes', 'wardrobes', 'interiors')
ON CONFLICT DO NOTHING;

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
