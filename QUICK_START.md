# ⚡ Quick Start - Test Your Implementation

## What You Need To Do RIGHT NOW

### 1. Run Database Setup (1 minute)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy **ENTIRE** content from `supabase_setup.sql` file in your project
5. Paste in Supabase SQL Editor
6. Click **Run**

✅ Tables created with sample data!

---

### 2. Start Development Server

```bash
npm run dev
```

---

### 3. Test Admin Panel (Full CRUD)

**URL**: http://localhost:3000/admin

#### 📝 Test Create Category:
1. Select "Furniture" tab
2. Click "+ Add" button
3. Type: "Cabinets"
4. Click "Create"
5. ✅ Should appear in list immediately

#### 📝 Test Create Product:
1. Click on "Sofas" category
2. Fill in:
   - Name: "Modern Leather Sofa"
   - Description: "Premium leather"
   - Image URL: `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600`
3. Click "Save"
4. ✅ Should appear in grid

#### 🗑️ Test Delete:
1. Click trash icon on any product
2. Confirm deletion
3. ✅ Should disappear from list and database

---

### 4. Test Display Pages

#### Furniture Page
**URL**: http://localhost:3000/furniture

✅ Should show:
- Sofas category with products
- Chairs category with products
- All other furniture categories

#### Interiors Page
**URL**: http://localhost:3000/interiors

✅ Should show:
- Kitchen Designs category
- Living Room category
- All products you added via admin

#### Services Page
**URL**: http://localhost:3000/services

✅ Should show:
- Message about updating services
- "Why Choose Us" section
- Contact button

---

### 5. Verify Data in Supabase

1. Open [Supabase Dashboard](https://app.supabase.com) 
2. Click **Table Editor**
3. Select **categories** table
4. ✅ Should see your created categories
5. Select **products** table
6. ✅ Should see your created products

---

## 🎯 Expected Results

If everything works:

✅ Admin page shows categories  
✅ Can add categories (appears in Supabase)  
✅ Can add products to categories  
✅ Can delete items  
✅ Furniture/Interiors pages show added items  
✅ No console errors  

---

## ❌ If Something Doesn't Work

### Admin page shows empty categories?
- Check `.env.local` has correct Supabase URL and key
- Verify SQL script ran successfully (tables exist)
- Check browser console (F12) for errors

### Products not appearing on furniture page?
- Verify you selected "Furniture" collection in admin
- Check Supabase table to confirm data exists
- Try refreshing page

### Getting error messages?
- Read the error message shown in admin page
- Check browser console for details
- Verify RLS is enabled (should allow public read)

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `supabase_setup.sql` | Database schema - run this in Supabase |
| `app/admin/page.tsx` | CRUD admin panel |
| `app/furniture/page.tsx` | Display furniture |
| `app/interiors/page.tsx` | Display interiors |
| `app/services/page.tsx` | Services showcase |
| `lib/supabase.ts` | Supabase client |
| `.env.local` | Your credentials |

---

## 🎉 You're Done!

Your application now has:
- ✅ Full CRUD admin panel
- ✅ Real-time data sync with Supabase
- ✅ No backend server needed
- ✅ Scalable database
- ✅ No hosting costs

**Next time you want to add items**: Go to `/admin` and add them there instead of the SQL editor!
