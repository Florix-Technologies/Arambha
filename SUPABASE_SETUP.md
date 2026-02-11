# Supabase Migration Setup Guide

## ✅ What I've Already Done

1. **Installed Supabase** 
   - Added `@supabase/supabase-js` to your project

2. **Created Supabase Client**
   - Created `/lib/supabase.ts` with the Supabase client setup

3. **Created Environment File**
   - Created `.env.local` (placeholder for your credentials)

4. **Updated Frontend Pages**
   - ✅ Updated `/app/interiors/page.tsx` to use Supabase
   - ✅ Updated `/app/furniture/page.tsx` to use Supabase
   - Both pages now query `categories` and `products` tables directly

5. **Updated package.json**
   - ✅ Removed Firebase Admin SDK
   - ✅ Added Supabase library

---

## 📋 What YOU Need To Do Now

### Step 1: Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Copy your credentials:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Add Credentials to `.env.local`
Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Create Database Tables in Supabase

In Supabase SQL Editor, run:

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  collection TEXT NOT NULL, -- 'furniture' or 'interiors'
  created_at TIMESTAMP DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  price NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies (allow read access for all)
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);
```

### Step 4: Populate Your Data
Add your categories and products data to the Supabase tables using the admin panel or import from SQL.

---

## 🗑️ What You Can Delete

These files/folders are no longer needed:

- ❌ `app.py` (Flask backend)
- ❌ `key.json` (Firebase config)
- ❌ `requirements.txt` (Python backend requirements)
- ❌ `.venv/` (Python virtual environment)
- ❌ `README_backend.md` (no longer needed)
- ❌ `schema.sql` (if it's for the old database)
- ❌ Any other backend-related files

---

## 🧪 Test Your Setup

After completing all steps:

1. Update `.env.local` with your Supabase credentials
2. Run `npm run dev`
3. Navigate to `/interiors` or `/furniture`
4. If categories and products load, you're successful! ✅

---

## ⚠️ Important Notes

- **Images Array**: The `images` field in products table stores an array of image URLs
- **WhatsApp Integration**: Your pages still use WhatsApp for orders (no changes needed)
- **No Backend Cost**: Supabase free tier is sufficient for most use cases
- **RLS Enabled**: Only read access is enabled by default (secure by default)

---

## Need Help?

If you encounter errors:
1. Check that `.env.local` has correct credentials
2. Verify tables are created in Supabase dashboard
3. Make sure RLS policies are enabled
4. Check browser console for any errors
