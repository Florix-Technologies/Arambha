-- Owner approval required before running on the live "ecommerce" project.
-- Makes the database refuse to delete a subcategory that still has products, instead of silently
-- deleting those products (ON DELETE CASCADE). Changes no rows; one atomic statement; reversible.
alter table public.products
  drop constraint products_category_id_fkey,
  add constraint products_category_id_fkey foreign key (category_id)
    references public.categories(id) on delete restrict;
-- Rollback (restores the current behaviour):
-- alter table public.products drop constraint products_category_id_fkey,
--   add constraint products_category_id_fkey foreign key (category_id) references public.categories(id) on delete cascade;
