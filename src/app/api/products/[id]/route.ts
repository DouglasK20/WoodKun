import { NextResponse } from "next/server"
import { productSchema } from "@/schemas/product"
import { deleteProduct, getProduct, updateProduct } from "@/services/productService"
import { fieldError, notFound, parseBody, parseId, withAuth } from "@/utils/api"

type RouteContext = {
  // No Next 15 os params chegam como Promise
  params: Promise<{ id: string }>
}

// GET /api/products/:id
export const GET = withAuth(async (_request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  const product = id && (await getProduct(id))
  if (!product) return notFound("Produto não encontrado")

  return NextResponse.json(product)
})

// PUT /api/products/:id
export const PUT = withAuth(async (request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  if (!id) return notFound("Produto não encontrado")

  const { data, errorResponse } = await parseBody(request, productSchema)
  if (errorResponse) return errorResponse

  const product = await updateProduct(id, data)
  if (product === "not_found") return notFound("Produto não encontrado")
  if (product === "invalid_materials") return fieldError("materials", "Algum material da lista não existe mais")

  return NextResponse.json(product)
}, { products: ["write"] })

// DELETE /api/products/:id
export const DELETE = withAuth(async (_request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  if (!id) return notFound("Produto não encontrado")

  const result = await deleteProduct(id)
  if (result === "not_found") return notFound("Produto não encontrado")
  if (result === "in_use") {
    return NextResponse.json(
      { error: "Este produto está em um orçamento e não pode ser excluído." },
      { status: 409 }
    )
  }

  return new NextResponse(null, { status: 204 })
}, { products: ["write"] })
