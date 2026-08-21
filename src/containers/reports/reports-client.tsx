"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Props = {
  storeName: string;
  orgName: string;
  currency: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: Array<{ product_name: string; total_qty: number; total_revenue: number }>;
  dailySales: Array<{ date: string; revenue: number; count: number }>;
  lowStockProducts: Array<{ name: string; sku: string; qty: number; threshold: number }>;
  inventoryValue: number;
};

export function ReportsClient({
  storeName,
  orgName,
  currency,
  totalRevenue,
  transactionCount,
  topProducts,
  dailySales,
  lowStockProducts,
  inventoryValue,
}: Props) {
  function downloadPdf() {
    const params = new URLSearchParams({
      storeName,
      orgName,
      currency,
      totalRevenue: String(totalRevenue),
      transactionCount: String(transactionCount),
      topProducts: JSON.stringify(topProducts),
    });
    window.open(`/api/reports/sales/pdf?${params.toString()}`, "_blank");
  }

  function downloadCsv() {
    const rows = [
      ["Product", "Qty Sold", "Revenue"],
      ...topProducts.map((p) => [p.product_name, p.total_qty, p.total_revenue]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Export reports"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={downloadCsv}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={downloadPdf}>
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          }
        />
      </Card>

      {dailySales.length > 0 && (
        <Card>
          <CardHeader title="Daily revenue (30 days)" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Inventory valuation" />
        <p className="text-2xl font-bold text-slate-900">
          {formatCurrency(inventoryValue, currency)}
        </p>
        <p className="text-sm text-slate-500">Total stock value at cost price</p>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader title="Low stock items" />
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <div key={p.sku} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-amber-600">
                  {p.qty} / {p.threshold}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
