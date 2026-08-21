"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function Header({ title }: { title: string }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null);
      setUnread(count ?? 0);
    }
    load();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <Link
        href="/notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100"
      >
        <Bell className="h-5 w-5 text-slate-700" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
