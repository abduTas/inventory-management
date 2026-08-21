# Step 2: Run Supabase Migration

## A. Fix your API key (important)

Your current key `sb_publishable_...` may not work with the Supabase JS client.

1. Open https://supabase.com/dashboard/project/sbtbiycfbmeaqhjkehro/settings/api
2. Copy the **anon public** key (starts with `eyJ...`)
3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
   ```

## B. Run the SQL migration

1. Open **SQL Editor**: https://supabase.com/dashboard/project/sbtbiycfbmeaqhjkehro/sql/new
2. Open file `supabase/migrations/001_initial.sql` from this project
3. Copy **all** contents and paste into the SQL Editor
4. Click **Run**
5. You should see "Success. No rows returned"

## C. Auth settings

1. Go to **Authentication → Providers → Email**
2. Ensure Email is **enabled**
3. For development: disable **Confirm email** (toggle off)

## D. Verify tables exist

Run this in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables: `categories`, `inventory_levels`, `memberships`, `notifications`, `organizations`, `products`, `profiles`, `promotions`, `push_subscriptions`, `sale_items`, `sales`, `stock_movements`, `stores`

## E. Optional: Storage bucket for product images

In **Storage → New bucket**:
- Name: `product-images`
- Public: Yes
