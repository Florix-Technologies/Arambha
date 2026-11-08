-- Admin V2 staging database: run ONLY in a new, separate Supabase project (never on the live "ecommerce" project).
-- Mirrors the live schema, RLS policies and media bucket as read on 8 Nov 2026 (read-only introspection).
-- Before running: replace STAGING_ADMIN_EMAIL with the test admin's email (a staging-only login).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  collection text not null,
  created_at timestamp without time zone default now(),
  unique (collection, slug)
);
create index idx_categories_collection on public.categories (collection);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  images text[] default '{}'::text[],
  price numeric,
  created_at timestamp without time zone default now()
);
create index idx_products_category_id on public.products (category_id);
create index idx_products_created_at on public.products (created_at desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "Enable read access for all users" on public.categories for select to public using (true);
create policy "Admin can add categories" on public.categories for insert to authenticated with check ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');
create policy "Admin can edit categories" on public.categories for update to authenticated using ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL') with check ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');
create policy "Admin can delete categories" on public.categories for delete to authenticated using ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');

create policy "Enable read access for all users" on public.products for select to public using (true);
create policy "Admin can add products" on public.products for insert to authenticated with check ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');
create policy "Admin can edit products" on public.products for update to authenticated using ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL') with check ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');
create policy "Admin can delete products" on public.products for delete to authenticated using ((auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-media', 'catalog-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4']);
create policy "Anyone can view catalog media" on storage.objects for select to public using (bucket_id = 'catalog-media');
create policy "Admin can upload catalog media" on storage.objects for insert to authenticated with check (bucket_id = 'catalog-media' and (auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');
create policy "Admin can delete catalog media" on storage.objects for delete to authenticated using (bucket_id = 'catalog-media' and (auth.jwt() ->> 'email') = 'STAGING_ADMIN_EMAIL');

-- Seed: one subcategory per collection so every screen has data (test data only).
insert into public.categories (name, slug, collection) values
  ('Staging Sofas', 'staging-sofas', 'furniture'),
  ('Staging Wooden Interior', 'staging-wooden-interior', 'interiors'),
  ('Staging Kitchen', 'staging-kitchen', 'gallery');
