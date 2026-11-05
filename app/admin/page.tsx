
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { findCategoryConflict, normalizeCategoryName, slugify } from '@/lib/slug';
import { GOOGLE_DRIVE_WARNING, isGoogleDriveLink, normalizeMediaUrl } from '@/lib/imageUtils';
import LoginModal from '@/components/layout/LoginModal';
import MediaPreview from './MediaPreview';
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
  const [catError, setCatError] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageInput, setProdImageInput] = useState('');
  const [mainImageError, setMainImageError] = useState('');
  const [extraImageError, setExtraImageError] = useState('');
  const [resolvingImage, setResolvingImage] = useState(false);
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
    setCatError('');
    const name = normalizeCategoryName(catName);
    if (!name) {
      setCatError('Category name is required');
      return;
    }
    const slug = slugify(name);
    if (!slug) {
      setCatError('Use at least one letter or number in the category name.');
      return;
    }

    try {
      setLoading(true);
      const { data: existingCategories, error: queryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('collection', selectedCollection);

      if (queryError) throw new Error(queryError.message);
      const conflict = findCategoryConflict(existingCategories || [], name, slug);
      if (conflict) {
        const collectionLabel = collections.find(collection => collection.key === selectedCollection)?.label || selectedCollection;
        setCatError(`A category called "${conflict.name}" already exists in ${collectionLabel}.`);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert([{ name, slug, collection: selectedCollection }]);

      if (error) {
        console.error('Insert error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      setMessage('Category added successfully!');
      setCatName('');
      setCatError('');
      setShowAddCat(false);
      await fetchCategories();
    } catch (error: unknown) {
      console.error('Error adding category:', error);
      setCatError(`Error adding category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (cat: Category) => {
    try {
      setLoading(true);
      // products.category_id is ON DELETE CASCADE, so the database removes these items with the category.
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id);
      if (countError) throw new Error(`Could not count this category's items: ${countError.message}`);

      const items = count ?? 0;
      const consequence = items === 0
        ? 'It has no items.'
        : `This also permanently deletes ${items} item${items === 1 ? '' : 's'} in it. This cannot be undone.`;
      if (!window.confirm(`Delete category "${cat.name}"?\n\n${consequence}`)) return;

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
      
      setResolvingImage(true);
      const mainResult = await normalizeMediaUrl(prodImageUrl);
      const extraResults = await Promise.all(prodImages.map(normalizeMediaUrl));
      setResolvingImage(false);
      if (!mainResult.ok) {
        setMainImageError(mainResult.error);
        return;
      }
      const failedExtra = extraResults.find(result => !result.ok);
      if (failedExtra && !failedExtra.ok) {
        setExtraImageError(failedExtra.error);
        return;
      }
      setProdImageUrl(mainResult.url);
      const savedImages = extraResults.flatMap(result => (result.ok ? [result.url] : []));

      const { data, error } = await supabase
        .from('products')
        .insert([{
          category_id: selectedCategory.id,
          name: prodName,
          description: prodDesc,
          price: prodPrice ? parseFloat(prodPrice) : null,
          image_url: mainResult.url,
          images: savedImages
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
      setMainImageError('');
      setExtraImageError('');
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

  const checkMainImage = async () => {
    if (!prodImageUrl.trim()) {
      setMainImageError('');
      return;
    }
    setResolvingImage(true);
    const result = await normalizeMediaUrl(prodImageUrl);
    setResolvingImage(false);
    setMainImageError(result.ok ? '' : result.error);
    if (result.ok) setProdImageUrl(result.url);
  };

  // Returns the checked link, or null after showing why it cannot be used.
  const checkExtraImage = async (): Promise<string | null> => {
    setResolvingImage(true);
    const result = await normalizeMediaUrl(prodImageInput);
    setResolvingImage(false);
    setExtraImageError(result.ok ? '' : result.error);
    return result.ok ? result.url : null;
  };

  const handleAddExtraImage = async () => {
    const url = await checkExtraImage();
    if (!url) return;
    setProdImages(images => [...images, url]);
    setProdImageInput('');
  };

  // Add image to editing product
  const handleAddImageToProduct = async () => {
    if (!editingProduct) return;
    const url = await checkExtraImage();
    if (!url) return;
    setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), url] });
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
        <div className={styles.headerContent}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Manage collections, categories, and products</p>
          </div>
          <div className={styles.accountBlock}>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Logged in as: <strong>{userEmail}</strong>
            </p>
            <div className={styles.accountActions}>
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
            <button className={styles.addButton} onClick={() => { setCatError(''); setShowAddCat(true); }} disabled={loading}>+ Add</button>
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
                    onChange={e => { setCatName(e.target.value); setCatError(''); }}
                    disabled={loading}
                  />
                  {catError && <p className={styles.fieldError} role="alert">{catError}</p>}
                  <div className={styles.modalActions}>
                    <button className={styles.button} type="submit" disabled={loading}>Create</button>
                    <button className={styles.button} type="button" onClick={() => { setCatError(''); setShowAddCat(false); }} disabled={loading}>Cancel</button>
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
                  onChange={e => { setProdImageUrl(e.target.value); setMainImageError(''); }} 
                  onBlur={checkMainImage}
                  required 
                  disabled={loading}
                />
                {prodImageUrl && (
                  <div className={styles.previewBlock}>
                    {mainImageError ? (
                      <p className={styles.fieldError} role="alert">{mainImageError}</p>
                    ) : (
                      <MediaPreview url={prodImageUrl} alt="Main image preview" className={styles.imagePreview} />
                    )}
                    {isGoogleDriveLink(prodImageUrl) && <p className={styles.fieldWarning}>{GOOGLE_DRIVE_WARNING}</p>}
                  </div>
                )}

                {/* Extra Images Section */}
                <div className={styles.extraImages}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Extra Images (Optional)</label>
                  <div className={styles.extraImagesRow}>
                    <input 
                      className={styles.input}
                      placeholder="Image URL" 
                      value={prodImageInput} 
                      onChange={e => { setProdImageInput(e.target.value); setExtraImageError(''); }} 
                      disabled={loading}
                      style={{ margin: 0 }}
                    />
                    <button 
                      type="button"
                      className={styles.button}
                      onClick={handleAddExtraImage}
                      disabled={loading || resolvingImage}
                    >
                      Add
                    </button>
                  </div>
                  {extraImageError && <p className={styles.fieldError} role="alert">{extraImageError}</p>}
                  {isGoogleDriveLink(prodImageInput) && <p className={styles.fieldWarning}>{GOOGLE_DRIVE_WARNING}</p>}
                  {prodImages.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {prodImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <MediaPreview url={img} alt={`Extra ${idx + 1}`} className={styles.extraThumb} />
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
                
                <button className={`${styles.button} ${styles.saveButton}`} type="submit" disabled={loading || resolvingImage}>{resolvingImage ? 'Checking link…' : 'Save'}</button>
              </form>
              {/* Product Grid */}
              <div className={styles.productGrid}>
                {products.map(prod => (
                  <div className={styles.card} key={prod.id}>
                    <div className={styles.imagePlaceholder}>
                      {prod.image_url ? (
                        <MediaPreview url={prod.image_url} alt={prod.name} className={styles.cardMedia} />
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
                  <div className={styles.modal}>
                    <h3>Edit Images for: {editingProduct.name}</h3>
                    <p className={styles.mainImageUrl}>Main Image: {editingProduct.image_url}</p>
                    
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Add More Images</label>
                    <div className={styles.editImagesRow}>
                      <input 
                        className={styles.input}
                        placeholder="Image URL" 
                        value={prodImageInput} 
                        onChange={e => { setProdImageInput(e.target.value); setExtraImageError(''); }} 
                        disabled={loading}
                        style={{ margin: 0 }}
                      />
                      <button 
                        type="button"
                        className={styles.button}
                        onClick={handleAddImageToProduct}
                        disabled={loading || resolvingImage}
                      >
                        Add
                      </button>
                    </div>
                    {extraImageError && <p className={styles.fieldError} role="alert">{extraImageError}</p>}
                    {isGoogleDriveLink(prodImageInput) && <p className={styles.fieldWarning}>{GOOGLE_DRIVE_WARNING}</p>}

                    {editingProduct.images && editingProduct.images.length > 0 && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Extra Images ({editingProduct.images.length})</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          {editingProduct.images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                              <MediaPreview url={img} alt={`Extra ${idx + 1}`} className={styles.editThumb} />
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
                          setExtraImageError('');
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
