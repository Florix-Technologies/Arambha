'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { normalizeCategoryName, slugify, findCategoryConflict } from '@/lib/slug';
import { normalizeMediaUrl, isGoogleDriveLink, GOOGLE_DRIVE_WARNING } from '@/lib/imageUtils';
import { WIZARD_TIPS } from '@/lib/helpContent';
import { FurnitureItemCard, InteriorsItemCard, GalleryItemCard } from '@/components/catalog/ItemCard';
import HelpTip from './HelpTip';
import MediaDropzone from './MediaDropzone';
import MediaPreview from './MediaPreview';
import styles from './ItemWizard.module.css';
export type Category = { id: string; name: string; slug: string; collection: string };
export type Product = { id: string; category_id: string; name: string; description: string; image_url: string; price?: number; images?: string[] };
type Draft = { collection: string; categoryId: string; name: string; description: string; price: string; main: string; extras: string[]; step: number; link: string; categoryName: string };
const KEY = 'admin-item-wizard-draft';
const NOT_ALLOWED = 'This account is not allowed to make changes. Log in with the admin account.';
function databaseErrorMessage(error: { message: string; code?: string }) { return error.code === '42501' ? NOT_ALLOWED : `${error.message} (Code: ${error.code})`; }
const collections = [{ key: 'furniture', name: 'Furniture', page: 'Furniture' }, { key: 'interiors', name: 'Interiors', page: 'Interior Solutions' }, { key: 'gallery', name: 'Gallery', page: 'Our Work' }];
const titles = ['Where should it appear?', 'Choose a category', 'Main photo or video', 'Details', 'Extra photos', 'Preview'];
const empty = (collection = '', categoryId = '', step = 1): Draft => ({ collection, categoryId, name: '', description: '', price: '', main: '', extras: [], step, link: '', categoryName: '' });
export default function ItemWizard({ collection, category, product, onClose, onSaved }: { collection: string; category: Category | null; product?: Product; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => product ? { ...empty(collection, product.category_id, 4), name: product.name, description: product.description ?? '', price: product.price == null ? '' : String(product.price), main: product.image_url, extras: product.images ?? [] } : empty(category ? collection : '', category?.id, category ? 3 : 1));
  const [editingId, setEditingId] = useState(product?.id);
  const draftKey = editingId ? `admin-item-wizard-edit-draft:${editingId}` : KEY;
  const discardedDraft = useRef<Draft | null>(null);
  const [resume, setResume] = useState<Draft | null>(null);
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const update = (value: Partial<Draft>) => { setDraft(current => ({ ...current, ...value })); setError(''); };
  const track = (uploading: boolean) => setBusy(count => Math.max(0, count + (uploading ? 1 : -1)));
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(product ? `admin-item-wizard-edit-draft:${product.id}` : KEY) ?? 'null');
      if (saved && typeof saved.name === 'string' && typeof saved.main === 'string' && Array.isArray(saved.extras) && collections.some(c => c.key === saved.collection) && saved.step >= 1 && saved.step <= 6) setResume({ ...empty(), ...saved });
    } catch { /* A damaged draft can be replaced. */ }
    setReady(true);
  }, [product]);
  useEffect(() => {
    if (ready && !resume && !done && draft !== discardedDraft.current) { try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch { setError('Your browser could not keep this draft. Keep this window open until you finish.'); } }
  }, [draft, ready, resume, draftKey, done]);
  useEffect(() => {
    let active = true;
    setCategories([]);
    if (draft.collection) void supabase.from('categories').select('*').eq('collection', draft.collection).then(({ data, error }) => {
      if (active) { if (error) setError(error.message); else setCategories(data ?? []); }
    });
    return () => { active = false; };
  }, [draft.collection]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (document.querySelector('[role="alertdialog"], [data-testid="help-panel"]')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key === 'Tab') {
        const nodes = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]') ?? []).filter(node => node.getClientRects().length);
        const help = document.querySelector<HTMLElement>('[data-testid="help-open"]');
        if (help) nodes.push(help);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!first) { event.preventDefault(); dialog.current?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
      }
    };
    const focus = (event: FocusEvent) => { if (document.querySelector('[role="alertdialog"], [data-testid="help-panel"]')) return; if (!(event.target as HTMLElement).closest('[data-testid="help-open"]') && !dialog.current?.contains(event.target as Node)) dialog.current?.focus(); };
    document.addEventListener('keydown', key); document.addEventListener('focusin', focus);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); document.removeEventListener('focusin', focus); previous?.focus(); };
  }, []);
  useEffect(() => { heading.current?.focus(); }, [draft.step, resume, done]);
  const createCategory = async () => {
    const name = normalizeCategoryName(draft.categoryName), slug = slugify(name);
    if (!name) { setError('Category name is required'); return; }
    if (!slug) { setError('Use at least one letter or number in the category name.'); return; }
    setSaving(true);
    try {
      const { data: rows, error: queryError } = await supabase.from('categories').select('id, name, slug').eq('collection', draft.collection);
      if (queryError) throw new Error(queryError.message);
      const conflict = findCategoryConflict(rows ?? [], name, slug);
      if (conflict) throw new Error(`A category called "${conflict.name}" already exists in ${collections.find(c => c.key === draft.collection)?.name}.`);
      const { data, error } = await supabase.from('categories').insert([{ name, slug, collection: draft.collection }]).select('*');
      if (error) throw new Error(databaseErrorMessage(error));
      if (!data?.length) throw new Error(NOT_ALLOWED);
      setCategories(current => [...current, data[0]]); update({ categoryId: data[0].id, categoryName: '' });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create category'); }
    finally { setSaving(false); }
  };
  const applyLink = async () => {
    if (draft.main && !window.confirm('Replace your current main photo or video?')) return;
    setSaving(true);
    try { const result = await normalizeMediaUrl(draft.link); if (result.ok) update({ main: result.url }); else setError(result.error); }
    catch { setError('Could not check this link. Try again.'); }
    finally { setSaving(false); }
  };
  const validPrice = draft.collection === 'gallery' || draft.price.trim() === '' || (Number.isFinite(Number(draft.price)) && Number(draft.price) >= 0);
  const complete = !!(draft.collection && draft.categoryId && draft.name.trim() && draft.main && validPrice);
  const nextAllowed = [!!draft.collection, !!draft.categoryId, !!draft.main, !!draft.name.trim() && validPrice, true, complete][draft.step - 1];
  const publish = async () => {
    if (!complete || busy || saving) return;
    setSaving(true); setError('');
    try {
      const results = await Promise.all([draft.main, ...(draft.collection === 'gallery' ? [] : draft.extras)].map(normalizeMediaUrl));
      const failed = results.find(r => !r.ok);
      if (failed && !failed.ok) throw new Error(failed.error);
      const urls = results.flatMap(r => r.ok ? [r.url] : []);
      const values = { category_id: draft.categoryId, name: draft.name.trim(), description: draft.description.trim(), price: draft.collection === 'gallery' || !draft.price.trim() ? null : Number(draft.price), image_url: urls[0], images: draft.collection === 'gallery' ? draft.extras : urls.slice(1) };
      const query = editingId ? supabase.from('products').update(values).eq('id', editingId) : supabase.from('products').insert([values]);
      const { data, error } = await query.select('id');
      if (error) throw new Error(databaseErrorMessage(error));
      if (!data?.length) throw new Error(NOT_ALLOWED);
      setDone(true);
      try { localStorage.removeItem(draftKey); } catch { /* Saved successfully. */ }
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save item'); }
    finally { setSaving(false); }
  };
  const tip = (key: keyof typeof WIZARD_TIPS) => <HelpTip text={WIZARD_TIPS[key]} label={`Help with ${key}`} />;
  const move = (index: number, delta: number) => { const extras = [...draft.extras]; [extras[index], extras[index + delta]] = [extras[index + delta], extras[index]]; update({ extras }); };
  const Card = draft.collection === 'furniture' ? FurnitureItemCard : draft.collection === 'interiors' ? InteriorsItemCard : GalleryItemCard;
  return <div className={styles.overlay}><div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="wizard-title" className={styles.dialog}>
    <header className={styles.header}><span>{editingId ? 'Edit item' : 'Add item'}</span><button type="button" data-testid="wizard-close" onClick={onClose}>Close</button></header>
    <div className={styles.content}>
      <h2 id="wizard-title" ref={heading} tabIndex={-1} data-testid="wizard-step">{resume ? 'Continue where you left off' : done ? 'Done!' : `Step ${draft.step} of 6: ${titles[draft.step - 1]}`}</h2>
      {resume ? <div className={styles.choices}><p>Your draft is saved in this browser.</p><button onClick={() => { setDraft(resume); setResume(null); }}>Continue where you left off</button><button onClick={() => {
        try { localStorage.removeItem(draftKey); } catch { /* The draft can still be reset in this window. */ }
        const initial = product ? { ...empty(collection, product.category_id, 4), name: product.name, description: product.description ?? '', price: product.price == null ? '' : String(product.price), main: product.image_url, extras: product.images ?? [] } : empty(category ? collection : '', category?.id, category ? 3 : 1);
        discardedDraft.current = initial;
        setResume(null); setDraft(initial);
      }}>Start over</button></div> : done ? <div className={styles.choices}>
        <a data-testid="wizard-done-view" href={`/${draft.collection}${categories.find(c => c.id === draft.categoryId)?.slug ? `?filter=${encodeURIComponent(categories.find(c => c.id === draft.categoryId)!.slug)}` : ''}`}>Done! View it on the website</a>
        <button data-testid="wizard-done-another" onClick={() => { setEditingId(undefined); setDraft(empty(draft.collection, '', 2)); setDone(false); }}>Add another item</button>
      </div> : <>
        {draft.step === 1 && <div className={styles.choices}>{tip('where')}{collections.map(c => <button key={c.key} data-testid={`wizard-option-${c.key}`} aria-pressed={draft.collection === c.key} onClick={() => update({ collection: c.key, categoryId: draft.collection === c.key ? draft.categoryId : '' })}><strong>{c.name}</strong><span>Shows on the {c.page} page</span></button>)}</div>}
        {draft.step === 2 && <div className={styles.fields}>{tip('category')}<label>Category<select value={draft.categoryId} onChange={e => update({ categoryId: e.target.value })}><option value="">Choose a category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Or create a new category<input value={draft.categoryName} onChange={e => update({ categoryName: e.target.value })} /></label><button disabled={saving || !draft.categoryName.trim()} onClick={() => void createCategory()}>Create category</button></div>}
        {draft.step === 3 && <>{tip('mainMedia')}<MediaDropzone value={draft.main} disabled={saving} onBusyChange={track} onUploaded={main => update({ main })} /><details><summary>Advanced</summary><label>Paste a link {tip('pasteLink')}<input value={draft.link} disabled={saving || busy > 0} onChange={e => update({ link: e.target.value })} /></label><button disabled={saving || busy > 0 || !draft.link.trim()} onClick={() => void applyLink()}>Use this link</button>{(isGoogleDriveLink(draft.link) || isGoogleDriveLink(draft.main)) && <p className={styles.notice}>{GOOGLE_DRIVE_WARNING}</p>}</details></>}
        {draft.step === 4 && <div className={styles.fields}><label>Name (required) {tip('name')}<input required value={draft.name} onChange={e => update({ name: e.target.value })} /></label><label>Description (optional) {tip('description')}<textarea value={draft.description} onChange={e => update({ description: e.target.value })} /></label>{draft.collection !== 'gallery' && <label>Price (optional) {tip('price')}<input type="number" min="0" step="0.01" value={draft.price} onChange={e => update({ price: e.target.value })} />{!validPrice && <span className={styles.error}>Price must be a positive number or empty</span>}</label>}</div>}
        {draft.step === 5 && (draft.collection === 'gallery' ? <p>The Gallery shows only the main photo or video, so no extra photos are needed here.</p> : <>{tip('extras')}<p>Optional. Add more photos, or go to the preview.</p><MediaDropzone multiple photosOnly disabled={saving} onBusyChange={track} onUploaded={url => setDraft(current => ({ ...current, extras: [...current.extras, url] }))} /><div className={styles.extras}>{draft.extras.map((url, index) => <div key={`${url}-${index}`}><MediaPreview url={url} alt={`Extra photo ${index + 1}`} className={styles.media} /><div className={styles.actions}><button onClick={() => update({ extras: draft.extras.filter((_, i) => i !== index) })}>Remove photo {index + 1}</button><button disabled={index === 0} onClick={() => move(index, -1)}>Move earlier</button><button disabled={index === draft.extras.length - 1} onClick={() => move(index, 1)}>Move later</button></div></div>)}</div></>)}
        {draft.step === 6 && <>{tip('preview')}<div className={styles.preview}><Card preview item={{ name: draft.name, description: draft.description, price: draft.collection === 'gallery' || !draft.price ? null : Number(draft.price), image_url: draft.main }} /></div></>}
      </>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    {!resume && !done && <footer className={styles.bar}><button data-testid="wizard-back" disabled={draft.step === 1 || saving || busy > 0} onClick={() => update({ step: draft.step - 1 })}>Back</button>{draft.step < 6 ? <button data-testid="wizard-next" disabled={!nextAllowed || saving || busy > 0} onClick={() => update({ step: draft.step + 1 })}>Next</button> : <button data-testid="wizard-publish" disabled={!complete || saving || busy > 0} onClick={() => void publish()}>{saving ? 'Saving...' : editingId ? 'Save' : 'Publish'}</button>}</footer>}
  </div></div>;
}
