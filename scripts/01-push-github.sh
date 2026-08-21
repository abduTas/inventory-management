#!/bin/bash
# Step 1: Push to GitHub
# Prerequisite: Create repo at https://github.com/new named "inventory-management" (empty, no README)

set -e
cd "$(dirname "$0")/.."

echo "=== Step 1: Push to GitHub ==="
echo "Remote: https://github.com/abduTas/inventory-management"
echo ""

if ! git remote get-url origin &>/dev/null; then
  git remote add origin https://github.com/abduTas/inventory-management.git
fi
git remote set-url origin https://github.com/abduTas/inventory-management.git

echo "Pushing main branch..."
git push -u origin main

echo ""
echo "Done! View at: https://github.com/abduTas/inventory-management"
