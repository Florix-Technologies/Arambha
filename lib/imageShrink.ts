export async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || /\.gif$/i.test(file.name)) return file;
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try { await image.decode(); } catch { throw new Error("This photo is in a format your browser can't open (often HEIC from iPhones). Save it as JPG, then try again."); }
    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare this photo. Try again.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const encode = (type: string) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, 0.8));
    let blob = await encode('image/webp');
    if (blob?.type !== 'image/webp') blob = await encode('image/jpeg');
    if (!blob) throw new Error('Could not prepare this photo. Try again.');
    if (scale === 1 && blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/webp' ? '.webp' : '.jpg'), { type: blob.type });
  } finally { URL.revokeObjectURL(url); }
}
