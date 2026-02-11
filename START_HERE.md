# 🚀 GET STARTED IN 3 STEPS

Copy-paste this directly. Don't overthink!

---

## ⏱️ STEP 1: Database Setup (2 minutes)

1. Open https://app.supabase.com and select your project
2. Click **SQL Editor** at the bottom left
3. Click **"New Query"**
4. Open the file: `supabase_setup.sql` in your project folder
5. Copy ALL the code (Ctrl+A in that file)
6. Paste it in the Supabase SQL Editor
7. Click **"Run"** button (green, top right)
8. ✅ Wait for success message

**That's it! Your database is ready.**

---

## ⏱️ STEP 2: Start Your App (30 seconds)

Open terminal in your project folder and run:

```bash
npm run dev
```

Wait for this message:
```
> ▲ Next.js 16.1.6
> - ready started server on 0.0.0.0:3000
```

---

## ⏱️ STEP 3: Test Everything (5 minutes)

### Test #1: Admin Panel (Add Data)

1. Go to http://localhost:3000/admin
2. Look at the left side - you should see sample categories
3. Click on "Sofas" 
4. Fill in product details:
   - Name: `My Sofa`
   - Description: `It's comfy`
   - Image URL: `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600`
5. Click "Save"
6. ✅ Product should appear in grid below

### Test #2: View on Furniture Page

1. Go to http://localhost:3000/furniture
2. ✅ You should see your item there!
3. Click the WhatsApp button to verify link works

### Test #3: Check Database

1. Go back to https://app.supabase.com
2. Click **Table Editor** on the left
3. Click **products** table
4. ✅ Your item should be there!

---

## 🎉 DONE!

Your app is working with Supabase!

- ✅ Admin panel: Add/delete items
- ✅ Furniture page: Shows items from database
- ✅ Interiors page: Shows items from database
- ✅ WhatsApp: Orders working

---

## 💡 What to Do Next

### Add More Data
1. Go to http://localhost:3000/admin
2. Add categories or products

### Customize
- Update contact info in `/contact` page
- Add images to gallery
- Update title/description in pages

### Deploy Later
- Push to GitHub
- Deploy to Vercel/Netlify
- Set environment variables

---

## 🔥 Common Issues

### "Can't find supabase_setup.sql"
→ File is in your project root folder

### Database setup gives error
→ Copy the ENTIRE file content (Ctrl+A)

### Page shows empty
→ Did you run the SQL setup? Check Step 1

### Can't add items
→ Check browser console (F12 → Console tab)  
→ Look for error messages

### Items not showing on furniture page
→ Refresh page (F5)

---

## 📞 Need Help?

- Check: `QUICK_START.md` (in project folder)
- Check: `IMPLEMENTATION_GUIDE.md` (in project folder)
- Check: Browser console (F12)

---

**That's all you need to do!** Everything else is already set up. 🎉
