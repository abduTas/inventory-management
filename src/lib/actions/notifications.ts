"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
}

export async function updateProfileAction(data: {
  name?: string;
  email?: string;
  defaultReorderLevel?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (data.name !== undefined || data.email !== undefined) {
    await supabase
      .from("profiles")
      .update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
      })
      .eq("id", user.id);
  }

  if (data.defaultReorderLevel !== undefined) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("org_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      await supabase
        .from("stores")
        .update({ default_reorder_level: data.defaultReorderLevel })
        .eq("org_id", membership.org_id);
    }
  }

  return { success: true };
}
