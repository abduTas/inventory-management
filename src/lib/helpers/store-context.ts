import { createClient } from "@/lib/supabase/server";

export type StoreContext = {
  store: {
    id: string;
    name: string;
    default_reorder_level: number;
    tax_rate: number;
  };
  org: {
    id: string;
    name: string;
    currency: string;
    onboarding_completed: boolean;
  };
};

type OrgWithStores = StoreContext["org"] & {
  stores: StoreContext["store"][] | StoreContext["store"];
};

export async function getStoreContext(): Promise<StoreContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select(
      "org_id, organizations(id, name, currency, onboarding_completed, stores(id, name, default_reorder_level, tax_rate))"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership?.organizations) return null;

  const raw = membership.organizations;
  const org = (Array.isArray(raw) ? raw[0] : raw) as OrgWithStores | undefined;
  if (!org) return null;

  const stores = Array.isArray(org.stores) ? org.stores : org.stores ? [org.stores] : [];
  const store = stores[0];
  if (!store) return null;

  return {
    org: {
      id: org.id,
      name: org.name,
      currency: org.currency,
      onboarding_completed: org.onboarding_completed,
    },
    store,
  };
}
