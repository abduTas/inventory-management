"use client";

import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        await markNotificationRead(id);
        router.refresh();
      }}
    >
      Mark read
    </Button>
  );
}
