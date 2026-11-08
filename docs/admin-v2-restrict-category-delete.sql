-- Owner approval required before running on the live "ecommerce" project (Supabase SQL editor, one run).
-- Tested in an isolated Postgres copy of the live schema and policies: docs/admin-v2-restrict-category-delete.test.mjs
-- 1. The database refuses to delete a subcategory that still has products (ON DELETE RESTRICT) instead of
--    silently deleting those products (current ON DELETE CASCADE). Closes the count-then-delete race.
-- 2. Optional SEO overrides; empty means the website writes the title/description automatically.
-- Changes no rows; one transaction; reversible.
begin;
alter table public.products
  drop constraint products_category_id_fkey,
  add constraint products_category_id_fkey foreign key (category_id)
    references public.categories(id) on delete restrict;
alter table public.products add column if not exists seo_title text, add column if not exists seo_description text;
alter table public.categories add column if not exists seo_title text, add column if not exists seo_description text;
commit;
-- Rollback (restores the previous behaviour):
-- begin;
-- alter table public.products drop constraint products_category_id_fkey,
--   add constraint products_category_id_fkey foreign key (category_id) references public.categories(id) on delete cascade;
-- alter table public.products drop column if exists seo_title, drop column if exists seo_description;
-- alter table public.categories drop column if exists seo_title, drop column if exists seo_description;
-- commit;
