import { notFound } from "next/navigation"
import { ProductForm } from "../_components/ProductForm"
import { Can, NoPermission } from "@/components/providers/UserProvider"

type ProductFormPageProps = {
  // No Next 15 os searchParams chegam como Promise
  searchParams: Promise<{ id?: string }>
}

export default async function ProductFormPage({ searchParams }: ProductFormPageProps) {
  const { id } = await searchParams

  const productId = id ? Number(id) : undefined
  if (productId !== undefined && !Number.isInteger(productId)) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{productId ? "Editar produto" : "Novo produto"}</h1>
      <Can permission={{ products: ["write"] }} fallback={<NoPermission message="Você não tem permissão para editar produtos." />}>
        <ProductForm productId={productId} />
      </Can>
    </div>
  )
}
