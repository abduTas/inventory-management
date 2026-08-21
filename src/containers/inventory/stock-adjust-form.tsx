"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStockAction } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StockAdjustForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function adjust(delta: number) {
    setLoading(true);
    setError("");
    const result = await updateStockAction(productId, delta, notes || undefined);
    if (result.error) setError(result.error);
    else {
      setQty("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <Input
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Received shipment..."
      />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => adjust(-1)} disabled={loading}>
          -1
        </Button>
        <Button variant="outline" onClick={() => adjust(1)} disabled={loading}>
          +1
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Custom +/- qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <Button
          disabled={loading || !qty}
          onClick={() => adjust(Number(qty))}
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
