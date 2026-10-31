import { NextResponse } from "next/server"
import { productSchema } from "@/schemas/product"
import { createProduct, listProducts } from "@/services/productService"
import { fieldError, parseBody } from "@/utils/api"

// GET /api/products
export async function GET() {
  return NextResponse.json(await listProducts())
}

// POST /api/products
export async function POST(request: Request) {
  const { data, errorResponse } = await parseBody(request, productSchema)
  if (errorResponse) return errorResponse

  const product = await createProduct(data)
  if (product === "invalid_materials") return fieldError("materials", "Algum material da lista não existe mais")

  return NextResponse.json(product, { status: 201 })
}
