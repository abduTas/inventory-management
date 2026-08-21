"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { voidSale } from "@/lib/services/sales";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function VoidSaleButton({
  saleId,
  status,
}: {
  saleId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "voided") {
    return <Badge variant="danger">Voided</Badge>;
  }

  async function handleVoid() {
    if (!confirm("Void this sale and restock items?")) return;
    setLoading(true);
    setError("");
    try {
      await voidSale(saleId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to void");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="danger" size="sm" onClick={handleVoid} loading={loading}>
        Void sale
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
