"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;
    // @ts-expect-error beforeinstallprompt event
    await deferredPrompt.prompt();
    setShowInstall(false);
    setDeferredPrompt(null);
  }

  async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const json = sub.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth_key: json.keys?.auth,
      }),
    });
    setPushEnabled(true);
  }

  if (!showInstall && pushEnabled) return null;

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <p className="mb-3 text-sm text-emerald-900">
        Install this app on your phone for quick access and stock alerts.
      </p>
      <div className="flex flex-wrap gap-2">
        {showInstall && (
          <Button size="sm" onClick={installApp}>
            Install App
          </Button>
        )}
        {!pushEnabled && (
          <Button size="sm" variant="outline" onClick={enablePush}>
            Enable Alerts
          </Button>
        )}
      </div>
    </Card>
  );
}
