// Isolated test of docs/admin-v2-restrict-category-delete.sql on an in-memory Postgres (PGlite) that copies the live
// schema, foreign key and RLS policies (read from the live project on 9 Nov 2026). Never touches a real database.
// Run: PGLITE_FROM=<folder with node_modules/@electric-sql/pglite>/x.js node docs/admin-v2-restrict-category-delete.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(process.env.PGLITE_FROM ?? import.meta.url);
const { PGlite } = require('@electric-sql/pglite');

const ADMIN = 'admin@arambhainteriorstudio.com';
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated;
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.jwt() to anon, authenticated;
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null, collection text not null, created_at timestamp default now());
create table public.products (id uuid primary key default gen_random_uuid(), category_id uuid not null, name text not null, description text, image_url text, images text[] default '{}', price numeric, created_at timestamp default now(),
  constraint products_category_id_fkey foreign key (category_id) references public.categories(id) on delete cascade);
alter table public.categories enable row level security; alter table public.products enable row level security;
grant select, insert, update, delete on public.categories, public.products to anon, authenticated;
`);
for (const t of ['categories', 'products']) await db.exec(`
create policy "read" on public.${t} for select to public using (true);
create policy "add" on public.${t} for insert to authenticated with check ((auth.jwt() ->> 'email') = '${ADMIN}');
create policy "edit" on public.${t} for update to authenticated using ((auth.jwt() ->> 'email') = '${ADMIN}') with check ((auth.jwt() ->> 'email') = '${ADMIN}');
create policy "delete" on public.${t} for delete to authenticated using ((auth.jwt() ->> 'email') = '${ADMIN}');`);

const as = async (email, sql, params) => {
    await db.exec(`reset role; select set_config('request.jwt.claims', '${JSON.stringify({ email })}', false); set role ${email ? 'authenticated' : 'anon'};`);
    try { return await db.query(sql, params); } finally { await db.exec('reset role'); }
};
const seed = async () => {
    await db.exec('reset role; delete from public.products; delete from public.categories;');
    const [{ id: kitchen }] = (await db.query(`insert into public.categories (name, slug, collection) values ('Kitchen', 'kitchen', 'interiors') returning id`)).rows;
    const [{ id: empty }] = (await db.query(`insert into public.categories (name, slug, collection) values ('Empty', 'empty', 'interiors') returning id`)).rows;
    const [{ id: other }] = (await db.query(`insert into public.categories (name, slug, collection) values ('Other', 'other', 'interiors') returning id`)).rows;
    await db.query(`insert into public.products (category_id, name) values ($1, 'A'), ($1, 'B')`, [kitchen]);
    return { kitchen, empty, other };
};
const products = async () => Number((await db.query('select count(*)::int n from public.products')).rows[0].n);
const code = async promise => { try { await promise; return 'ok'; } catch (error) { return error.code; } };

// Before the migration: the race loses products (count said 0, a product arrives, delete cascades it away).
let ids = await seed();
await as(ADMIN, `insert into public.products (category_id, name) values ($1, 'late arrival')`, [ids.empty]);
await as(ADMIN, 'delete from public.categories where id = $1', [ids.empty]);
assert.equal(await products(), 2, 'baseline: CASCADE silently deleted the late product');

// Apply the migration exactly as written.
await db.exec(readFileSync(new URL('./admin-v2-restrict-category-delete.sql', import.meta.url), 'utf8'));
const fk = (await db.query(`select pg_get_constraintdef(oid) d from pg_constraint where conname = 'products_category_id_fkey'`)).rows[0].d;
assert.match(fk, /ON DELETE RESTRICT/);

ids = await seed();
// Empty subcategory: deletes.
assert.equal((await as(ADMIN, 'delete from public.categories where id = $1 returning id', [ids.empty])).rows.length, 1);
// Subcategory with products: refused by the database, products kept.
assert.equal(await code(as(ADMIN, 'delete from public.categories where id = $1', [ids.kitchen])), '23503');
assert.equal(await products(), 2);
// Race: the app counted 0, then a product arrived, then delete runs: refused, nothing lost.
await as(ADMIN, `insert into public.products (category_id, name) values ($1, 'late arrival')`, [ids.other]);
assert.equal(await code(as(ADMIN, 'delete from public.categories where id = $1', [ids.other])), '23503');
assert.equal(await products(), 3);
// Safe path: move products first, then delete.
await as(ADMIN, 'update public.products set category_id = $1 where category_id = $2', [ids.kitchen, ids.other]);
assert.equal((await as(ADMIN, 'delete from public.categories where id = $1 returning id', [ids.other])).rows.length, 1);
assert.equal(await products(), 3);
// Authorization: other accounts and anonymous visitors cannot delete, rename or move.
assert.equal((await as('someone@example.com', 'delete from public.categories where id = $1 returning id', [ids.kitchen])).rows.length, 0);
assert.equal((await as('someone@example.com', `update public.categories set name = 'x' where id = $1 returning id`, [ids.kitchen])).rows.length, 0);
assert.equal((await as(null, 'delete from public.products returning id')).rows.length, 0);
assert.equal(await code(as('someone@example.com', `insert into public.categories (name, slug, collection) values ('x', 'x', 'interiors')`)), '42501');
// SEO columns exist, are optional and readable by visitors.
await as(ADMIN, `update public.products set seo_title = 'Custom' where name = 'A'`);
assert.equal((await as(null, `select seo_title, seo_description from public.products where name = 'A'`)).rows[0].seo_title, 'Custom');
// Rollback block restores CASCADE.
const sql = readFileSync(new URL('./admin-v2-restrict-category-delete.sql', import.meta.url), 'utf8');
await db.exec(sql.split('-- Rollback')[1].split('\n').filter(l => l.startsWith('-- ')).map(l => l.slice(3)).join('\n'));
assert.match((await db.query(`select pg_get_constraintdef(oid) d from pg_constraint where conname = 'products_category_id_fkey'`)).rows[0].d, /ON DELETE CASCADE/);
console.log('restrict-category-delete: all checks passed');
