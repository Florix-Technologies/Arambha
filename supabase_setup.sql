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
  collection TEXT NOT NULL CHECK (collection IN ('furniture', 'interiors', 'gallery')),
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
('Wooden Interior', 'wooden-interior', 'interiors'),
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
  (SELECT id FROM categories WHERE slug = 'wooden-interior' AND collection = 'interiors' LIMIT 1),
  'Wooden Wall Paneling',
  'Premium solid wood paneling with traditional craftsmanship. Perfect for creating a warm, sophisticated ambiance in any room.',
  'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1616047207529-3ebe3f92d6d9?w=500&h=500&fit=crop'],
  45000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'wooden-interior' AND collection = 'interiors' LIMIT 1),
  'Wooden Flooring Package',
  'Beautiful engineered wooden flooring with lifetime durability. Complements modern and traditional interiors equally well.',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'],
  35000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'wooden-interior' AND collection = 'interiors' LIMIT 1),
  'Custom Wooden Furniture Suite',
  'Handcrafted wooden furniture set designed specifically for your space. Includes customization options for finish and dimensions.',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop'],
  75000
);

-- Products for Aluminium Interior
INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'aluminium-interior' AND collection = 'interiors' LIMIT 1),
  'Sleek Aluminium Window Frames',
  'Modern aluminium window and door frames with thermal insulation. Contemporary design meets functional excellence.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1552078526-7da38dd2b8b2?w=500&h=500&fit=crop'],
  32000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'aluminium-interior' AND collection = 'interiors' LIMIT 1),
  'Aluminium Glass Partition Wall',
  'Stylish partition system with frosted or clear glass panels. Ideal for creating open yet defined spaces in modern offices and homes.',
  'https://images.unsplash.com/photo-1534183886241-2f3fab999f57?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1534183886241-2f3fab999f57?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1542575215-cdde9dbfc8be?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1564069114553-7215e50023cb?w=500&h=500&fit=crop'],
  28000
);

INSERT INTO products (category_id, name, description, image_url, images, price) VALUES
(
  (SELECT id FROM categories WHERE slug = 'aluminium-interior' AND collection = 'interiors' LIMIT 1),
  'Premium Aluminium Kitchen System',
  'Space-saving modular kitchen with premium aluminium framework. Anti-corrosion and easy-to-maintain design.',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop'],
  52000
);

-- ============================================================
-- SAMPLE CATEGORIES FOR GALLERY
-- ============================================================
INSERT INTO categories (name, slug, collection) VALUES
('Complete House Interior', 'complete-house-interior', 'gallery'),
('Kitchen', 'kitchen-gallery', 'gallery'),
('Living Room', 'living-room-gallery', 'gallery'),
('Bedroom', 'bedroom-gallery', 'gallery'),
('Wardrobes', 'wardrobes-gallery', 'gallery')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE PRODUCTS FOR GALLERY
-- ============================================================

-- Products for Complete House Interior
INSERT INTO products (category_id, name, description, image_url, images) VALUES
(
  (SELECT id FROM categories WHERE slug = 'complete-house-interior' AND collection = 'gallery' LIMIT 1),
  'Complete House Interior - Image 1',
  'image',
  '/i4.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'complete-house-interior' AND collection = 'gallery' LIMIT 1),
  'Complete House Interior - Image 2',
  'image',
  '/i2.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'complete-house-interior' AND collection = 'gallery' LIMIT 1),
  'Complete House Interior - Video 1',
  'video',
  '/v1.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'complete-house-interior' AND collection = 'gallery' LIMIT 1),
  'Complete House Interior - Video 2',
  'video',
  '/v7.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'complete-house-interior' AND collection = 'gallery' LIMIT 1),
  'Complete House Interior - Video 3',
  'video',
  '/v11.mp4',
  ARRAY[]::TEXT[]
);

-- Products for Kitchen
INSERT INTO products (category_id, name, description, image_url, images) VALUES
(
  (SELECT id FROM categories WHERE slug = 'kitchen-gallery' AND collection = 'gallery' LIMIT 1),
  'Kitchen - Image 1',
  'image',
  '/i4.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'kitchen-gallery' AND collection = 'gallery' LIMIT 1),
  'Kitchen - Image 2',
  'image',
  '/i2.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'kitchen-gallery' AND collection = 'gallery' LIMIT 1),
  'Kitchen - Video 1',
  'video',
  '/v1.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'kitchen-gallery' AND collection = 'gallery' LIMIT 1),
  'Kitchen - Video 2',
  'video',
  '/v7.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'kitchen-gallery' AND collection = 'gallery' LIMIT 1),
  'Kitchen - Video 3',
  'video',
  '/v11.mp4',
  ARRAY[]::TEXT[]
);

-- Products for Living Room
INSERT INTO products (category_id, name, description, image_url, images) VALUES
(
  (SELECT id FROM categories WHERE slug = 'living-room-gallery' AND collection = 'gallery' LIMIT 1),
  'Living Room - Image 1',
  'image',
  '/i7.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'living-room-gallery' AND collection = 'gallery' LIMIT 1),
  'Living Room - Image 2',
  'image',
  '/i1.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'living-room-gallery' AND collection = 'gallery' LIMIT 1),
  'Living Room - Video 1',
  'video',
  '/v3.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'living-room-gallery' AND collection = 'gallery' LIMIT 1),
  'Living Room - Image 3',
  'image',
  '/i8.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'living-room-gallery' AND collection = 'gallery' LIMIT 1),
  'Living Room - Video 2',
  'video',
  '/v4.mp4',
  ARRAY[]::TEXT[]
);

-- Products for Bedroom
INSERT INTO products (category_id, name, description, image_url, images) VALUES
(
  (SELECT id FROM categories WHERE slug = 'bedroom-gallery' AND collection = 'gallery' LIMIT 1),
  'Bedroom - Image 1',
  'image',
  '/i6.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'bedroom-gallery' AND collection = 'gallery' LIMIT 1),
  'Bedroom - Image 2',
  'image',
  '/i5.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'bedroom-gallery' AND collection = 'gallery' LIMIT 1),
  'Bedroom - Video 1',
  'video',
  '/v10.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'bedroom-gallery' AND collection = 'gallery' LIMIT 1),
  'Bedroom - Video 2',
  'video',
  '/v2.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'bedroom-gallery' AND collection = 'gallery' LIMIT 1),
  'Bedroom - Video 3',
  'video',
  '/v12.mp4',
  ARRAY[]::TEXT[]
);

-- Products for Wardrobes
INSERT INTO products (category_id, name, description, image_url, images) VALUES
(
  (SELECT id FROM categories WHERE slug = 'wardrobes-gallery' AND collection = 'gallery' LIMIT 1),
  'Wardrobes - Image 1',
  'image',
  '/i6.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'wardrobes-gallery' AND collection = 'gallery' LIMIT 1),
  'Wardrobes - Image 2',
  'image',
  '/i5.jpeg',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'wardrobes-gallery' AND collection = 'gallery' LIMIT 1),
  'Wardrobes - Video 1',
  'video',
  '/v10.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'wardrobes-gallery' AND collection = 'gallery' LIMIT 1),
  'Wardrobes - Video 2',
  'video',
  '/v2.mp4',
  ARRAY[]::TEXT[]
),
(
  (SELECT id FROM categories WHERE slug = 'wardrobes-gallery' AND collection = 'gallery' LIMIT 1),
  'Wardrobes - Video 3',
  'video',
  '/v12.mp4',
  ARRAY[]::TEXT[]
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
