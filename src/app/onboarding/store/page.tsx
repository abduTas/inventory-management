"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeSetupSchema, type StoreSetupFormInput } from "@/lib/validations/auth";
import { completeOnboardingAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { useState } from "react";

export default function OnboardingStorePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<StoreSetupFormInput>({
    resolver: zodResolver(storeSetupSchema),
    defaultValues: {
      currency: "INR",
      timezone: "Asia/Kolkata",
      defaultReorderLevel: 30,
    },
  });

  async function onSubmit(data: StoreSetupFormInput) {
    setError("");
    const result = await completeOnboardingAction(data);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/onboarding/products");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-600">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Set up your store</h1>
      </div>

      <Card>
        <CardHeader
          title="Store details"
          description="You can change these later in settings."
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="businessName"
            label="Business name"
            placeholder="My Store Pvt Ltd"
            {...register("businessName")}
          />
          <Input
            id="storeName"
            label="Store name"
            placeholder="Main Store"
            {...register("storeName")}
          />
          <Input
            id="defaultReorderLevel"
            label="Default low-stock threshold"
            type="number"
            placeholder="30"
            {...register("defaultReorderLevel")}
          />
          <input type="hidden" {...register("currency")} />
          <input type="hidden" {...register("timezone")} />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
