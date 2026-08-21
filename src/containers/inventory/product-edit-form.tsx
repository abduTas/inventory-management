"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormInput } from "@/lib/validations/auth";
import { updateProductAction } from "@/lib/actions/products";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import type { Product } from "@/types/database";

export function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product.sku,
      name: product.name,
      cost_price: product.cost_price,
      sell_price: product.sell_price,
      reorder_level: product.reorder_level,
      barcode: product.barcode ?? "",
      quantity: 0,
    },
  });

  async function onSubmit(data: ProductFormInput) {
    setError("");
    const result = await updateProductAction(product.id, data);
    if (result.error) setError(result.error);
    else {
      router.push(`/inventory/${product.id}`);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader title="Edit product" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input id="sku" label="SKU" {...register("sku")} />
        <Input id="name" label="Name" {...register("name")} />
        <div className="grid grid-cols-2 gap-3">
          <Input id="cost_price" label="Cost" type="number" step="0.01" {...register("cost_price")} />
          <Input id="sell_price" label="Sell price" type="number" step="0.01" {...register("sell_price")} />
        </div>
        <Input id="reorder_level" label="Alert at (optional)" type="number" {...register("reorder_level")} />
        <Input id="barcode" label="Barcode" {...register("barcode")} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Save changes
        </Button>
      </form>
    </Card>
  );
}
