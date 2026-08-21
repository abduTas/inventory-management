import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getStoreContext } from "@/lib/helpers/store-context";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user!.id)
    .single();

  const ctx = await getStoreContext();
  const store = ctx?.store;
  const currency = ctx?.org.currency ?? "INR";

  let productCount = 0;
  let lowStockCount = 0;
  let todaySales = 0;
  let todayRevenue = 0;

  if (store) {
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("is_active", true);
    productCount = count ?? 0;

    const { data: products } = await supabase
      .from("products")
      .select("*, inventory_levels(quantity_on_hand)")
      .eq("store_id", store.id)
      .eq("is_active", true);

    lowStockCount =
      products?.filter((p) => {
        const qty = Array.isArray(p.inventory_levels)
          ? p.inventory_levels[0]?.quantity_on_hand ?? 0
          : (p.inventory_levels as { quantity_on_hand: number } | null)?.quantity_on_hand ?? 0;
        const threshold = p.reorder_level ?? store.default_reorder_level ?? 30;
        return qty <= threshold;
      }).length ?? 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: sales } = await supabase
      .from("sales")
      .select("total")
      .eq("store_id", store.id)
      .eq("status", "completed")
      .gte("created_at", today.toISOString());

    todaySales = sales?.length ?? 0;
    todayRevenue = sales?.reduce((s, x) => s + Number(x.total), 0) ?? 0;
  }

  const stats = [
    { label: "Products", value: productCount, icon: Package, href: "/inventory" },
    { label: "Low stock", value: lowStockCount, icon: AlertTriangle, href: "/inventory", warn: lowStockCount > 0 },
    { label: "Sales today", value: todaySales, icon: ShoppingCart, href: "/sell" },
    { label: "Revenue today", value: formatCurrency(todayRevenue, currency), icon: TrendingUp, href: "/reports" },
  ];

  return (
    <>
      <Header title={`Hi, ${profile?.name?.split(" ")[0] ?? "there"}`} />
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <PwaInstallPrompt />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, href, warn }) => (
            <Link key={label} href={href}>
              <Card className={`transition-shadow hover:shadow-md ${warn ? "border-amber-200 bg-amber-50" : ""}`}>
                <Icon className={`mb-2 h-5 w-5 ${warn ? "text-amber-600" : "text-emerald-600"}`} />
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "New sale", href: "/sell" },
              { label: "Add product", href: "/inventory/new" },
              { label: "View reports", href: "/reports" },
              { label: "Settings", href: "/settings" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-[52px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </main>
    </>
  );
}
