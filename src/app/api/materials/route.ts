import { NextResponse } from "next/server"
import { materialSchema } from "@/schemas/material"
import { createMaterial, listMaterials } from "@/services/materialService"
import { parseBody } from "@/utils/api"

// GET /api/materials
export async function GET() {
  return NextResponse.json(await listMaterials())
}

// POST /api/materials
export async function POST(request: Request) {
  const { data, errorResponse } = await parseBody(request, materialSchema)
  if (errorResponse) return errorResponse

  const material = await createMaterial(data)
  return NextResponse.json(material, { status: 201 })
}
