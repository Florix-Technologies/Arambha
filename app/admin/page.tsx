
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { findCategoryConflict, normalizeCategoryName, slugify } from '@/lib/slug';
import LoginModal from '@/components/layout/LoginModal';
import MediaPreview from './MediaPreview';
import ItemWizard from './ItemWizard';
import HelpPanel from './HelpPanel';
import AdminTour from './AdminTour';
import { useInactivityLogout } from './useInactivityLogout';
import styles from './page.module.css';

const errorObjectMessage = (error: unknown) =>
  typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : undefined;
const errorMessage = (error: unknown) => errorObjectMessage(error) ?? String(error);

type Category = { id: string; name: string; slug: string; collection: string };
type Product = { id: string; category_id: string; name: string; description: string; image_url: string; price?: number; images?: string[] };

// With row level security, an update or delete the policies do not allow matches no rows and returns no error.
const NOT_ALLOWED_MESSAGE = 'This account is not allowed to make changes. Log in with the admin account.';
const RLS_VIOLATION_CODE = '42501';

function databaseErrorMessage(error: { message: string; code?: string }) {
  return error.code === RLS_VIOLATION_CODE ? NOT_ALLOWED_MESSAGE : `${error.message} (Code: ${error.code})`;
}
const IDLE_LIMIT_MS = 30 * 60 * 1000;
const IDLE_WARNING_MS = 60 * 1000;
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
  const [wizard, setWizard] = useState<{ product?: Product } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tourRestart, setTourRestart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoutNotice, setLogoutNotice] = useState('');
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
        throw new Error(databaseErrorMessage(error));
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
        setRenameError(NOT_ALLOWED_MESSAGE);
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

      const { data: deleted, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', cat.id)
        .select('id');

      if (error) {
        console.error('Delete error:', error);
        throw new Error(databaseErrorMessage(error));
      }
      if (!deleted?.length) throw new Error(NOT_ALLOWED_MESSAGE);
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

  // Delete product
  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Delete product "${prod.name}"?`)) return;

    try {
      setLoading(true);
      const { data: deleted, error } = await supabase
        .from('products')
        .delete()
        .eq('id', prod.id)
        .select('id');

      if (error) {
        console.error('Delete error:', error);
        throw new Error(databaseErrorMessage(error));
      }
      if (!deleted?.length) throw new Error(NOT_ALLOWED_MESSAGE);
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

  // Handle logout - END SESSION PROPERLY
  const handleLogout = async () => {
    console.log('🔴 LOGOUT STARTED');
    setIsLoggingOut(true); // Set flag to prevent auth listener from re-authenticating
    
    try {
      console.log('Clearing Supabase session...');
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Supabase session cleared');

      // IMMEDIATELY set authentication to false
      setIsAuthenticated(false);
      setUserEmail('');
      setSelectedCategory(null);
      setProducts([]);
      setCatName('');
      setMessage('');
      setWizard(null);
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

  const handleInactivityLogout = async () => {
    await handleLogout();
    setLogoutNotice('You were logged out after 30 minutes without activity. Your item draft stays in this browser.');
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
                  background: '#75664f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'background 0.3s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#594d3f')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#75664f')}
              >
                Reset Password
              </button>
              <button 
                onClick={handleLogout}
                disabled={loading}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: '#b55656',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'background 0.3s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#984343')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#b55656')}
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
          borderLeft: '4px solid #75664f',
          borderRadius: '4px',
          color: '#1e40af'
        }}>
          {message}
        </div>
      )}

      {/* Collection Selector */}
      <section className={styles.section}>
        <div className={styles.collectionSelector} data-tour="collections">
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
        <aside className={styles.categoryPanel} data-tour="categories">
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
        <div className={styles.productPanel}>
          <div className={styles.panelHeader}>
            <h2>{selectedCategory ? `Items under: ${selectedCategory.name}` : 'Items'}</h2>
            <button className={styles.addButton} data-tour="add-item" onClick={() => setWizard({})}>Add item</button>
          </div>
          {selectedCategory ? (
            <>
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
                          onClick={() => setWizard({ product: prod })}
                          disabled={loading}
                        >
                          ✏️ Edit
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

            </>
          ) : (
            <div className={styles.emptyState}>Select a category to manage products.</div>
          )}
        </div>
      </div>

      {idleSecondsLeft !== null && (
        <div className={styles.modalOverlay} style={{ zIndex: 1300 }}>
          <div className={styles.modal} role="alertdialog" aria-modal="true" aria-labelledby="idle-warning-title">
            <h3 id="idle-warning-title">Still there?</h3>
            <p className={styles.idleWarningText}>
              You will be logged out in {idleSecondsLeft} second{idleSecondsLeft === 1 ? '' : 's'} because of inactivity.
              Your item draft stays in this browser.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={stayLoggedIn}>Stay logged in</button>
            </div>
          </div>
        </div>
      )}

      {wizard && <ItemWizard collection={selectedCollection} category={selectedCategory} product={wizard.product}
        onClose={() => setWizard(null)} onSaved={() => { void fetchCategories(); if (selectedCategory) void fetchProducts(selectedCategory.id); }} />}

      <HelpPanel open={helpOpen} onOpenChange={setHelpOpen} onRestart={() => { setHelpOpen(false); setTourRestart(value => value + 1); }} />
      <AdminTour blocked={!!wizard || helpOpen} restart={tourRestart} />

      {/* Footer */}
      <footer className={styles.footer}>Admin Panel &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
