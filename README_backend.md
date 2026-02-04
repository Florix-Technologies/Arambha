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
