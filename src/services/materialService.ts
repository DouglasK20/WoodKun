// Acesso ao banco para materiais. Usado pela API e pelos server components; nunca importar em componente client
import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { materials, type Material } from "@/db/schema"
import type { MaterialInput } from "@/schemas/material"
import { isForeignKeyError } from "@/utils/dbErrors"

function toRow(input: MaterialInput) {
  return { ...input, description: input.description || null }
}

export async function listMaterials() {
  return db.select().from(materials).orderBy(asc(materials.name))
}

export async function getMaterial(id: number): Promise<Material | undefined> {
  const [material] = await db.select().from(materials).where(eq(materials.id, id)).limit(1)
  return material
}

export async function createMaterial(input: MaterialInput) {
  // $returningId: o MySQL não tem RETURNING, então o Drizzle devolve só o id gerado
  const [{ id }] = await db.insert(materials).values(toRow(input)).$returningId()
  return (await getMaterial(id))!
}

export async function updateMaterial(id: number, input: MaterialInput) {
  if (!(await getMaterial(id))) return undefined

  await db.update(materials).set(toRow(input)).where(eq(materials.id, id))
  return getMaterial(id)
}

export async function deleteMaterial(id: number): Promise<"deleted" | "not_found" | "in_use"> {
  if (!(await getMaterial(id))) return "not_found"

  try {
    await db.delete(materials).where(eq(materials.id, id))
    return "deleted"
  } catch (error) {
    // O material está em algum produto ou orçamento
    if (isForeignKeyError(error)) return "in_use"
    throw error
  }
}
