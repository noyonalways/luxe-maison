import StorefrontLayout from "@/components/StorefrontLayout";
import ProductPage from "@/views/ProductPage";

export default async function Product({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <StorefrontLayout>
      <ProductPage id={id} />
    </StorefrontLayout>
  );
}
