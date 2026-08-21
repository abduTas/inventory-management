"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";
import { getUserContext } from "@/lib/actions/auth";
import { updateNotificationPreferences } from "@/lib/actions/notification-settings";
import { useRouter } from "next/navigation";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [botUsername, setBotUsername] = useState("");

  useEffect(() => {
    getUserContext().then((ctx) => {
      if (!ctx?.user) return;
      setUserId(ctx.user.id);
      setPushEnabled(ctx.profile?.push_alerts_enabled ?? true);
      setTelegramLinked(!!ctx.profile?.telegram_chat_id);
    });
    // Bot username would be configured in env; use placeholder
    setBotUsername(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "");
  }, []);

  async function togglePush(enabled: boolean) {
    setPushEnabled(enabled);
    await updateNotificationPreferences({ push_alerts_enabled: enabled });
    router.refresh();
  }

  const telegramLink = botUsername
    ? `https://t.me/${botUsername}?start=${userId}`
    : null;

  return (
    <>
      <Header title="Notifications" />
      <main className="mx-auto w-full max-w-lg space-y-4 p-4">
        <PwaInstallPrompt />

        <Card>
          <CardHeader title="Push notifications" description="Alerts on your phone via PWA" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Enable push alerts</span>
            <Button
              size="sm"
              variant={pushEnabled ? "primary" : "outline"}
              onClick={() => togglePush(!pushEnabled)}
            >
              {pushEnabled ? "On" : "Off"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Telegram alerts"
            description="Optional free mobile alerts via Telegram bot"
          />
          {telegramLinked ? (
            <p className="text-sm text-emerald-600">✓ Telegram connected</p>
          ) : telegramLink ? (
            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">Connect Telegram</Button>
            </a>
          ) : (
            <p className="text-sm text-slate-500">
              Set TELEGRAM_BOT_TOKEN and NEXT_PUBLIC_TELEGRAM_BOT_USERNAME in env to enable.
            </p>
          )}
        </Card>
      </main>
    </>
  );
}
