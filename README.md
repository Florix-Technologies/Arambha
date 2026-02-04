

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
