Based on the code I read, here's the **Interiors Page Database Schema** in simple form:

---

## 📱 **Interiors Page Schema (Simplified)**

### **What Data It Needs**

The interiors page shows **Categories** with **Products inside them**.

---

## **TABLE 1: Categories (for Interiors)**

```
categories table
WHERE collection = 'interiors'
```

| Column | Example Value | Purpose |
|--------|---------------|---------|
| **id** | `abc-123` | Unique ID |
| **name** | "Kitchen Designs" | Category title |
| **slug** | "kitchen-designs" | URL-friendly name |
| **collection** | "interiors" | Filter: must be "interiors" |
| **created_at** | 2024-01-15 | When added |

**Sample Interiors Categories:**
```
✓ Kitchen Designs
✓ Living Room
✓ Bedrooms
✓ Wardrobes
```

---

## **TABLE 2: Products (linked to Interiors Categories)**

```
products table
WHERE category_id = "any-interior-category-id"
```

| Column | Example Value | Purpose |
|--------|---------------|---------|
| **id** | `prod-456` | Unique product ID |
| **category_id** | `abc-123` | Links to category above |
| **name** | "Modern Kitchen Island" | Product name |
| **description** | "Sleek design with..." | Product details |
| **image_url** | `https://...jpg` | Main image |
| **images[]** | `[url1, url2, url3]` | Multiple images (array) |
| **price** | `250000` | Product cost |
| **created_at** | 2024-01-20 | When added |

**Sample Interior Products:**
```
Kitchen Designs
├── Modern Kitchen Island
│   ├── Main image: https://...
│   └── Extra images: [url1, url2, url3]
├── Modular Kitchen Cabinet
│   └── images: [...]
└── Island with Storage

Living Room
├── Minimalist Sofa Set
├── Wall Unit Design
└── Coffee Table Combo
```

---

## **🔄 How Interiors Page Fetches Data**

### **Step 1: Get All Interior Categories**
```sql
SELECT * FROM categories 
WHERE collection = 'interiors'
```

**Returns:** Kitchen Designs, Living Room, Bedrooms, Wardrobes

### **Step 2: Get Products for Each Category**
```sql
SELECT * FROM products 
WHERE category_id = 'kitchen-designs-id'
```

**Returns:** All products in Kitchen Designs category

### **Step 3: Display on Page**
```
Kitchen Designs
  ├── Product 1
  │   ├── Image
  │   ├── Name
  │   ├── Description
  │   └── WhatsApp Button
  └── Product 2
      └── ...

Living Room
  ├── Product 1
  └── Product 2
```

---

## **📸 Special Feature: Image Expansion**

When user **clicks on a product** on interiors page:

```
Product Card is Selected
    ↓
Show ALL images from images[] array
    ↓
Grid of expanded images appears below
```

**Example:**
```
images = [
  "https://example.com/img1.jpg",
  "https://example.com/img2.jpg",
  "https://example.com/img3.jpg"
]
```

All 3 images display in a grid when product is selected.

---

## **📊 Simple Data Flow Diagram**

```
┌─────────────────────────────┐
│   Interiors Page Loads      │
└────────────┬────────────────┘
             │
             ↓
┌─────────────────────────────┐
│  Query categories table     │
│  WHERE collection='interiors'
└────────────┬────────────────┘
             │
             ↓
    Get 4 categories:
    - Kitchen Designs
    - Living Room
    - Bedrooms
    - Wardrobes
             │
             ↓
┌─────────────────────────────────────┐
│  For each category,                 │
│  Query products table               │
│  WHERE category_id = current_cat    │
└────────────┬────────────────────────┘
             │
             ↓
    Get all products for that category
             │
             ↓
┌─────────────────────────────┐
│   Display on Page           │
│                             │
│  Category 1                 │
│  ├─ Product Grid           │
│  │  ├─ Product 1 Card      │
│  │  ├─ Product 2 Card      │
│  │  └─ Product 3 Card      │
│  │                         │
│  └─ [If product clicked]   │
│     └─ Show all images     │
│                             │
│  Category 2                 │
│  └─ Product Grid           │
└─────────────────────────────┘
```

---

## **🎯 Quick Summary**

**Interiors page uses:**
- ✅ **categories table** (filtered: collection = 'interiors')
- ✅ **products table** (linked via category_id)
- ✅ **images array** (multiple images per product)

**Main features:**
- ✅ Shows categories
- ✅ Shows products in grid
- ✅ Expands images when clicked
- ✅ WhatsApp order button

**That's it!** Very simple - just 2 tables connected together. 🚀



















interiors (collection)
  └── categories (subcollection)
        ├── wooden (doc)
        │     └── products (subcollection)
        │           ├── product1 (doc)
        │           └── product2 (doc)
        └── aluminium (doc)
              └── products (subcollection)
                    └── product1 (doc)
furniture (collection)
  └── categories (subcollection)
        ├── chairs (doc)
        │     └── products (subcollection)
        └── office table (doc)
              └── products (subcollection)

# FINAL SYSTEM DESIGN (ROADMAP)

## 1️⃣ FIRESTORE DATABASE STRUCTURE (FINAL)

Top-level collections:

```
furniture
interiors
```

Example:
```
furniture (collection)
 └── categories (subcollection)
         ├── chairs (doc)
         │    ├── name: "Chairs"
         │    ├── slug: "chairs"
         │    ├── createdAt
         │    └── products (subcollection)
         │         ├── productId1 (doc)
         │         │    ├── name: "Lounge Chair"
         │         │    ├── description: "Customizable finish and fabric"
         │         │    ├── imageUrl
         │         │    ├── createdAt
         │         └── productId2
         │
         ├── office-tables (doc)
         │    ├── name: "Office Tables"
         │    └── products
         │         ├── productId1
         │
         └── cots (doc)
                └── products
```

## 2️⃣ BACKEND (FLASK) API STRUCTURE (FINAL)

Base URL:
```
http://localhost:5000
```

### CATEGORY APIs

POST /furniture/categories
POST /interiors/categories

GET /furniture/categories
GET /interiors/categories

PUT /furniture/categories/:categoryId
DELETE /furniture/categories/:categoryId

### PRODUCT APIs (inside category)

POST /furniture/categories/:categoryId/products
GET /furniture/categories/:categoryId/products
PUT /furniture/categories/:categoryId/products/:productId
DELETE /furniture/categories/:categoryId/products/:productId

## 3️⃣ ADMIN PANEL RESPONSIBILITIES (FINAL)

Admin page `/admin` must allow:

1. Select collection (Furniture, Interiors)
2. Manage Categories (Create, View, Delete)
3. Manage Products (View, Add, Edit, Delete)
    - Name
    - Description
    - Image upload

## 4️⃣ FRONTEND STRUCTURE (Furniture / Interiors)

Fetch categories:
GET /furniture/categories

For each category, fetch products:
GET /furniture/categories/:categoryId/products

Render dynamically:
```tsx
{categories.map(category => (
   <section key={category.id}>
      <h2>{category.name}</h2>
      <div className="grid">
         {category.products.map(product => (
            <Card key={product.id}>
               <img src={product.imageUrl} />
               <h3>{product.name}</h3>
               <p>{product.description}</p>
            </Card>
         ))}
      </div>
   </section>
))}
```

## 5️⃣ COMPLETE DATA FLOW

```
ADMIN PANEL
   ↓
Flask Backend API
   ↓
Firestore (structured data)
   ↓
Frontend fetches dynamically
   ↓
User sees updated UI automatically
```

## 6️⃣ SETUP INSTRUCTIONS

1. Install dependencies:
    pip install -r requirements.txt

2. Set up your Firebase project and download the service account key (key.json). Place it in your project directory.

3. Start the Flask server:
    python app.py

4. Set NEXT_PUBLIC_API_URL in your .env.local for frontend:
    NEXT_PUBLIC_API_URL=http://localhost:5000

5. Start Next.js frontend:
    npm run dev
7. To conduct a test run:
   - Install dependencies: pip install -r requirements.txt
   - Start the Flask server: python app.py
   - Use a tool like Postman or curl to send requests to the endpoints (see below for examples).

Example test (add furniture):
POST http://localhost:5000/furniture
Body (JSON):
{
  "image_url": "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/image.jpg?alt=media",
  "name": "Modern Sofa",
  "cost": 299.99,
  "description": "A comfortable modern sofa.",
  "product_type": "sofa"
}

You should receive a product_id in the response if successful.

# Example JSON for adding furniture
{
  "image_url": "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/image.jpg?alt=media",
  "name": "Modern Sofa",
  "cost": 299.99,
  "description": "A comfortable modern sofa.",
  "product_type": "sofa"
}
