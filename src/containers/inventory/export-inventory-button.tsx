"use client";

import { exportInventoryCsv } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportInventoryButton() {
  async function handleExport() {
    const result = await exportInventoryCsv();
    if (result.error || !result.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
