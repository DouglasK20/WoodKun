import { notFound } from "next/navigation"
import { ProductForm } from "../_components/ProductForm"

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
      <ProductForm productId={productId} />
    </div>
  )
}
