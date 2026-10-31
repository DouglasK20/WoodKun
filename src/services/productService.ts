// Acesso ao banco para produtos. Usado pela API; nunca importar em componente client
import { asc, count, eq, getTableColumns, inArray, sql } from "drizzle-orm"
import { db } from "@/db"
import { materials, productMaterials, products } from "@/db/schema"
import type { ProductInput } from "@/schemas/product"
import { isForeignKeyError } from "@/utils/dbErrors"
import { calculateItemsTotal, calculatePrice, roundMoney } from "@/utils/pricing"

// Lista com custo calculado no próprio banco: um LEFT JOIN com os materiais e SUM(quantidade × preço) por produto
export async function listProducts() {
  const rows = await db
    .select({
      ...getTableColumns(products),
      materialsCost: sql<number>`coalesce(sum(${productMaterials.quantity} * ${materials.unitPrice}), 0)`.mapWith(Number),
      materialCount: count(productMaterials.id),
    })
    .from(products)
    .leftJoin(productMaterials, eq(productMaterials.productId, products.id))
    .leftJoin(materials, eq(materials.id, productMaterials.materialId))
    .groupBy(products.id)
    .orderBy(asc(products.name))

  return rows.map((row) => ({
    ...row,
    materialsCost: roundMoney(row.materialsCost),
    price: calculatePrice(row.materialsCost, row.profitMargin),
  }))
}

export async function getProduct(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!product) return undefined

  // Materiais do produto com os dados atuais de cada material (nome, unidade, preço)
  const items = await db
    .select({
      materialId: productMaterials.materialId,
      quantity: productMaterials.quantity,
      name: materials.name,
      measurementUnit: materials.measurementUnit,
      unitPrice: materials.unitPrice,
    })
    .from(productMaterials)
    .innerJoin(materials, eq(materials.id, productMaterials.materialId))
    .where(eq(productMaterials.productId, id))
    .orderBy(asc(productMaterials.id))

  const materialsCost = calculateItemsTotal(items)

  return {
    ...product,
    materials: items,
    materialsCost,
    price: calculatePrice(materialsCost, product.profitMargin),
  }
}

async function hasUnknownMaterials(input: ProductInput) {
  const ids = input.materials.map((item) => item.materialId)
  const found = await db.select({ id: materials.id }).from(materials).where(inArray(materials.id, ids))
  return found.length !== ids.length
}

function toRow(input: ProductInput) {
  return {
    name: input.name,
    description: input.description || null,
    profitMargin: input.profitMargin,
  }
}

function toItemRows(productId: number, input: ProductInput) {
  return input.materials.map((item) => ({ productId, materialId: item.materialId, quantity: item.quantity }))
}

export async function createProduct(input: ProductInput) {
  if (await hasUnknownMaterials(input)) return "invalid_materials" as const

  // Transação: se inserir os materiais falhar, o produto também não é criado
  const id = await db.transaction(async (tx) => {
    const [{ id }] = await tx.insert(products).values(toRow(input)).$returningId()
    await tx.insert(productMaterials).values(toItemRows(id, input))
    return id
  })

  return (await getProduct(id))!
}

export async function updateProduct(id: number, input: ProductInput) {
  if (!(await getProduct(id))) return "not_found" as const
  if (await hasUnknownMaterials(input)) return "invalid_materials" as const

  // Mais simples que comparar item a item: apaga a lista antiga e grava a nova, tudo na mesma transação
  await db.transaction(async (tx) => {
    await tx.update(products).set(toRow(input)).where(eq(products.id, id))
    await tx.delete(productMaterials).where(eq(productMaterials.productId, id))
    await tx.insert(productMaterials).values(toItemRows(id, input))
  })

  return (await getProduct(id))!
}

export async function deleteProduct(id: number): Promise<"deleted" | "not_found" | "in_use"> {
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1)
  if (!product) return "not_found"

  try {
    // Os materiais do produto (product_materials) são apagados junto pelo ON DELETE CASCADE
    await db.delete(products).where(eq(products.id, id))
    return "deleted"
  } catch (error) {
    // O produto está em algum orçamento
    if (isForeignKeyError(error)) return "in_use"
    throw error
  }
}

export type ProductListItem = Awaited<ReturnType<typeof listProducts>>[number]
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>
