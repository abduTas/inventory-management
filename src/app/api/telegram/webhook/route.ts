import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ ok: true });
  }

  const body = await request.json();
  const message = body.message;

  if (!message?.text || !message.from) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const text = message.text as string;

  // User sends /start <user_id> to link their account
  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const userId = parts[1];

    if (userId) {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ telegram_chat_id: chatId })
        .eq("id", userId);

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ StoreMgr alerts connected! You'll receive low-stock notifications here.",
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Open StoreMgr Settings → Notifications and tap Connect Telegram to link your account.",
        }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
