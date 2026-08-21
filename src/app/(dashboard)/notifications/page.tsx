import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MarkReadButton } from "@/containers/notifications/mark-read-button";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <Header title="Alerts" />
      <main className="mx-auto w-full max-w-2xl space-y-3 p-4">
        {!notifications?.length ? (
          <Card className="text-center text-slate-500">
            No notifications yet. You&apos;ll get alerts when stock runs low.
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className={!n.read_at ? "border-emerald-200 bg-emerald-50/50" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(n.created_at)}</p>
                </div>
                {!n.read_at && <MarkReadButton id={n.id} />}
              </div>
            </Card>
          ))
        )}
      </main>
    </>
  );
}
