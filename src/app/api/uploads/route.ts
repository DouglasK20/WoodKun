import { NextResponse } from "next/server"
import { saveImage } from "@/services/uploadService"
import { fieldError } from "@/utils/api"

// POST /api/uploads (multipart/form-data, campo "file")
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  if (!(file instanceof File)) return fieldError("file", "Nenhuma imagem enviada")

  const result = await saveImage(file)
  if ("error" in result) return fieldError("file", result.error)

  return NextResponse.json(result, { status: 201 })
}
