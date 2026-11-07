import type { AdminProduct, AdminSubcategory, AdminMedia, UploadProgress } from './types';
export const SAMPLE = {
 aluminium: 'Aluminium Interior', wooden: 'Wooden Interior', kitchen: 'Kitchen', complete: 'Complete House Interior', living: 'Living Room', bedroom: 'Bedroom', wardrobes: 'Wardrobes',
 partition: 'Aluminium Glass Partition Wall', kitchenSystem: 'Premium Aluminium Kitchen System', windows: 'Sleek Aluminium Window Frames',
 kitchenProduct: 'Modular Kitchen', description: 'Thoughtfully crafted aluminium interiors for bright, practical living spaces.',
 ownerEmail: 'owner@arambha.com', date: '6 Nov 2026',
} as const;
export const subcategories: AdminSubcategory[] = [
    { id: 'aluminium-interior', name: SAMPLE.aluminium, category: 'interiors' }, { id: 'wooden-interior', name: SAMPLE.wooden, category: 'interiors' },
    { id: 'kitchen', name: SAMPLE.kitchen, category: 'furniture' },
    ...[SAMPLE.complete, SAMPLE.kitchen, SAMPLE.living, SAMPLE.bedroom, SAMPLE.wardrobes].map((name, i) => ({ id: ['complete-house-interior', 'kitchen', 'living-room', 'bedroom', 'wardrobes'][i], name, category: 'gallery' as const }))
];
export const products: AdminProduct[] = [SAMPLE.partition, SAMPLE.kitchenSystem, SAMPLE.windows].map((name, i) => ({ id: `al-${i}`, name, category: 'interiors', subcategory: SAMPLE.aluminium, image: ['/al1.jpeg', '/al2.jpeg', '/i1.jpeg'][i], price: [18500, 72000, 24500][i], status: i === 2 ? 'draft' : 'active', date: SAMPLE.date, description: SAMPLE.description }));
products.push({ id: 'kitchen-1', name: SAMPLE.kitchenProduct, category: 'furniture', subcategory: SAMPLE.kitchen, image: '/kitchen1.jpeg', price: 95000, status: 'active', date: SAMPLE.date });
export const media: AdminMedia[] = [{ id: 'm1', file: '/kitchen1.jpeg', thumbnail: '/kitchen1.jpeg', caption: SAMPLE.kitchen, subcategory: SAMPLE.kitchen }, { id: 'm2', file: '/kitchen.mp4', caption: SAMPLE.kitchenSystem, subcategory: SAMPLE.kitchen }, { id: 'm3', file: '/K3.jpeg', thumbnail: '/K3.jpeg', caption: SAMPLE.kitchenProduct, subcategory: SAMPLE.kitchen }];
export const uploads: UploadProgress[] = [{ file: 'kitchen1.jpeg', percent: 76 }, { file: 'kitchen.mp4', percent: 42 }, { file: 'K3.jpeg', percent: 18 }];
export const recentProducts = [...products, ...media.slice(0, 2).map(m => ({ id: m.id, name: m.caption, category: 'gallery' as const, subcategory: m.subcategory, image: m.thumbnail || '/K3.jpeg', status: 'active' as const, date: SAMPLE.date }))];
