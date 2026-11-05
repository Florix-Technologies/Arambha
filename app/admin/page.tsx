
"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { findCategoryConflict, normalizeCategoryName, slugify } from '@/lib/slug';
import { GOOGLE_DRIVE_WARNING, isGoogleDriveLink, normalizeMediaUrl } from '@/lib/imageUtils';
import LoginModal from '@/components/layout/LoginModal';
import MediaPreview from './MediaPreview';
import { useInactivityLogout } from './useInactivityLogout';
import styles from './page.module.css';

const errorObjectMessage = (error: unknown) =>
  typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : undefined;
const errorMessage = (error: unknown) => errorObjectMessage(error) ?? String(error);

type Category = { id: string; name: string; slug: string; collection: string };
type Product = { id: string; category_id: string; name: string; description: string; image_url: string; price?: number; images?: string[] };

// With row level security, an update the policies do not allow matches no rows and returns no error.
const UPDATE_BLOCKED_MESSAGE = 'Not saved: the database does not allow edits yet. Ask your developer to add the UPDATE policy in Supabase.';
const IDLE_LIMIT_MS = 30 * 60 * 1000;
const IDLE_WARNING_MS = 60 * 1000;
const DRAFT_KEY = 'admin-unsaved-form';

type ItemDraft = { id: string; name: string; description: string; price: string; imageUrl: string };

type FormDraft = {
  email: string;
  collection: string;
  categoryId: string | null;
  catName: string;
  prodName: string;
  prodDesc: string;
  prodPrice: string;
  prodImageUrl: string;
  prodImages: string[];
  prodImageInput: string;
  editingProduct: Product | null;
  editingItem: ItemDraft | null;
};

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
  const [renamingCategory, setRenamingCategory] = useState<Category | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
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
  const [editingItem, setEditingItem] = useState<ItemDraft | null>(null);
  const [itemError, setItemError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoutNotice, setLogoutNotice] = useState('');
  // An ImgBB lookup can finish after its link was edited or its modal closed; each field only trusts its latest lookup.
  const mainLookup = useRef(0);
  const extraLookup = useRef(0);
  const itemLookup = useRef(0);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

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
      } else if (session?.user) {
        console.log('User signed in/session exists');
        setIsAuthenticated(true);
        setUserEmail(session.user.email || '');
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription?.unsubscribe();
    };
  }, [isLoggingOut]);

  // Restore a form that was open when the inactivity logout happened in this tab.
  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;
    let draft: FormDraft | null = null;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      sessionStorage.removeItem(DRAFT_KEY);
      draft = JSON.parse(saved);
    } catch {
      return;
    }
    if (!draft || draft.email !== userEmail) return;
    setSelectedCollection(draft.collection);
    setPendingCategoryId(draft.categoryId);
    setCatName(draft.catName);
    setProdName(draft.prodName);
    setProdDesc(draft.prodDesc);
    setProdPrice(draft.prodPrice);
    setProdImageUrl(draft.prodImageUrl);
    setProdImages(draft.prodImages);
    setProdImageInput(draft.prodImageInput);
    setEditingProduct(draft.editingProduct);
    setEditingItem(draft.editingItem ?? null);
    setLogoutNotice('');
    setMessage('Your unsaved form from before you were logged out has been restored. Check it, then save.');
  }, [isAuthenticated, userEmail]);

  useEffect(() => {
    if (!pendingCategoryId) return;
    const category = categories.find(cat => cat.id === pendingCategoryId);
    if (category) {
      setPendingCategoryId(null);
      setSelectedCategory(category);
    }
  }, [categories, pendingCategoryId]);

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
    } catch (error: unknown) {
      const errorMsg = errorObjectMessage(error) || JSON.stringify(error) || 'Unknown error';
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
    } catch (error: unknown) {
      const errorMsg = errorObjectMessage(error) || JSON.stringify(error) || 'Unknown error';
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

  const handleRenameCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingCategory) return;
    setRenameError('');
    const name = normalizeCategoryName(renameValue);
    if (!name) {
      setRenameError('Category name is required');
      return;
    }
    const slug = slugify(name);
    if (!slug) {
      setRenameError('Use at least one letter or number in the category name.');
      return;
    }
    if (name === renamingCategory.name && slug === renamingCategory.slug) {
      setRenamingCategory(null);
      return;
    }

    const { id, collection } = renamingCategory;
    try {
      setLoading(true);
      const { data: rows, error: queryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('collection', collection);
      if (queryError) throw new Error(queryError.message);
      const conflict = findCategoryConflict(rows || [], name, slug, renamingCategory.id);
      if (conflict) {
        const collectionLabel = collections.find(item => item.key === collection)?.label || collection;
        setRenameError(`A category called "${conflict.name}" already exists in ${collectionLabel}.`);
        return;
      }

      const { data, error } = await supabase.from('categories').update({ name, slug }).eq('id', id).select('id');
      if (error) throw new Error(error.message);
      if (!data?.length) {
        setRenameError(UPDATE_BLOCKED_MESSAGE);
        return;
      }
      setRenamingCategory(null);
      setMessage('Category renamed successfully!');
      await fetchCategories();
      setSelectedCategory(current => current?.id === id ? { ...current, name, slug } : current);
    } catch (error: unknown) {
      setRenameError(error instanceof Error ? error.message : 'Unknown error');
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
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      setMessage(`Error deleting category: ${errorMessage(error)}`);
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
    } catch (error: unknown) {
      console.error('Error adding product:', error);
      setMessage(`Error adding product: ${errorMessage(error)}`);
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
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      setMessage(`Error deleting product: ${errorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Update product images
  const handleUpdateProduct = async (prod: Product) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .update({ images: prod.images || [] })
        .eq('id', prod.id)
        .select('id');

      if (error) {
        console.error('Update error:', error);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }
      if (!data?.length) throw new Error(UPDATE_BLOCKED_MESSAGE);
      setMessage('Product images updated successfully!');
      setEditingProduct(null);
      if (selectedCategory) {
        await fetchProducts(selectedCategory.id);
      }
    } catch (error: unknown) {
      console.error('Error updating product:', error);
      setExtraImageError(`Error updating product: ${errorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !selectedCategory || loading || resolvingImage) return;
    setItemError('');
    const { id, imageUrl: link } = editingItem;
    const name = editingItem.name.trim();
    if (!name) {
      setItemError('Item name is required');
      return;
    }
    const price = editingItem.price.trim() === '' ? null : Number(editingItem.price);
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setItemError('Price must be a positive number or empty');
      return;
    }
    const description = editingItem.description.trim();
    try {
      setLoading(true);
      setResolvingImage(true);
      const result = await normalizeMediaUrl(link);
      setResolvingImage(false);
      if (!result.ok) {
        setItemError(result.error);
        return;
      }
      const image_url = result.url;
      const { data, error } = await supabase.from('products')
        .update({ name, description, price, image_url }).eq('id', id).select('id');
      if (error) {
        setItemError(error.message);
        return;
      }
      if (!data?.length) {
        setItemError(UPDATE_BLOCKED_MESSAGE);
        return;
      }
      setEditingItem(null);
      setMessage('Item updated successfully!');
      await fetchProducts(selectedCategory.id);
    } catch (error: unknown) {
      setItemError(error instanceof Error ? error.message : 'Could not save item');
    } finally {
      setResolvingImage(false);
      setLoading(false);
    }
  };

  const checkItemImage = async () => {
    if (!editingItem) return;
    const { id, imageUrl } = editingItem;
    const lookup = ++itemLookup.current;
    try {
      setResolvingImage(true);
      const result = await normalizeMediaUrl(imageUrl);
      if (lookup !== itemLookup.current) return;
      if (!result.ok) {
        setItemError(result.error);
        return;
      }
      setEditingItem(current => current?.id === id && current.imageUrl === imageUrl
        ? { ...current, imageUrl: result.url } : current);
    } catch (error: unknown) {
      setItemError(error instanceof Error ? error.message : 'Could not check image link');
    } finally {
      setResolvingImage(false);
    }
  };

  const checkMainImage = async () => {
    if (!prodImageUrl.trim()) {
      setMainImageError('');
      return;
    }
    const lookup = ++mainLookup.current;
    setResolvingImage(true);
    const result = await normalizeMediaUrl(prodImageUrl);
    setResolvingImage(false);
    if (lookup !== mainLookup.current) return;
    setMainImageError(result.ok ? '' : result.error);
    if (result.ok) setProdImageUrl(result.url);
  };

  // Returns the checked link, or null after showing why it cannot be used.
  const checkExtraImage = async (): Promise<string | null> => {
    const lookup = ++extraLookup.current;
    setResolvingImage(true);
    const result = await normalizeMediaUrl(prodImageInput);
    setResolvingImage(false);
    if (lookup !== extraLookup.current) return null;
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
    const productId = editingProduct.id;
    const url = await checkExtraImage();
    if (!url) return;
    setEditingProduct(current => (current?.id === productId
      ? { ...current, images: [...(current.images || []), url] }
      : current));
    setProdImageInput('');
  };

  // Remove image from editing product
  const handleRemoveImageFromProduct = (index: number) => {
    if (!editingProduct) return;
    const newImages = editingProduct.images?.filter((_, i) => i !== index) || [];
    setEditingProduct({ ...editingProduct, images: newImages });
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
      setEditingItem(null);
      setSelectedCollection(collections[0].key);

      console.log('✅ All state cleared - Login modal should now be visible');
      console.log('🔴 LOGOUT COMPLETE');
      
    } catch (error: unknown) {
      console.error('❌ Logout error:', error);
      // Force logout anyway
      setIsAuthenticated(false);
      setUserEmail('');
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
    } catch (error: unknown) {
      console.error('Error sending reset email:', error);
      setMessage(`Error sending reset email: ${errorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const hasUnsavedForm = !!(catName || prodName || prodDesc || prodPrice || prodImageUrl || prodImages.length || prodImageInput || editingProduct || editingItem);

  const handleInactivityLogout = async () => {
    const draft: FormDraft = {
      email: userEmail, collection: selectedCollection, categoryId: selectedCategory?.id ?? null, catName,
      prodName, prodDesc, prodPrice, prodImageUrl, prodImages, prodImageInput, editingProduct, editingItem,
    };
    const keepDraft = hasUnsavedForm;
    await handleLogout();
    if (keepDraft) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.error('Could not keep the unsaved form:', error);
      }
    }
    setLogoutNotice(keepDraft
      ? 'You were logged out after 30 minutes without activity. Log in again here and your unsaved form will come back.'
      : 'You were logged out after 30 minutes without activity.');
  };

  const { secondsLeft: idleSecondsLeft, stayLoggedIn } = useInactivityLogout({
    enabled: isAuthenticated,
    idleLimitMs: IDLE_LIMIT_MS,
    warningMs: IDLE_WARNING_MS,
    onTimeout: handleInactivityLogout,
  });

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return <LoginModal notice={logoutNotice} onLoginSuccess={() => setIsAuthenticated(true)} />;
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
                <span className={styles.categoryActions}>
                  <button
                    type="button"
                    className={styles.renameButton}
                    aria-label={`Rename ${cat.name}`}
                    onClick={e => {
                      e.stopPropagation();
                      setRenamingCategory(cat);
                      setRenameValue(cat.name);
                      setRenameError('');
                    }}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                <button 
                  className={styles.deleteButton} 
                  onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}
                  disabled={loading}
                >
                  🗑
                </button>
                </span>
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
          {renamingCategory && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="rename-category-title">
                <h3 id="rename-category-title">Rename category</h3>
                <form onSubmit={handleRenameCategory}>
                  <label htmlFor="rename-category-name">Name</label>
                  <input
                    id="rename-category-name"
                    className={styles.input}
                    value={renameValue}
                    onChange={e => { setRenameValue(e.target.value); setRenameError(''); }}
                    disabled={loading}
                  />
                  <p>Link: /{renamingCategory.collection}?filter={slugify(renameValue)}</p>
                  {renameError && <p className={styles.fieldError} role="alert">{renameError}</p>}
                  <div className={styles.modalActions}>
                    <button className={styles.button} type="submit" disabled={loading}>Save</button>
                    <button className={styles.button} type="button" onClick={() => { setRenameError(''); setRenamingCategory(null); }} disabled={loading}>Cancel</button>
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
                  onChange={e => { mainLookup.current++; setProdImageUrl(e.target.value); setMainImageError(''); }} 
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
                      onChange={e => { extraLookup.current++; setProdImageInput(e.target.value); setExtraImageError(''); }} 
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
                          onClick={() => {
                            setItemError('');
                            setEditingItem({ id: prod.id, name: prod.name, description: prod.description ?? '', price: prod.price == null ? '' : String(prod.price), imageUrl: prod.image_url ?? '' });
                          }}
                          disabled={loading}
                        >
                          ✏️ Edit
                        </button>
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

              {editingItem && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-item-title">
                    <h3 id="edit-item-title">Edit item</h3>
                    <form onSubmit={handleSaveItem} noValidate>
                      <label htmlFor="edit-item-name">Name</label>
                      <input id="edit-item-name" className={styles.input} required value={editingItem.name}
                        onChange={e => { setEditingItem({ ...editingItem, name: e.target.value }); setItemError(''); }} disabled={loading} />
                      <label htmlFor="edit-item-description">Description</label>
                      <textarea id="edit-item-description" className={styles.input} value={editingItem.description}
                        onChange={e => { setEditingItem({ ...editingItem, description: e.target.value }); setItemError(''); }} disabled={loading} />
                      <label htmlFor="edit-item-price">Price (optional)</label>
                      <input id="edit-item-price" className={styles.input} type="number" min="0" step="0.01" value={editingItem.price}
                        onChange={e => { setEditingItem({ ...editingItem, price: e.target.value }); setItemError(''); }} disabled={loading} />
                      <label htmlFor="edit-item-image">Main image link</label>
                      <input id="edit-item-image" className={styles.input} value={editingItem.imageUrl}
                        onChange={e => { setEditingItem({ ...editingItem, imageUrl: e.target.value }); setItemError(''); }} onBlur={checkItemImage} disabled={loading || resolvingImage} />
                      {editingItem.imageUrl && <MediaPreview url={editingItem.imageUrl} alt="Main image preview" className={styles.imagePreview} />}
                      {isGoogleDriveLink(editingItem.imageUrl) && <p className={styles.fieldWarning}>{GOOGLE_DRIVE_WARNING}</p>}
                      {itemError && <p className={styles.fieldError} role="alert">{itemError}</p>}
                      <div className={styles.modalActions}>
                        <button className={styles.button} type="submit" disabled={loading || resolvingImage}>Save item</button>
                        <button className={styles.button} type="button" disabled={loading || resolvingImage}
                          onClick={() => { itemLookup.current++; setEditingItem(null); setItemError(''); }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

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
                        onChange={e => { extraLookup.current++; setProdImageInput(e.target.value); setExtraImageError(''); }} 
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
                          extraLookup.current++;
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

      {idleSecondsLeft !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="alertdialog" aria-modal="true" aria-labelledby="idle-warning-title">
            <h3 id="idle-warning-title">Still there?</h3>
            <p className={styles.idleWarningText}>
              You will be logged out in {idleSecondsLeft} second{idleSecondsLeft === 1 ? '' : 's'} because of inactivity.
              {hasUnsavedForm && ' Your unsaved form will be kept and restored when you log in again.'}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={stayLoggedIn}>Stay logged in</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>Admin Panel &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
