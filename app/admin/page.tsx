
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertImageUrl, extractGoogleDriveFileId, detectImageService } from '@/lib/imageUtils';
import LoginModal from '@/components/layout/LoginModal';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string; collection: string };
type Product = { id: string; category_id: string; name: string; description: string; image_url: string; price?: number; images?: string[] };

const collections = [
  { key: 'furniture', label: 'Furniture' },
  { key: 'interiors', label: 'Interiors' },
  { key: 'gallery', label: 'Gallery' }
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Flag to prevent re-auth during logout
  const [selectedCollection, setSelectedCollection] = useState(collections[0].key);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [catName, setCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageInput, setProdImageInput] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null); // Session timeout

  // Check if user is authenticated on mount
  useEffect(() => {
    console.log('Auth useEffect running...');
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check result:', session?.user?.email || 'No session');
        
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || '');
          // Start a 30-minute inactivity timeout
          startSessionTimeout();
        } else {
          setIsAuthenticated(false);
          setUserEmail('');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserEmail('');
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'User:', session?.user?.email || 'null', 'LoggingOut flag:', isLoggingOut);
      
      // Don't re-authenticate during logout
      if (isLoggingOut) {
        console.log('Ignoring auth change because user is logging out');
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out detected');
        setIsAuthenticated(false);
        setUserEmail('');
        clearSessionTimeout();
      } else if (session?.user) {
        console.log('User signed in/session exists');
        setIsAuthenticated(true);
        setUserEmail(session.user.email || '');
        startSessionTimeout();
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
        clearSessionTimeout();
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription?.unsubscribe();
      clearSessionTimeout();
    };
  }, [isLoggingOut]);

  // Fetch categories when collection changes
  useEffect(() => {
    fetchCategories();
    setSelectedCategory(null);
    setProducts([]);
  }, [selectedCollection]);

  // Fetch products when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory.id);
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('collection', selectedCollection);

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      const errorMsg = error?.message || JSON.stringify(error) || 'Unknown error';
      console.error('Error fetching categories:', errorMsg);
      setMessage(`Error fetching categories: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from Supabase
  const fetchProducts = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId);

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      const errorMsg = error?.message || JSON.stringify(error) || 'Unknown error';
      console.error('Error fetching products:', errorMsg);
      setMessage(`Error fetching products: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setMessage('Category name is required');
      return;
    }

    try {
      setLoading(true);
      const slug = catName.toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: catName, slug, collection: selectedCollection }]);

      if (error) {
        console.error('Insert error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      setMessage('Category added successfully!');
      setCatName('');
      setShowAddCat(false);
      await fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      setMessage(`Error adding category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', cat.id);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      setMessage('Category deleted successfully!');
      setSelectedCategory(null);
      await fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setMessage(`Error deleting category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setMessage('Please select a category');
      return;
    }
    if (!prodName.trim() || !prodImageUrl.trim()) {
      setMessage('Product name and image URL are required');
      return;
    }

    try {
      setLoading(true);
      
      // Convert image URLs (handles Google Drive links, ImgBB links, etc.)
      const convertedMainImage = convertImageUrl(prodImageUrl);
      const convertedImages = prodImages.map(img => convertImageUrl(img));
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          category_id: selectedCategory.id,
          name: prodName,
          description: prodDesc,
          price: prodPrice ? parseFloat(prodPrice) : null,
          image_url: convertedMainImage,
          images: convertedImages // Include additional images array
        }]);

      if (error) {
        console.error('Insert error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      setMessage('✅ Product added successfully!');
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdImageUrl('');
      setProdImages([]);
      setProdImageInput('');
      await fetchProducts(selectedCategory.id);
    } catch (error: any) {
      console.error('Error adding product:', error);
      setMessage(`Error adding product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Delete product "${prod.name}"?`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', prod.id);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      setMessage('Product deleted successfully!');
      if (selectedCategory) {
        await fetchProducts(selectedCategory.id);
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setMessage(`Error deleting product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update product images
  const handleUpdateProduct = async (prod: Product) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .update({ images: prod.images || [] })
        .eq('id', prod.id);

      if (error) {
        console.error('Update error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      setMessage('Product images updated successfully!');
      setEditingProduct(null);
      if (selectedCategory) {
        await fetchProducts(selectedCategory.id);
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      setMessage(`Error updating product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add image to editing product
  const handleAddImageToProduct = () => {
    if (!editingProduct || !prodImageInput.trim()) {
      setMessage('Please enter an image URL');
      return;
    }
    const newImages = [...(editingProduct.images || []), prodImageInput];
    setEditingProduct({ ...editingProduct, images: newImages });
    setProdImageInput('');
  };

  // Remove image from editing product
  const handleRemoveImageFromProduct = (index: number) => {
    if (!editingProduct) return;
    const newImages = editingProduct.images?.filter((_, i) => i !== index) || [];
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  // Session timeout - auto logout after 30 minutes of inactivity
  const startSessionTimeout = () => {
    clearSessionTimeout(); // Clear any existing timeout
    const timeout = setTimeout(() => {
      console.log('Session timeout - auto logging out');
      handleLogout();
    }, 30 * 60 * 1000); // 30 minutes
    setSessionTimeout(timeout);
  };

  const clearSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  // Handle logout - END SESSION PROPERLY
  const handleLogout = async () => {
    console.log('🔴 LOGOUT STARTED');
    setIsLoggingOut(true); // Set flag to prevent auth listener from re-authenticating
    
    try {
      console.log('Clearing Supabase session...');
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Supabase session cleared');

      // Clear all SessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        console.log('✅ SessionStorage cleared');
      }

      // Clear localStorage completely
      if (typeof window !== 'undefined') {
        localStorage.clear();
        console.log('✅ LocalStorage cleared');
      }

      // IMMEDIATELY set authentication to false
      setIsAuthenticated(false);
      setUserEmail('');
      setSelectedCategory(null);
      setProducts([]);
      setCatName('');
      setMessage('');
      setProdName('');
      setProdDesc('');
      setProdImageUrl('');
      setProdImages([]);
      setProdImageInput('');
      setEditingProduct(null);
      setSelectedCollection(collections[0].key);
      clearSessionTimeout();

      console.log('✅ All state cleared - Login modal should now be visible');
      console.log('🔴 LOGOUT COMPLETE');
      
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      // Force logout anyway
      setIsAuthenticated(false);
      setUserEmail('');
      clearSessionTimeout();
    } finally {
      setIsLoggingOut(false); // Unset flag
    }
  };

  // Handle password reset - Send recovery email
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        throw error;
      }

      setMessage(`✅ Password recovery email sent to ${userEmail}. Please check your email.`);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      setMessage(`Error sending reset email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Manage collections, categories, and products</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Logged in as: <strong>{userEmail}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleResetPassword}
                disabled={loading}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'background 0.3s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#3b82f6')}
              >
                Reset Password
              </button>
              <button 
                onClick={handleLogout}
                disabled={loading}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'background 0.3s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#ef4444')}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#f0f9ff',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '4px',
          color: '#1e40af'
        }}>
          {message}
        </div>
      )}

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
            <button className={styles.addButton} onClick={() => setShowAddCat(true)} disabled={loading}>+ Add</button>
          </div>
          <ul className={styles.categoryList}>
            {categories.map(cat => (
              <li
                key={cat.id}
                className={selectedCategory?.id === cat.id ? styles.selectedCategory : styles.categoryRow}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat.name}</span>
                <button 
                  className={styles.deleteButton} 
                  onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}
                  disabled={loading}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
          {/* Add Category Modal */}
          {showAddCat && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h3>Add Category</h3>
                <form onSubmit={handleAddCategory}>
                  <input 
                    className={styles.input} 
                    placeholder="Category name" 
                    value={catName} 
                    onChange={e => setCatName(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                  <div className={styles.modalActions}>
                    <button className={styles.button} type="submit" disabled={loading}>Create</button>
                    <button className={styles.button} type="button" onClick={() => setShowAddCat(false)} disabled={loading}>Cancel</button>
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
              </div>
              {/* Add Product Inline Card */}
              <form className={styles.inputGroup} onSubmit={handleAddProduct}>
                <input 
                  className={styles.input} 
                  placeholder="Product name" 
                  value={prodName} 
                  onChange={e => setProdName(e.target.value)} 
                  required 
                  disabled={loading}
                />
                <input 
                  className={styles.input} 
                  placeholder="Description" 
                  value={prodDesc} 
                  onChange={e => setProdDesc(e.target.value)} 
                  disabled={loading}
                />
                <input 
                  className={styles.input} 
                  placeholder="Price (Optional)" 
                  type="number" 
                  step="0.01"
                  value={prodPrice} 
                  onChange={e => setProdPrice(e.target.value)} 
                  disabled={loading}
                />
                <input 
                  className={styles.input} 
                  placeholder="Main Image URL" 
                  value={prodImageUrl} 
                  onChange={e => setProdImageUrl(e.target.value)} 
                  required 
                  disabled={loading}
                />
                {prodImageUrl && (
                  <div style={{ marginTop: '0.75rem' }}>
                    {(prodImageUrl.includes('drive.google.com') || prodImageUrl.includes('ibb.co')) ? (
                      <>
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fcd34d',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          fontSize: '0.85rem',
                          color: '#92400e'
                        }}>
                          <strong>📌 {detectImageService(prodImageUrl)} Link Detected</strong>
                          {prodImageUrl.includes('ibb.co') && (
                            <p style={{ margin: '0.5rem 0 0 0' }}>
                              ✅ Converting ImgBB share link to direct image URL...
                            </p>
                          )}
                          {prodImageUrl.includes('drive.google.com') && (
                            <>
                              <p style={{ margin: '0.5rem 0 0 0' }}>
                                ⚠️ <strong>Google Drive has embedding restrictions</strong> - even publicly shared files may not load.
                              </p>
                              <p style={{ margin: '0.5rem 0 0 0' }}>
                                💡 Try <strong>ImgBB</strong> or <strong>Imgur</strong> instead (they work reliably).
                              </p>
                            </>
                          )}
                        </div>
                        <img 
                          src={convertImageUrl(prodImageUrl)} 
                          alt="Preview" 
                          className={styles.imagePreview} 
                          style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '2px solid #fcd34d' }} 
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            const parent = (e.currentTarget as HTMLImageElement).parentElement;
                            if (parent) {
                              const errorDiv = document.createElement('div');
                              errorDiv.style.cssText = 'padding: 0.75rem; background: #fee2e2; border: 1px solid #fecaca; border-radius: 4px; color: #991b1b; font-size: 0.85rem; margin-top: 0.5rem;';
                              
                              if (prodImageUrl.includes('ibb.co')) {
                                errorDiv.innerHTML = `
                                  <strong>❌ ImgBB image failed to load</strong>
                                  <p style="margin: 0.5rem 0 0 0;">You're using a <strong>share link</strong> (ibb.co), not the direct image URL.</p>
                                  <p style="margin: 0.5rem 0 0 0;"><strong>How to get the direct URL:</strong></p>
                                  <ol style="margin: 0.5rem 0 0 0; padding-left: 1rem;">
                                    <li>On imgbb.com, right-click the image after upload</li>
                                    <li>Select <strong>"Copy image link"</strong> (not "Copy page link")</li>
                                    <li>Paste that URL here (should start with <strong>https://i.ibb.co/</strong>)</li>
                                  </ol>
                                `;
                              } else {
                                errorDiv.innerHTML = `
                                  <strong>❌ Image failed to load from ${detectImageService(prodImageUrl)}</strong>
                                  <p style="margin: 0.5rem 0 0 0;">Try using ImgBB or Imgur instead - they work more reliably.</p>
                                `;
                              }
                              parent.appendChild(errorDiv);
                            }
                          }} 
                        />
                      </>
                    ) : (
                      <>
                        <img 
                          src={prodImageUrl} 
                          alt="Preview" 
                          className={styles.imagePreview} 
                          style={{ marginBottom: '0.5rem', maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} 
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }} 
                        />
                        <p style={{ fontSize: '0.8rem', color: '#10b981' }}>✅ {detectImageService(prodImageUrl)}</p>
                      </>
                    )}
                  </div>
                )}
                
                {/* Extra Images Section */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Extra Images (Optional)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input 
                      className={styles.input}
                      placeholder="Image URL (Google Drive links supported)" 
                      value={prodImageInput} 
                      onChange={e => setProdImageInput(e.target.value)} 
                      disabled={loading}
                      style={{ margin: 0 }}
                    />
                    <button 
                      type="button"
                      className={styles.button}
                      onClick={() => {
                        if (prodImageInput.trim()) {
                          setProdImages([...prodImages, prodImageInput]);
                          setProdImageInput('');
                        }
                      }}
                      disabled={loading}
                    >
                      Add
                    </button>
                  </div>
                  {prodImages.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {prodImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img 
                            src={convertImageUrl(img)} 
                            alt={`Extra ${idx}`} 
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).style.opacity = '0.5';
                              (e.currentTarget as HTMLImageElement).style.borderColor = '#fca5a5';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                            disabled={loading}
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button className={styles.button} type="submit" disabled={loading}>Save</button>
              </form>
              {/* Product Grid */}
              <div className={styles.productGrid}>
                {products.map(prod => (
                  <div className={styles.card} key={prod.id}>
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
                      {prod.price && (
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '0.25rem' }}>
                          Price: ₹ {prod.price.toLocaleString('en-IN')}
                        </p>
                      )}
                      {prod.images && prod.images.length > 0 && (
                        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                          📸 {prod.images.length} extra image{prod.images.length !== 1 ? 's' : ''}
                        </p>
                      )}
                      <div className={styles.cardActions}>
                        <button 
                          className={styles.button}
                          onClick={() => setEditingProduct(prod)}
                          disabled={loading}
                          style={{ flex: 1, marginRight: '0.5rem' }}
                        >
                          📷 Edit Images
                        </button>
                        <button 
                          className={styles.deleteButton} 
                          onClick={() => handleDeleteProduct(prod)}
                          disabled={loading}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Product Modal */}
              {editingProduct && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal} style={{ maxWidth: '600px' }}>
                    <h3>Edit Images for: {editingProduct.name}</h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Main Image: {editingProduct.image_url}</p>
                    
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Add More Images</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input 
                        className={styles.input}
                        placeholder="Image URL" 
                        value={prodImageInput} 
                        onChange={e => setProdImageInput(e.target.value)} 
                        disabled={loading}
                        style={{ margin: 0 }}
                      />
                      <button 
                        type="button"
                        className={styles.button}
                        onClick={handleAddImageToProduct}
                        disabled={loading}
                      >
                        Add
                      </button>
                    </div>

                    {editingProduct.images && editingProduct.images.length > 0 && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Extra Images ({editingProduct.images.length})</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          {editingProduct.images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                              <img 
                                src={img} 
                                alt={`Extra ${idx}`} 
                                style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                                onError={e => (e.currentTarget.style.display = 'none')}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImageFromProduct(idx)}
                                disabled={loading}
                                style={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.modalActions}>
                      <button 
                        className={styles.button} 
                        onClick={() => handleUpdateProduct(editingProduct)}
                        disabled={loading}
                      >
                        Save Changes
                      </button>
                      <button 
                        className={styles.button} 
                        onClick={() => {
                          setEditingProduct(null);
                          setProdImageInput('');
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
