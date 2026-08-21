import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag, Package, BarChart3, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-emerald-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Tag className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">StoreMgr</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Manage your store
          <span className="block text-emerald-600">from anywhere</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          Inventory, pricing, POS selling, reports, and low-stock alerts —
          optimized for mobile and installable as an Android app.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="w-full min-w-[200px] sm:w-auto">
              Get started free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full min-w-[200px] sm:w-auto">
              Log in
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Package, title: "Inventory", desc: "Track stock with low-stock alerts" },
            { icon: BarChart3, title: "Reports", desc: "PDF exports with clean structure" },
            { icon: Bell, title: "Alerts", desc: "Push notifications on your phone" },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
            >
              <Icon className="mb-3 h-8 w-8 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
