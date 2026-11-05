export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function slugify(name: string): string {
  return name.normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findCategoryConflict<T extends { id: string; name: string; slug: string }>(
  categories: readonly T[],
  name: string,
  slug: string,
  ignoreId?: string,
): T | null {
  const normalizedName = normalizeCategoryName(name).toLowerCase();
  return categories.find(category => category.id !== ignoreId && (
    normalizeCategoryName(category.name).toLowerCase() === normalizedName || category.slug === slug
  )) ?? null;
}
