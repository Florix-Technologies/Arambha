# Admin V2: verify Supabase write protection (owner action, read-only first)

Why: Admin V2 (like the current admin) checks login in the browser only. Who may change data is decided
by Supabase Row Level Security (RLS). `supabase_setup.sql` in this repo creates INSERT and DELETE policies
"for all users" and no UPDATE policy. If the live database still has them, anyone with the public anon key
can add or delete products and categories. This repo cannot tell what the live database has.

## 1. Look (read-only) - Supabase dashboard > SQL editor, on the project the site uses
```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('categories', 'products')
order by tablename, cmd;
```
Safe if every INSERT / UPDATE / DELETE policy is limited to the admin (see 3) and only SELECT is open to `anon`.
Unsafe if a write policy has `roles = {public}` or `{anon}`, or `qual` / `with_check` is just `true`.

## 2. Test without touching data
With the anon key only (not logged in), a delete of a made-up id must change zero rows:
`curl -X DELETE "$SUPABASE_URL/rest/v1/products?id=eq.00000000-0000-0000-0000-000000000000" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H "Prefer: return=representation"`
Expect `401/403` (permission denied) rather than `200 []`. Do not use a real id.

## 3. Fix (draft - NOT applied; run on staging first, then by the owner)
"Authenticated" is not enough if public sign-ups are enabled: anyone could register. Pin writes to the admin:
```sql
-- replace with the real admin address (or compare auth.uid() to the admin's user id)
create policy "admin writes products" on products for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE')
  with check ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');
-- same for categories; drop the "for all users" insert/delete policies; keep the SELECT policy.
```
Also turn off "Allow new users to sign up" in Supabase Auth settings, and confirm images/videos in the
storage bucket are writable only by the admin.

Admin V2 treats a write that changes zero rows as "not allowed" (lib/admin/data.ts), so tightened
policies need no code change.
