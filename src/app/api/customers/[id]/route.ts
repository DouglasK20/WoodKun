import { NextResponse } from "next/server"
import { customerSchema } from "@/schemas/customer"
import { deleteCustomer, getCustomer, updateCustomer } from "@/services/customerService"
import { notFound, parseBody, parseId, withAuth } from "@/utils/api"

type RouteContext = {
  // No Next 15 os params chegam como Promise
  params: Promise<{ id: string }>
}

// GET /api/customers/:id
export const GET = withAuth(async (_request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  const customer = id && (await getCustomer(id))
  if (!customer) return notFound("Cliente não encontrado")

  return NextResponse.json(customer)
})

// PUT /api/customers/:id
export const PUT = withAuth(async (request: Request, { params }: RouteContext) => {
  const id = parseId((await params).id)
  if (!id) return notFound("Cliente não encontrado")

  const { data, errorResponse } = await parseBody(request, customerSchema)
  if (errorResponse) return errorResponse

  const customer = await updateCustomer(id, data)
  if (!customer) return notFound("Cliente não encontrado")

  return NextResponse.json(customer)
}, { customers: ["write"] })

// DELETE /api/customers/:id
export const DELETE = withAuth(async (_request: Request, { params }: RouteContext) => {
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
}, { customers: ["write"] })
