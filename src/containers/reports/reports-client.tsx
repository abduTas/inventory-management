"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Download } from "lucide-react";

type Props = {
  storeName: string;
  orgName: string;
  currency: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: Array<{ product_name: string; total_qty: number; total_revenue: number }>;
};

export function ReportsClient({
  storeName,
  orgName,
  currency,
  totalRevenue,
  transactionCount,
  topProducts,
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

  return (
    <Card>
      <CardHeader
        title="Export reports"
        description="Download a structured PDF with KPIs and top products."
        action={
          <Button size="sm" variant="outline" onClick={downloadPdf}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        }
      />
    </Card>
  );
}
