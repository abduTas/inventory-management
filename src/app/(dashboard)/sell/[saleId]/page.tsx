import { createClient } from "@/lib/supabase/server";
import { getStoreContext } from "@/lib/helpers/store-context";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const supabase = await createClient();
  const ctx = await getStoreContext();

  const { data: sale } = await supabase
    .from("sales")
    .select("*, sale_items(*)")
    .eq("id", saleId)
    .single();

  if (!sale) notFound();

  const currency = ctx?.org.currency ?? "INR";
  const items = sale.sale_items as Array<{
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;

  return (
    <>
      <Header title="Receipt" />
      <main className="mx-auto w-full max-w-lg p-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Sale #{sale.sale_number}</p>
            <p className="text-xs text-slate-400">{formatDate(sale.created_at)}</p>
          </div>
          <div className="my-4 space-y-2 border-y border-slate-200 py-4">
            {items?.map((item) => (
              <div key={item.sku + item.product_name} className="flex justify-between text-sm">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatCurrency(Number(item.line_total), currency)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(sale.subtotal), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(Number(sale.tax), currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(Number(sale.total), currency)}</span>
            </div>
            <p className="pt-2 text-center text-xs text-slate-500">
              Paid via {sale.payment_method}
            </p>
          </div>
        </Card>
      </main>
    </>
  );
}
