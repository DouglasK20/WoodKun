import { NextResponse } from "next/server"
import { customerSchema } from "@/schemas/customer"
import { deleteCustomer, getCustomer, updateCustomer } from "@/services/customerService"
import { notFound, parseBody, parseId } from "@/utils/api"

type RouteContext = {
  // No Next 15 os params chegam como Promise
  params: Promise<{ id: string }>
}

// GET /api/customers/:id
export async function GET(_request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  const customer = id && (await getCustomer(id))
  if (!customer) return notFound("Cliente não encontrado")

  return NextResponse.json(customer)
}

// PUT /api/customers/:id
export async function PUT(request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  if (!id) return notFound("Cliente não encontrado")

  const { data, errorResponse } = await parseBody(request, customerSchema)
  if (errorResponse) return errorResponse

  const customer = await updateCustomer(id, data)
  if (!customer) return notFound("Cliente não encontrado")

  return NextResponse.json(customer)
}

// DELETE /api/customers/:id
export async function DELETE(_request: Request, { params }: RouteContext) {
  const id = parseId((await params).id)
  if (!id) return notFound("Cliente não encontrado")

  const result = await deleteCustomer(id)
  if (result === "not_found") return notFound("Cliente não encontrado")
  if (result === "in_use") {
    return NextResponse.json(
      { error: "Este cliente possui orçamentos e não pode ser excluído." },
      { status: 409 }
    )
  }

  return new NextResponse(null, { status: 204 })
}
