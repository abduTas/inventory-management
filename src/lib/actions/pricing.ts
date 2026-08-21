"use server";

import { createClient } from "@/lib/supabase/server";
import { getStoreContext } from "@/lib/helpers/store-context";
import { revalidatePath } from "next/cache";

export async function createPromotionAction(data: {
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  starts_at?: string;
  ends_at?: string;
}) {
  const ctx = await getStoreContext();
  if (!ctx) return { error: "No store found" };

  const supabase = await createClient();
  const { error } = await supabase.from("promotions").insert({
    store_id: ctx.store.id,
    name: data.name,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    starts_at: data.starts_at || null,
    ends_at: data.ends_at || null,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/pricing");
  return { success: true };
}

export async function togglePromotionAction(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("promotions")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/pricing");
  return { success: true };
}

export async function bulkPriceUpdateAction(percentChange: number) {
  const ctx = await getStoreContext();
  if (!ctx) return { error: "No store found" };

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, sell_price")
    .eq("store_id", ctx.store.id)
    .eq("is_active", true);

  if (!products?.length) return { error: "No products to update" };

  const multiplier = 1 + percentChange / 100;
  for (const p of products) {
    const newPrice = Math.round(Number(p.sell_price) * multiplier * 100) / 100;
    await supabase
      .from("products")
      .update({ sell_price: newPrice, updated_at: new Date().toISOString() })
      .eq("id", p.id);
  }

  revalidatePath("/inventory");
  revalidatePath("/pricing");
  return { success: true, updated: products.length };
}

export async function getActivePromotions(storeId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true);

  return (data ?? []).filter((p) => {
    if (p.starts_at && p.starts_at > now) return false;
    if (p.ends_at && p.ends_at < now) return false;
    return true;
  });
}
