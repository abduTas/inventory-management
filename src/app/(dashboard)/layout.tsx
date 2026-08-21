import { DesktopNav, MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <DesktopNav />
      <div className="flex min-h-dvh flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
