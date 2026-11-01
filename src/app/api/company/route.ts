import { NextResponse } from "next/server"
import { companySchema } from "@/schemas/company"
import { getCompany, saveCompany } from "@/services/companyService"
import { parseBody } from "@/utils/api"

// GET /api/company (null enquanto não foi configurada)
export async function GET() {
  return NextResponse.json(await getCompany())
}

// PUT /api/company (cria na primeira vez, atualiza nas próximas)
export async function PUT(request: Request) {
  const { data, errorResponse } = await parseBody(request, companySchema)
  if (errorResponse) return errorResponse

  return NextResponse.json(await saveCompany(data))
}
