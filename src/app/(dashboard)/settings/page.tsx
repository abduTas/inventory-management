"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signOutAction, getUserContext } from "@/lib/actions/auth";
import { updateProfileAction } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    name: string;
    email: string | null;
    phone: string;
    defaultReorderLevel: number;
  } | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    getUserContext().then((ctx) => {
      if (!ctx?.profile) return;
      const org = ctx.membership?.organizations as {
        stores?: { default_reorder_level: number } | { default_reorder_level: number }[];
      } | null;
      const stores = org?.stores;
      const store = Array.isArray(stores) ? stores[0] : stores;
      setProfile({
        name: ctx.profile.name,
        email: ctx.profile.email,
        phone: ctx.profile.phone,
        defaultReorderLevel: store?.default_reorder_level ?? 30,
      });
      reset({
        name: ctx.profile.name,
        email: ctx.profile.email ?? "",
        defaultReorderLevel: store?.default_reorder_level ?? 30,
      });
    });
  }, [reset]);

  async function onSave(data: Record<string, string>) {
    await updateProfileAction({
      name: data.name,
      email: data.email,
      defaultReorderLevel: Number(data.defaultReorderLevel),
    });
    router.refresh();
  }

  return (
    <>
      <Header title="Settings" />
      <main className="mx-auto w-full max-w-lg space-y-4 p-4">
        <PwaInstallPrompt />

        <Card>
          <CardHeader title="Profile" />
          {profile && (
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <Input label="Phone" value={profile.phone} disabled />
              <Input label="Name" {...register("name")} />
              <Input label="Email (optional)" type="email" {...register("email")} />
              <Input
                label="Default low-stock threshold"
                type="number"
                {...register("defaultReorderLevel")}
              />
              <Button type="submit" className="w-full">
                Save changes
              </Button>
            </form>
          )}
        </Card>

        <Card>
          <CardHeader title="Account" />
          <div className="space-y-2">
            <a
              href="/settings/notifications"
              className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Notification preferences
            </a>
            <Button
            variant="danger"
            className="w-full"
            onClick={async () => {
              await signOutAction();
              router.push("/login");
            }}
          >
            Sign out
          </Button>
          </div>
        </Card>
      </main>
    </>
  );
}
