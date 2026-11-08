import { supabase } from '@/lib/supabase';
import { createProduct } from '@/lib/admin/data';
import { uploadMedia, validateMediaFile } from '@/lib/mediaUpload';
import { shrinkImage } from '@/lib/imageShrink';

export type GalleryUpload = { file: File; categoryId: string; url?: string };

export async function saveGalleryUpload(task: GalleryUpload, options: {
    signal: AbortSignal; onProgress: (percent: number) => void;
}): Promise<string> {
    if (!task.file.name.trim() || task.file.size === 0) throw new Error('Choose a non-empty media file.');
    const invalid = validateMediaFile(task.file);
    if (invalid) throw new Error(invalid);
    if (!task.categoryId.trim()) throw new Error('Choose a gallery subcategory.');
    const user = await supabase.auth.getUser();
    if (user.error || !user.data.user) throw new Error('Log in with the admin account to upload.');
    const session = await supabase.auth.getSession();
    if (session.error || !session.data.session) throw new Error('Log in with the admin account to upload.');
    if (options.signal.aborted) throw new Error('Upload cancelled.');
    if (!task.url) {
        const prepared = task.file.type.startsWith('image/') ? await shrinkImage(task.file) : task.file;
        task.url = await uploadMedia(prepared, { ...options, accessToken: session.data.session.access_token });
    }
    const saved = await createProduct({ category_id: task.categoryId, name: task.file.name,
        description: task.file.type.startsWith('video/') ? 'video' : 'image',
        image_url: task.url, images: [], price: '' });
    if (saved.error !== null) throw new Error(saved.error);
    return saved.data;
}
