"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { completeSale } from "@/lib/services/sales";
import type { Product, CartItem } from "@/types/database";
import { getStockQty } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [storeId, setStoreId] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/store-context");
      if (!res.ok) return;
      const ctx = await res.json();
      if (!ctx.store) return;

      setStoreId(ctx.store.id);
      setCurrency(ctx.org.currency ?? "INR");

      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*, inventory_levels(quantity_on_hand)")
        .eq("store_id", ctx.store.id)
        .eq("is_active", true)
        .order("name");

      setProducts((data as Product[]) ?? []);
    }
    load();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = useCallback((product: Product) => {
    const stock = getStockQty(product);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      if (stock < 1) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== productId) return i;
          const stock = getStockQty(i.product);
          const newQty = i.quantity + delta;
          if (newQty < 1) return null;
          if (newQty > stock) return i;
          return { ...i, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const total = cart.reduce((s, i) => s + i.product.sell_price * i.quantity, 0);

  async function checkout() {
    if (!cart.length || !storeId) return;
    setLoading(true);
    setError("");
    try {
      const sale = await completeSale(storeId, cart, "cash");
      setCart([]);
      router.push(`/sell/${sale.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Sell" />
      <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-base"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
            {filtered.map((product) => {
              const stock = getStockQty(product);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={stock < 1}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-emerald-300 disabled:opacity-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sku} · Stock: {stock}</p>
                  </div>
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(Number(product.sell_price), currency)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-3 font-semibold text-slate-900">Cart ({cart.length})</h2>
          {!cart.length ? (
            <p className="text-sm text-slate-500">Tap products to add them</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.product.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(Number(item.product.sell_price), currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" onClick={() => updateQty(item.product.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button size="icon" variant="outline" onClick={() => updateQty(item.product.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setCart((p) => p.filter((i) => i.product.id !== item.product.id))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <Button className="mt-3 w-full" size="lg" onClick={checkout} loading={loading}>
                  Complete sale
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
