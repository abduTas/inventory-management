"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProductInput } from "@/lib/validations/auth";

import { getStoreContext } from "@/lib/helpers/store-context";

export async function createProductAction(data: ProductInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const ctx = await getStoreContext();
  if (!ctx) return { error: "No store found. Complete onboarding first." };
  const storeId = ctx.store.id;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      sku: data.sku,
      name: data.name,
      cost_price: data.cost_price,
      sell_price: data.sell_price,
      reorder_level: data.reorder_level ?? null,
      barcode: data.barcode || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("inventory_levels").insert({
    product_id: product.id,
    quantity_on_hand: data.quantity,
  });

  if (data.quantity > 0) {
    await supabase.from("stock_movements").insert({
      product_id: product.id,
      quantity_change: data.quantity,
      movement_type: "initial",
      created_by: user.id,
      notes: "Initial stock",
    });
  }

  return { success: true, product };
}

export async function updateStockAction(
  productId: string,
  quantityChange: number,
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: inv } = await supabase
    .from("inventory_levels")
    .select("quantity_on_hand")
    .eq("product_id", productId)
    .single();

  const newQty = (inv?.quantity_on_hand ?? 0) + quantityChange;
  if (newQty < 0) return { error: "Stock cannot go negative" };

  await supabase
    .from("inventory_levels")
    .update({ quantity_on_hand: newQty })
    .eq("product_id", productId);

  await supabase.from("stock_movements").insert({
    product_id: productId,
    quantity_change: quantityChange,
    movement_type: "adjustment",
    created_by: user.id,
    notes,
  });

  return { success: true, newQty };
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);
  if (error) return { error: error.message };
  return { success: true };
}
