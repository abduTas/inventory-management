import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getStoreContext } from "@/lib/helpers/store-context";
import { ReportsClient } from "@/containers/reports/reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const ctx = await getStoreContext();
  const store = ctx?.store;
  const org = ctx?.org;
  const currency = org?.currency ?? "INR";

  let sales: Array<{ total: number; created_at: string }> = [];
  let topProducts: Array<{ product_name: string; total_qty: number; total_revenue: number }> = [];

  if (store) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: salesData } = await supabase
      .from("sales")
      .select("total, created_at")
      .eq("store_id", store.id)
      .eq("status", "completed")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    sales = salesData ?? [];

    const { data: items } = await supabase
      .from("sale_items")
      .select("product_name, quantity, line_total, sales!inner(store_id, status, created_at)")
      .eq("sales.store_id", store.id)
      .eq("sales.status", "completed")
      .gte("sales.created_at", thirtyDaysAgo.toISOString());

    const productMap = new Map<string, { total_qty: number; total_revenue: number }>();
    items?.forEach((item) => {
      const existing = productMap.get(item.product_name) ?? { total_qty: 0, total_revenue: 0 };
      productMap.set(item.product_name, {
        total_qty: existing.total_qty + item.quantity,
        total_revenue: existing.total_revenue + Number(item.line_total),
      });
    });

    topProducts = Array.from(productMap.entries())
      .map(([product_name, stats]) => ({ product_name, ...stats }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);
  }

  const totalRevenue = sales.reduce((s, x) => s + Number(x.total), 0);

  return (
    <>
      <Header title="Reports" />
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-slate-500">30-day revenue</p>
            <p className="text-xl font-bold">{formatCurrency(totalRevenue, currency)}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Transactions</p>
            <p className="text-xl font-bold">{sales.length}</p>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500">Avg. ticket</p>
            <p className="text-xl font-bold">
              {formatCurrency(sales.length ? totalRevenue / sales.length : 0, currency)}
            </p>
          </Card>
        </div>

        <ReportsClient
          storeName={store?.name ?? "Store"}
          orgName={org?.name ?? "Business"}
          currency={currency}
          totalRevenue={totalRevenue}
          transactionCount={sales.length}
          topProducts={topProducts}
        />

        <Card>
          <CardHeader title="Top products (30 days)" />
          {!topProducts.length ? (
            <p className="text-sm text-slate-500">No sales data yet.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.product_name} className="flex justify-between text-sm">
                  <span className="font-medium">{p.product_name}</span>
                  <span className="text-slate-500">
                    {p.total_qty} sold · {formatCurrency(p.total_revenue, currency)}
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
