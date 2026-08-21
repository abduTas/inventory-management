import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getStockQty, isLowStock } from "@/types/database";
import { getStoreContext } from "@/lib/helpers/store-context";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ExportInventoryButton } from "@/containers/inventory/export-inventory-button";

export default async function InventoryPage() {
  const supabase = await createClient();
  const ctx = await getStoreContext();
  const store = ctx?.store;
  const currency = ctx?.org.currency ?? "INR";
  const defaultLevel = store?.default_reorder_level ?? 30;

  const { data: products } = await supabase
    .from("products")
    .select("*, inventory_levels(quantity_on_hand)")
    .eq("store_id", store?.id ?? "")
    .eq("is_active", true)
    .order("name");

  return (
    <>
      <Header title="Inventory" />
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <div className="flex justify-end gap-2">
          <ExportInventoryButton />
          <Link href="/inventory/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </Link>
        </div>

        {!products?.length ? (
          <Card className="text-center">
            <p className="text-slate-500">No products yet.</p>
            <Link href="/inventory/new" className="mt-3 inline-block">
              <Button>Add your first product</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const low = isLowStock(product, defaultLevel);
              const qty = getStockQty(product);
              const threshold = product.reorder_level ?? defaultLevel;
              return (
                <Link key={product.id} href={`/inventory/${product.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{product.name}</h3>
                          {low && <Badge variant="warning">Low stock</Badge>}
                        </div>
                        <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                        <p className="mt-1 text-sm font-medium text-emerald-700">
                          {formatCurrency(Number(product.sell_price), currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${low ? "text-amber-600" : "text-slate-900"}`}>
                          {qty}
                        </p>
                        <p className="text-xs text-slate-400">Alert at {threshold}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
