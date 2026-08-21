import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { getStoreContext } from "@/lib/helpers/store-context";
import { PricingContainer } from "@/containers/pricing/pricing-container";

export default async function PricingPage() {
  const ctx = await getStoreContext();
  const supabase = await createClient();

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("store_id", ctx?.store.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header title="Pricing" />
      <main className="mx-auto w-full max-w-2xl p-4">
        <PricingContainer promotions={promotions ?? []} />
      </main>
    </>
  );
}
