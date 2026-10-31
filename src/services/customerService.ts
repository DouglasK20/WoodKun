// Acesso ao banco para clientes. Usado pela API; nunca importar em componente client
import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { customers, type Customer } from "@/db/schema"
import type { CustomerInput } from "@/schemas/customer"
import { isForeignKeyError } from "@/utils/dbErrors"

// Campos opcionais vazios ("") viram null no banco
function toRow(input: CustomerInput) {
  return {
    name: input.name,
    phone: input.phone || null,
    email: input.email || null,
    document: input.document || null,
    zipCode: input.zipCode || null,
    street: input.street || null,
    number: input.number || null,
    complement: input.complement || null,
    neighborhood: input.neighborhood || null,
    city: input.city || null,
    state: input.state || null,
    notes: input.notes || null,
  }
}

export async function listCustomers() {
  return db.select().from(customers).orderBy(asc(customers.name))
}

export async function getCustomer(id: number): Promise<Customer | undefined> {
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  return customer
}

export async function createCustomer(input: CustomerInput) {
  const [{ id }] = await db.insert(customers).values(toRow(input)).$returningId()
  return (await getCustomer(id))!
}

export async function updateCustomer(id: number, input: CustomerInput) {
  if (!(await getCustomer(id))) return undefined

  await db.update(customers).set(toRow(input)).where(eq(customers.id, id))
  return getCustomer(id)
}

export async function deleteCustomer(id: number): Promise<"deleted" | "not_found" | "in_use"> {
  if (!(await getCustomer(id))) return "not_found"

  try {
    await db.delete(customers).where(eq(customers.id, id))
    return "deleted"
  } catch (error) {
    // O cliente tem orçamentos
    if (isForeignKeyError(error)) return "in_use"
    throw error
  }
}
