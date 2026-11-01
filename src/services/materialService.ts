// Acesso ao banco para materiais. Usado pela API e pelos server components; nunca importar em componente client
import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { materials, type Material } from "@/db/schema"
import type { MaterialInput } from "@/schemas/material"
import { isForeignKeyError } from "@/utils/dbErrors"
import { deleteImage } from "./uploadService"

function toRow(input: MaterialInput) {
  return { ...input, description: input.description || null, imageUrl: input.imageUrl || null }
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
  const existing = await getMaterial(id)
  if (!existing) return undefined

  await db.update(materials).set(toRow(input)).where(eq(materials.id, id))
  // Trocou ou removeu a imagem: o arquivo antigo não é mais usado
  if (existing.imageUrl !== (input.imageUrl || null)) await deleteImage(existing.imageUrl)
  return getMaterial(id)
}

export async function deleteMaterial(id: number): Promise<"deleted" | "not_found" | "in_use"> {
  const existing = await getMaterial(id)
  if (!existing) return "not_found"

  try {
    await db.delete(materials).where(eq(materials.id, id))
    await deleteImage(existing.imageUrl)
    return "deleted"
  } catch (error) {
    // O material está em algum produto ou orçamento
    if (isForeignKeyError(error)) return "in_use"
    throw error
  }
}
