"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormInput } from "@/lib/validations/auth";
import { createProductAction } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";

export default function OnboardingProductsPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [added, setAdded] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { quantity: 0, cost_price: 0, sell_price: 0 },
  });

  async function onSubmit(data: ProductFormInput) {
    setError("");
    const result = await createProductAction(data);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAdded((n) => n + 1);
    reset({ quantity: 0, cost_price: 0, sell_price: 0, sku: "", name: "" });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Step 2 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Add your first products</h1>
        <p className="mt-1 text-sm text-slate-500">
          {added > 0 ? `${added} product(s) added.` : "Add at least one product or skip."}
        </p>
      </div>

      <div className="mb-4">
        <PwaInstallPrompt />
      </div>

      <Card>
        <CardHeader title="New product" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="sku" label="SKU" placeholder="SKU-001" {...register("sku")} />
          <Input id="name" label="Product name" placeholder="Widget A" {...register("name")} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="cost_price"
              label="Cost price"
              type="number"
              step="0.01"
              {...register("cost_price")}
            />
            <Input
              id="sell_price"
              label="Sell price"
              type="number"
              step="0.01"
              {...register("sell_price")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="quantity"
              label="Initial stock"
              type="number"
              {...register("quantity")}
            />
            <Input
              id="reorder_level"
              label="Alert at (optional)"
              type="number"
              placeholder="30"
              {...register("reorder_level")}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" className="w-full" variant="outline" loading={isSubmitting}>
            Add product
          </Button>
        </form>
      </Card>

      <Button
        className="mt-4 w-full"
        onClick={() => {
          router.push("/dashboard");
          router.refresh();
        }}
      >
        {added > 0 ? "Go to dashboard" : "Skip for now"}
      </Button>
    </div>
  );
}
