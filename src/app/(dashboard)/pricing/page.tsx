import { Header } from "@/components/layout/header";
import { Card, CardHeader } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <>
      <Header title="Pricing" />
      <main className="mx-auto w-full max-w-6xl p-4">
        <Card>
          <CardHeader
            title="Pricing & promotions"
            description="Set sell prices on each product. Promotions coming soon."
          />
          <p className="text-sm text-slate-500">
            Edit product prices from the Inventory section. Bulk price updates and
            promotions will be added in a future update.
          </p>
        </Card>
      </main>
    </>
  );
}
