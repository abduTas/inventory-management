"use server";

import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";
import type { Product, Store } from "@/types/database";
import { getEffectiveThreshold, getStockQty } from "@/types/database";

export async function checkAndSendLowStockAlert(
  product: Product,
  store: Store,
  userId: string
) {
  const qty = getStockQty(product);
  const threshold = getEffectiveThreshold(product, store.default_reorder_level);

  if (qty > threshold) return;
  if (product.last_alerted_at) {
    const lastAlert = new Date(product.last_alerted_at);
    const hoursSince = (Date.now() - lastAlert.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) return;
  }

  const supabase = await createClient();
  const title = "Low stock alert";
  const body = `${product.name} (${product.sku}) — ${qty} units left (threshold: ${threshold})`;

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "LOW_STOCK",
    title,
    body,
    metadata: { product_id: product.id, quantity: qty, threshold },
  });

  await supabase
    .from("products")
    .update({ last_alerted_at: new Date().toISOString() })
    .eq("id", product.id);

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;

  if (vapidPublic && vapidPrivate && vapidSubject && subs?.length) {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    const payload = JSON.stringify({ title, body, url: "/inventory" });

    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          payload
        )
      )
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_chat_id")
    .eq("id", userId)
    .single();

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken && profile?.telegram_chat_id) {
    await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: profile.telegram_chat_id,
          text: `🔔 ${body}`,
        }),
      }
    );
  }
}
