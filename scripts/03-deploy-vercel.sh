#!/bin/bash
# Step 3: Deploy to Vercel
set -e
cd "$(dirname "$0")/.."

echo "=== Step 3: Deploy to Vercel ==="
echo ""
echo "Install Vercel CLI if needed: npm i -g vercel"
echo ""

if [ ! -f .env.local ]; then
  echo "Error: .env.local not found. Create it from .env.example first."
  exit 1
fi

echo "Login to Vercel (opens browser)..."
npx vercel login

echo ""
echo "Deploying..."
npx vercel --prod

echo ""
echo "Add these environment variables in Vercel Dashboard → Project → Settings → Environment Variables:"
echo "  NEXT_PUBLIC_SUPABASE_URL"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  NEXT_PUBLIC_VAPID_PUBLIC_KEY"
echo "  VAPID_PRIVATE_KEY"
echo "  VAPID_SUBJECT"
echo "  TELEGRAM_BOT_TOKEN (optional)"
echo "  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME (optional)"
echo ""
echo "Copy values from your .env.local file."
