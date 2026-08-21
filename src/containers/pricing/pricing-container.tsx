"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createPromotionAction,
  bulkPriceUpdateAction,
  togglePromotionAction,
} from "@/lib/actions/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const promoSchema = z.object({
  name: z.string().min(1, "Name required"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(0.01),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});

type PromoInput = z.infer<typeof promoSchema>;

type Promotion = {
  id: string;
  name: string;
  discount_type: string;
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export function PricingContainer({
  promotions,
}: {
  promotions: Promotion[];
}) {
  const router = useRouter();
  const [bulkPercent, setBulkPercent] = useState("5");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PromoInput>({
    resolver: zodResolver(promoSchema),
    defaultValues: { discount_type: "percentage" },
  });

  async function onCreatePromo(data: PromoInput) {
    setError("");
    const result = await createPromotionAction(data);
    if (result.error) setError(result.error);
    else {
      reset();
      router.refresh();
    }
  }

  async function onBulkUpdate() {
    setError("");
    setSuccess("");
    const result = await bulkPriceUpdateAction(Number(bulkPercent));
    if (result.error) setError(result.error);
    else {
      setSuccess(`Updated ${result.updated} product prices`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Bulk price update" description="Adjust all product sell prices by a percentage" />
        <div className="flex gap-2">
          <Input
            type="number"
            value={bulkPercent}
            onChange={(e) => setBulkPercent(e.target.value)}
            placeholder="5"
            className="w-24"
          />
          <span className="flex items-center text-sm text-slate-500">%</span>
          <Button onClick={onBulkUpdate}>Apply to all products</Button>
        </div>
        {success && <p className="mt-2 text-sm text-emerald-600">{success}</p>}
      </Card>

      <Card>
        <CardHeader title="Create promotion" />
        <form onSubmit={handleSubmit(onCreatePromo)} className="space-y-3">
          <Input label="Name" placeholder="Summer Sale" {...register("name")} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <select
                className="h-12 w-full rounded-xl border border-slate-300 px-3"
                {...register("discount_type")}
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
              </select>
            </div>
            <Input label="Value" type="number" step="0.01" {...register("discount_value")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Starts (optional)" type="date" {...register("starts_at")} />
            <Input label="Ends (optional)" type="date" {...register("ends_at")} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={isSubmitting}>
            Create promotion
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Active promotions" />
        {!promotions.length ? (
          <p className="text-sm text-slate-500">No promotions yet.</p>
        ) : (
          <div className="space-y-3">
            {promotions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={p.is_active ? "success" : "default"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {p.discount_type === "percentage"
                      ? `${p.discount_value}% off`
                      : `₹${p.discount_value} off`}
                    {p.ends_at && ` · until ${formatDate(p.ends_at)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await togglePromotionAction(p.id, !p.is_active);
                    router.refresh();
                  }}
                >
                  {p.is_active ? "Disable" : "Enable"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
