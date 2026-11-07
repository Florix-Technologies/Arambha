"use client";
import { useState } from 'react';
import { Info, GripVertical, X, Upload } from 'lucide-react';
import { PageHeader, Card, TextField, TextArea, SelectField, Tooltip, Button, Badge, SaveBar } from '../ui';
import { InteriorsItemCard, FurnitureItemCard, GalleryItemCard } from '@/components/catalog/ItemCard';
import { TERMS, MESSAGES, CATEGORIES, CATEGORY_KEYS, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import s from './ProductScreen.module.css';
type Props = {
    mode: 'subcategory' | 'category' | 'dashboard';
    category: CategoryKey;
    subcategory?: string;
    subcategories: AdminSubcategory[];
    product: AdminProduct;
    images: string[];
    dirty: boolean;
};
export function ProductScreen({ mode, category, subcategory, subcategories, product, images, dirty }: Props) {
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description || '');
    const [price, setPrice] = useState(String(product.price ?? ''));
    const [cat, setCat] = useState(category);
    const [sub, setSub] = useState(subcategory || '');
    const [featured, setFeatured] = useState(0);
    const Preview = cat === 'furniture' ? FurnitureItemCard : cat === 'gallery' ? GalleryItemCard : InteriorsItemCard;
    const tip = (label: string, text: string) =>
        <span className={s.label}>
            {label}
            <Tooltip text={text}>
                <button type="button" className={s.icon} aria-label={label}>
                    <Info size={16} />
                </button>
            </Tooltip>
        </span>;
    return <div className={s.page}>
        <PageHeader title={name || TERMS.addProduct} breadcrumbs={[{ label: CATEGORIES[cat].label }, { label: sub || TERMS.subcategory }, { label: TERMS.addProduct }]} />
        <div className={s.columns}>
            <div className={s.main}>
                <Card title={TERMS.productDetails}>
                    <div className={s.fields}>
                        <TextField label={`${TERMS.productName} *`} required value={name} onChange={e => setName(e.target.value)} />
                        <TextArea label={TERMS.description} rows={5} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </Card>
                <Card title={TERMS.media}>
                    <label className={s.drop}>
                        <Upload size={24} />
                        {MESSAGES.dropHint}
                        <input type="file" multiple accept="image/*,video/*" className={s.file} />
                    </label>
                    <div className={s.media}>
                        {images.map((src, i) =>
                            <div className={s.mediaItem} key={src}>
                                <div className={s.photo} style={{ backgroundImage: `url("${src}")` }} role="img" aria-label={name} />
                                <div className={s.mediaActions}>
                                    <button className={s.icon} aria-label={TERMS.reorder}>
                                        <GripVertical size={20} />
                                    </button>
                                    <button className={s.icon} aria-label={TERMS.remove}>
                                        <X size={20} />
                                    </button>
                                </div>
                                {featured === i ?
                                    <div className={s.label}>
                                        <Badge>
                                            {TERMS.featured}
                                        </Badge>
                                        <Tooltip text={MESSAGES.featuredHint}>
                                            <button className={s.icon} aria-label={TERMS.featuredImage}>
                                                <Info size={16} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                    :
                                    <Button variant="plain" onClick={() => setFeatured(i)}>
                                        {TERMS.setFeatured}
                                    </Button>
                                }
                            </div>
                        )}
                    </div>
                    <details className={s.advanced}>
                        <summary>
                            {TERMS.advanced}
                        </summary>
                        <TextField type="url" label={TERMS.addFromUrl} />
                        <Button variant="secondary">
                            {TERMS.addFromUrl}
                        </Button>
                    </details>
                </Card>
                {CATEGORIES[cat].hasPrice &&
                    <Card title={TERMS.pricing}>
                        <TextField type="number" min="0" label={TERMS.price} hint={TERMS.priceHint} value={price} onChange={e => setPrice(e.target.value)} />
                    </Card>
                }
            </div>
            <aside className={s.side}>
                <Card title={TERMS.status}>
                    <SelectField label={tip(TERMS.status, MESSAGES.statusHint)} defaultValue={product.status}>
                        <option value="active">
                            {TERMS.active}
                        </option>
                        <option value="draft">
                            {TERMS.draft}
                        </option>
                    </SelectField>
                </Card>
                <Card title={TERMS.organization}>
                    <div className={s.fields}>
                        {mode === 'dashboard' ?
                            <SelectField label={TERMS.category} value={cat} onChange={e => { setCat(e.target.value as CategoryKey); setSub(''); }}>
                                {CATEGORY_KEYS.map(key =>
                                    <option value={key} key={key}>
                                        {CATEGORIES[key].label}
                                    </option>
                                )}
                            </SelectField>
                            :
                            <TextField label={TERMS.category} value={CATEGORIES[cat].label} readOnly />
                        }{subcategory && mode !== 'dashboard' ?
                            <TextField label={tip(TERMS.subcategory, MESSAGES.subcategoryHint)} value={subcategory} readOnly />
                            :
                            <SelectField label={tip(TERMS.subcategory, MESSAGES.subcategoryHint)} value={sub} required onChange={e => setSub(e.target.value)}>
                                <option value="">
                                    {TERMS.chooseSubcategory}
                                </option>
                                {subcategories.filter(x => x.category === cat).map(x =>
                                    <option key={x.id}>
                                        {x.name}
                                    </option>
                                )}
                                <option value="add">
                                    + {TERMS.addSubcategory}
                                </option>
                            </SelectField>
                        }
                    </div>
                </Card>
                <Card title={TERMS.preview}>
                    <div className={s.preview}>
                        <Preview preview item={{ name, description, price: CATEGORIES[cat].hasPrice && price ? Number(price) : null, image_url: images[featured] }} />
                    </div>
                </Card>
            </aside>
        </div>
        {dirty &&
            <SaveBar onDiscard={() => { }} onSave={() => { }} />
        }
    </div>;
}
