"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAndSendLowStockAlert } from "@/lib/services/notifications";
import type { CartItem } from "@/types/database";

export async function completeSale(
  storeId: string,
  items: CartItem[],
  paymentMethod: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();
  if (!store) throw new Error("Store not found");

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.sell_price * item.quantity,
    0
  );
  const tax = subtotal * (Number(store.tax_rate) / 100);
  const total = subtotal + tax;

  const { count } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);
  const saleNumber = `S${String((count ?? 0) + 1).padStart(5, "0")}`;

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      store_id: storeId,
      sale_number: saleNumber,
      subtotal,
      tax,
      total,
      payment_method: paymentMethod,
      created_by: user.id,
    })
    .select()
    .single();

  if (saleError || !sale) throw new Error(saleError?.message ?? "Sale failed");

  for (const item of items) {
    const { data: inv } = await supabase
      .from("inventory_levels")
      .select("quantity_on_hand")
      .eq("product_id", item.product.id)
      .single();

    const currentQty = inv?.quantity_on_hand ?? 0;
    if (currentQty < item.quantity) {
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }

    await supabase.from("sale_items").insert({
      sale_id: sale.id,
      product_id: item.product.id,
      product_name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unit_price: item.product.sell_price,
      line_total: item.product.sell_price * item.quantity,
    });

    const newQty = currentQty - item.quantity;
    await supabase
      .from("inventory_levels")
      .update({ quantity_on_hand: newQty })
      .eq("product_id", item.product.id);

    await supabase.from("stock_movements").insert({
      product_id: item.product.id,
      quantity_change: -item.quantity,
      movement_type: "sale",
      reference_id: sale.id,
      created_by: user.id,
    });

    const updatedProduct = {
      ...item.product,
      inventory_levels: { quantity_on_hand: newQty },
    };
    await checkAndSendLowStockAlert(updatedProduct, store, user.id);
  }

  return sale;
}
