# Setup Guide — One Step at a Time

Follow these in order. Each step must complete before the next works.

---

## Step 1: Push to GitHub

**Status:** Repo must exist first (currently returns 404 if not created).

### 1a. Create the repository

1. Go to https://github.com/new
2. Repository name: `inventory-management`
3. Owner: `abduTas`
4. Keep it **Public** or **Private** (your choice)
5. **Do NOT** add README, .gitignore, or license (empty repo)
6. Click **Create repository**

### 1b. Push from your machine

Open a terminal in the project folder and run:

```bash
git remote set-url origin https://github.com/abduTas/inventory-management.git
git push -u origin main
```

When prompted:
- **Username:** your GitHub username (`abduTas`)
- **Password:** use a [Personal Access Token](https://github.com/settings/tokens) (not your GitHub password)

**Or use GitHub CLI:**
```bash
gh auth login
git push -u origin main
```

**Or run the helper script:**
```bash
chmod +x scripts/01-push-github.sh
./scripts/01-push-github.sh
```

✅ **Done when:** https://github.com/abduTas/inventory-management shows your code

---

## Step 2: Supabase Database Setup

**Status:** Required before signup/login works.

### 2a. Fix your API key

Your `sb_publishable_...` key returns 401. You need the **JWT anon key**:

1. Open https://supabase.com/dashboard/project/sbtbiycfbmeaqhjkehro/settings/api
2. Under **Project API keys**, copy **`anon` `public`** (starts with `eyJ...`)
3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...paste_here
   ```

### 2b. Run the SQL migration

1. Open https://supabase.com/dashboard/project/sbtbiycfbmeaqhjkehro/sql/new
2. Copy the entire contents of `supabase/migrations/001_initial.sql`
3. Paste into the SQL Editor
4. Click **Run**

### 2c. Auth settings

1. Go to **Authentication → Providers → Email** → ensure enabled
2. Disable **Confirm email** for faster testing (optional)

### 2d. Verify

Run in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1;
```

You should see: `profiles`, `organizations`, `stores`, `products`, `sales`, etc.

✅ **Done when:** SQL runs without errors and tables exist

Full details: [scripts/02-supabase-migration.md](scripts/02-supabase-migration.md)

---

## Step 3: Deploy to Vercel

**Status:** Do this after Step 1 (GitHub push) is complete.

### 3a. Import project

1. Go to https://vercel.com/new
2. Import `abduTas/inventory-management` from GitHub
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** (first deploy may fail without env vars — that's OK)

### 3b. Add environment variables

In Vercel → Project → **Settings → Environment Variables**, add:

| Variable | Value (from `.env.local`) |
|----------|--------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sbtbiycfbmeaqhjkehro.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your `eyJ...` anon key |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | from `.env.local` |
| `VAPID_PRIVATE_KEY` | from `.env.local` |
| `VAPID_SUBJECT` | `mailto:tasleem.abdulla@gmail.com` |

### 3c. Redeploy

After adding env vars: **Deployments → ... → Redeploy**

**Or use CLI:**
```bash
chmod +x scripts/03-deploy-vercel.sh
./scripts/03-deploy-vercel.sh
```

✅ **Done when:** Your Vercel URL loads the landing page (e.g. `https://inventory-management-xxx.vercel.app`)

---

## Step 4: Test the App

**Status:** UI tested locally; full flows need Steps 2 + 3 complete.

### 4a. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4b. Test checklist

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Open `/` | Landing page with "Manage your store" |
| 2 | Sign up with phone `+919876543210`, password, name | Redirect to onboarding |
| 3 | Complete store setup (threshold 30) | Step 2: add products |
| 4 | Add a product (SKU, name, price, qty) | Product saved |
| 5 | Go to **Sell** → add to cart → checkout | Receipt shown, stock decreases |
| 6 | Set stock below threshold → sell | Alert in **Notifications** |
| 7 | **Reports** → Download PDF / CSV | Files download |
| 8 | **Settings → Notification preferences** | PWA install + push toggle |
| 9 | On Android Chrome: Install app | PWA on home screen |

### 4c. Automated tests

```bash
npm run build
npm run start          # in one terminal
npm run test:e2e       # in another
```

✅ **Done when:** Signup → product → sale → report all work

---

## Quick reference

| Step | What | Blocked by |
|------|------|------------|
| 1 | GitHub push | You create repo + authenticate |
| 2 | Supabase migration | You run SQL + fix anon key |
| 3 | Vercel deploy | Step 1 complete |
| 4 | Full app test | Steps 2 + 3 complete |

Need help on a specific step? Tell me which step number and any error message you see.
