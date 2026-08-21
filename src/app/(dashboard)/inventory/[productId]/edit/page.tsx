import { createClient } from "@/lib/supabase/server";
import { getStoreContext } from "@/lib/helpers/store-context";
import { Header } from "@/components/layout/header";
import { ProductEditForm } from "@/containers/inventory/product-edit-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, inventory_levels(quantity_on_hand)")
    .eq("id", productId)
    .single();

  if (!product) notFound();

  return (
    <>
      <Header title="Edit product" />
      <main className="mx-auto w-full max-w-lg p-4">
        <ProductEditForm product={product} />
      </main>
    </>
  );
}
