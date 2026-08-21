"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAndSendLowStockAlert } from "@/lib/services/notifications";
import { getActivePromotions } from "@/lib/actions/pricing";
import { applyBestPromotion } from "@/lib/pricing/promotions";
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

  const promotions = await getActivePromotions(storeId);
  const { discount } = applyBestPromotion(subtotal, promotions);
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * (Number(store.tax_rate) / 100);
  const total = discountedSubtotal + tax;

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
      discount,
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

    const previousQty = inv?.quantity_on_hand ?? 0;
    if (previousQty < item.quantity) {
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

    const newQty = previousQty - item.quantity;
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
    await checkAndSendLowStockAlert(updatedProduct, store, user.id, previousQty);
  }

  return sale;
}

export async function voidSale(saleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: sale } = await supabase
    .from("sales")
    .select("*, sale_items(*)")
    .eq("id", saleId)
    .single();

  if (!sale) throw new Error("Sale not found");
  if (sale.status === "voided") throw new Error("Sale already voided");

  const saleDate = new Date(sale.created_at);
  const today = new Date();
  if (saleDate.toDateString() !== today.toDateString()) {
    throw new Error("Only same-day sales can be voided");
  }

  const items = sale.sale_items as Array<{
    product_id: string;
    quantity: number;
  }>;

  for (const item of items) {
    const { data: inv } = await supabase
      .from("inventory_levels")
      .select("quantity_on_hand")
      .eq("product_id", item.product_id)
      .single();

    const newQty = (inv?.quantity_on_hand ?? 0) + item.quantity;
    await supabase
      .from("inventory_levels")
      .update({ quantity_on_hand: newQty })
      .eq("product_id", item.product_id);

    await supabase.from("stock_movements").insert({
      product_id: item.product_id,
      quantity_change: item.quantity,
      movement_type: "void",
      reference_id: saleId,
      created_by: user.id,
      notes: `Void sale ${sale.sale_number}`,
    });
  }

  await supabase
    .from("sales")
    .update({ status: "voided" })
    .eq("id", saleId);

  return { success: true };
}
