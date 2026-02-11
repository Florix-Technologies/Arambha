## 🚀 Supabase-Only Migration Roadmap

### ❌ Remove
- Flask backend (all Python server code)
- Firebase/Firestore (all config and logic)

### ✅ Keep/Use
- Supabase only (PostgreSQL tables)
- Supabase client SDK in frontend
- Same UI and logic (categories → products → highlight → images expand)
- No backend server cost

---

### 🔥 New Architecture

**Frontend → Supabase (directly)**

No server. No Flask. No Firebase. Only Supabase client SDK.

---

### 1️⃣ Supabase Table Structure

#### categories table
| column     | type                         |
| ---------- | ---------------------------- |
| id         | uuid (primary key)           |
| name       | text                         |
| slug       | text                         |
| collection | text (furniture/interiors)   |
| created_at | timestamp                    |

#### products table
| column      | type                                |
| ----------- | ----------------------------------- |
| id          | uuid                                |
| category_id | uuid (foreign key)                  |
| name        | text                                |
| description | text                                |
| image_url   | text                                |
| images      | text[] (array of image URLs)        |
| price       | numeric                             |
| created_at  | timestamp                           |

---

### 2️⃣ Install Supabase in Frontend

```
npm install @supabase/supabase-js
```

Create `/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

### 3️⃣ Enable Row Level Security (RLS)

In Supabase dashboard, enable RLS for both tables and add policy:

```
Allow read access for all users
```

---

### 4️⃣ Update Frontend Data Fetching

- Remove all fetch/API calls to Flask or Firebase.
- Replace with Supabase queries using the Supabase client.
- Example (see interiors page):

```tsx
import { supabase } from '@/lib/supabase';
// ...
const { data: cats } = await supabase.from('categories').select('*').eq('collection', 'furniture');
```

---

### 5️⃣ Delete Unused Files

- Remove backend/server files, old API docs, and Firebase config files.

---

### ✅ Final App

- Pure frontend + Supabase
- No backend hosting cost
- Free tier is enough for most use cases
- Secure (RLS)
- Scalable and clean

---

**Need help? See interiors page for a full Supabase data-fetching example.**


# Arambha Ecommerce & Interior Platform

## System Overview

This is a full-stack platform for managing and showcasing furniture and interior products, built with Next.js (frontend) and Flask (backend, Firestore database).

### Features
- Dynamic categories and products (no hardcoding)
- Admin panel for full CRUD management
- Images are referenced by URL only (no upload complexity)
- Admin sees a live image preview when entering a product
- Users can place orders via WhatsApp with a single click
- Scalable, CMS-style architecture

## Setup Instructions

### 1. Backend (Flask)
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Set up Firebase and place `key.json` in the project root
- Start Flask server:
  ```bash
  python app.py
  ```

### 2. Frontend (Next.js)
- Set environment variable in `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:5000
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Start Next.js dev server:
  ```bash
  npm run dev
  ```

### 3. Admin Panel
- Go to `/admin` route in your browser
- Add/manage categories and products for both furniture and interiors
- When adding a product, paste an image URL (see live preview)

### 4. Data Flow
```
Admin Panel → Flask Backend → Firestore → Frontend fetches dynamically
```

### 5. User Experience
- All product images are loaded from URLs (no upload required)
- On product pages, users see a "Place Order on WhatsApp" button below each product
- Clicking the button opens WhatsApp with a pre-filled message containing product details

## API Reference

See `README_backend.md` for full API and database structure details.
