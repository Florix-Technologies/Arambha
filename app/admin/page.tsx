
"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';


type Category = { category_id: string; name: string; slug: string };
type Product = { product_id: string; name: string; description: string; image_url: string };

const collections = [
  { key: 'furniture', label: 'Furniture' },
  { key: 'interiors', label: 'Interiors' }
];

export default function AdminPage() {
  const [selectedCollection, setSelectedCollection] = useState(collections[0].key);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [catName, setCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch categories when collection changes

  useEffect(() => {
    fetch(`${API_BASE}/${selectedCollection}/categories`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(setCategories)
      .catch(err => {
        console.error('Fetch error (categories):', err);
        setCategories([]);
      });
    setSelectedCategory(null);
    setProducts([]);
  }, [selectedCollection]);

  // Fetch products when category changes

  useEffect(() => {
    if (selectedCategory) {
      fetch(`${API_BASE}/${selectedCollection}/categories/${selectedCategory.category_id}/products`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(setProducts)
        .catch(err => {
          console.error('Fetch error (products):', err);
          setProducts([]);
        });
    } else {
      setProducts([]);
    }
  }, [selectedCategory, selectedCollection]);



  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/${selectedCollection}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName })
    });
    setCatName('');
    setShowAddCat(false);
    fetch(`${API_BASE}/${selectedCollection}/categories`).then(res => res.json()).then(setCategories);
  };

  // Delete category
  const handleDeleteCategory = async (cat: Category) => {
    await fetch(`${API_BASE}/${selectedCollection}/categories/${cat.category_id}`, { method: 'DELETE' });
    setSelectedCategory(null);
    fetch(`${API_BASE}/${selectedCollection}/categories`).then(res => res.json()).then(setCategories);
  };

  // Add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    await fetch(`${API_BASE}/${selectedCollection}/categories/${selectedCategory.category_id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: prodName, description: prodDesc, imageUrl: prodImageUrl })
    });
    setProdName('');
    setProdDesc('');
    setProdImageUrl('');
    fetch(`${API_BASE}/${selectedCollection}/categories/${selectedCategory.category_id}/products`).then(res => res.json()).then(setProducts);
  };

  // Delete product
  const handleDeleteProduct = async (prod: Product) => {
    if (!selectedCategory) return;
    await fetch(`${API_BASE}/${selectedCollection}/categories/${selectedCategory.category_id}/products/${prod.product_id}`, { method: 'DELETE' });
    fetch(`${API_BASE}/${selectedCollection}/categories/${selectedCategory.category_id}/products`).then(res => res.json()).then(setProducts);
  };

  // UI
  return (
    <div className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.subtitle}>Manage collections, categories, and products</p>
      </header>

      {/* Collection Selector */}
      <section className={styles.section}>
        <div className={styles.collectionSelector}>
          {collections.map(col => (
            <button
              key={col.key}
              className={selectedCollection === col.key ? styles.selectedTab : styles.tab}
              onClick={() => setSelectedCollection(col.key)}
            >
              {col.label}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.adminGrid}>
        {/* Category Management Panel (Left) */}
        <aside className={styles.categoryPanel}>
          <div className={styles.panelHeader}>
            <h2>Categories</h2>
            <button className={styles.addButton} onClick={() => setShowAddCat(true)}>+ Add</button>
          </div>
          <ul className={styles.categoryList}>
            {categories.map(cat => (
              <li
                key={cat.category_id}
                className={selectedCategory?.category_id === cat.category_id ? styles.selectedCategory : styles.categoryRow}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat.name}</span>
                <button className={styles.deleteButton} onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}>🗑</button>
              </li>
            ))}
          </ul>
          {/* Add Category Modal */}
          {showAddCat && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h3>Add Category</h3>
                <form onSubmit={handleAddCategory}>
                  <input className={styles.input} placeholder="Category name" value={catName} onChange={e => setCatName(e.target.value)} required />
                  <div className={styles.modalActions}>
                    <button className={styles.button} type="submit">Create</button>
                    <button className={styles.button} type="button" onClick={() => setShowAddCat(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </aside>

        {/* Product Management Panel (Right) */}
        <main className={styles.productPanel}>
          {selectedCategory ? (
            <>
              <div className={styles.panelHeader}>
                <h2>Products under: {selectedCategory.name}</h2>
                <button className={styles.addButton} onClick={() => setProdName('')}>+ Add Product</button>
              </div>
              {/* Add Product Inline Card */}
              <form className={styles.inputGroup} onSubmit={handleAddProduct}>
                <input className={styles.input} placeholder="Product name" value={prodName} onChange={e => setProdName(e.target.value)} required />
                <input className={styles.input} placeholder="Description" value={prodDesc} onChange={e => setProdDesc(e.target.value)} />
                <input className={styles.input} placeholder="Image URL" value={prodImageUrl} onChange={e => setProdImageUrl(e.target.value)} required />
                {prodImageUrl && (
                  <img src={prodImageUrl} alt="Preview" className={styles.imagePreview} style={{ marginTop: 8, maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <button className={styles.button} type="submit">Save</button>
              </form>
              {/* Product Grid */}
              <div className={styles.productGrid}>
                {products.map(prod => (
                  <div className={styles.card} key={prod.product_id}>
                    <div className={styles.imagePlaceholder}>
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>{prod.name[0]}</span>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <h3>{prod.name}</h3>
                      <p>{prod.description}</p>
                      <div className={styles.cardActions}>
                        {/* <button className={styles.editButton}>✏</button> */}
                        <button className={styles.deleteButton} onClick={() => handleDeleteProduct(prod)}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>Select a category to manage products.</div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>Admin Panel &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
