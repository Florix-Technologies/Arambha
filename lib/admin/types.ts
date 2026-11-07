import type { CategoryKey } from './taxonomy';
export type AdminProduct = {
    id: string;
    name: string;
    category: CategoryKey;
    subcategory: string;
    image: string;
    price?: number;
    status: 'active' | 'draft';
    date: string;
    description?: string;
};
export type AdminSubcategory = {
    id: string;
    name: string;
    category: CategoryKey;
};
export type AdminMedia = {
    id: string;
    file: string;
    thumbnail?: string;
    caption: string;
    subcategory: string;
};
export type UploadProgress = {
    file: string;
    percent: number;
};
