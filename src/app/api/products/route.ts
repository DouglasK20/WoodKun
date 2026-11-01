import { NextResponse } from "next/server"
import { productSchema } from "@/schemas/product"
import { createProduct, listProducts } from "@/services/productService"
import { fieldError, parseBody, withAuth } from "@/utils/api"

// GET /api/products
export const GET = withAuth(async () => {
  return NextResponse.json(await listProducts())
})

// POST /api/products
export const POST = withAuth(async (request: Request) => {
  const { data, errorResponse } = await parseBody(request, productSchema)
  if (errorResponse) return errorResponse

  const product = await createProduct(data)
  if (product === "invalid_materials") return fieldError("materials", "Algum material da lista não existe mais")

  return NextResponse.json(product, { status: 201 })
}, { products: ["write"] })
