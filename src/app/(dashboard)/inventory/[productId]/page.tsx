import { createClient } from "@/lib/supabase/server";
import { getStoreContext } from "@/lib/helpers/store-context";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getStockQty } from "@/types/database";
import { notFound } from "next/navigation";
import { StockAdjustForm } from "@/containers/inventory/stock-adjust-form";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const supabase = await createClient();
  const ctx = await getStoreContext();

  const { data: product } = await supabase
    .from("products")
    .select("*, inventory_levels(quantity_on_hand)")
    .eq("id", productId)
    .single();

  if (!product) notFound();

  const currency = ctx?.org.currency ?? "INR";
  const qty = getStockQty(product);
  const threshold = product.reorder_level ?? ctx?.store.default_reorder_level ?? 30;

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <Header title={product.name} />
      <main className="mx-auto w-full max-w-lg space-y-4 p-4">
        <Card>
          <p className="text-sm text-slate-500">SKU: {product.sku}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{qty} in stock</p>
          <p className="text-sm text-slate-500">Alert at {threshold} units</p>
          <p className="mt-2 font-semibold text-emerald-700">
            {formatCurrency(Number(product.sell_price), currency)}
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Adjust stock</h2>
          <StockAdjustForm productId={productId} />
        </Card>

        <a
          href={`/inventory/${productId}/edit`}
          className="block rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-emerald-600 hover:bg-emerald-50"
        >
          Edit product details
        </a>

        <Card>
          <h2 className="mb-3 font-semibold">Recent movements</h2>
          {!movements?.length ? (
            <p className="text-sm text-slate-500">No movements yet.</p>
          ) : (
            <div className="space-y-2">
              {movements.map((m) => (
                <div key={m.id} className="flex justify-between text-sm">
                  <span className="capitalize text-slate-600">{m.movement_type}</span>
                  <span className={m.quantity_change > 0 ? "text-emerald-600" : "text-red-600"}>
                    {m.quantity_change > 0 ? "+" : ""}
                    {m.quantity_change}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
