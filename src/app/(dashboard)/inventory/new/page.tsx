"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormInput } from "@/lib/validations/auth";
import { createProductAction } from "@/lib/actions/products";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
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
    router.push("/inventory");
    router.refresh();
  }

  return (
    <>
      <Header title="Add product" />
      <main className="mx-auto w-full max-w-lg p-4">
        <Card>
          <CardHeader title="Product details" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="sku" label="SKU *" {...register("sku")} />
            <Input id="name" label="Name *" {...register("name")} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="cost_price" label="Cost" type="number" step="0.01" {...register("cost_price")} />
              <Input id="sell_price" label="Sell price" type="number" step="0.01" {...register("sell_price")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input id="quantity" label="Stock qty" type="number" {...register("quantity")} />
              <Input id="reorder_level" label="Alert at (opt.)" type="number" placeholder="30" {...register("reorder_level")} />
            </div>
            <Input id="barcode" label="Barcode" {...register("barcode")} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Save product
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
