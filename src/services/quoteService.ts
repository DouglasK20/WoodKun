// Acesso ao banco para orçamentos. Usado pela API; nunca importar em componente client
import { asc, count, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm"
import { db } from "@/db"
import { customers, materials, products, quoteItems, quotes, quoteStatusHistory } from "@/db/schema"
import type { QuoteInput } from "@/schemas/quote"
import { calculateItemsTotal, calculateQuoteTotal, roundMoney } from "@/utils/pricing"

// Lista com nome do cliente e subtotal calculado no banco (SUM dos itens), mais recentes primeiro
// Quem está fazendo a alteração (vai para o histórico de status)
export type Actor = { id: string; name: string }

// Data da última vez que o orçamento entrou no status (subconsulta no histórico). null se nunca entrou
const lastTimeIn = (status: "approved" | "rejected" | "sent") =>
  sql<Date | null>`(select max(${quoteStatusHistory.changedAt}) from ${quoteStatusHistory} where ${quoteStatusHistory.quoteId} = ${quotes.id} and ${quoteStatusHistory.status} = ${status})`.mapWith(
    (value) => (value ? new Date(value) : null)
  )

export async function listQuotes() {
  const rows = await db
    .select({
      ...getTableColumns(quotes),
      customerName: customers.name,
      subtotal: sql<number>`coalesce(sum(${quoteItems.quantity} * ${quoteItems.unitPrice}), 0)`.mapWith(Number),
      itemCount: count(quoteItems.id),
      // Datas reais vindas do histórico (o painel usa para "aprovado no mês" e taxa de aprovação)
      approvedAt: lastTimeIn("approved"),
      rejectedAt: lastTimeIn("rejected"),
    })
    .from(quotes)
    .innerJoin(customers, eq(customers.id, quotes.customerId))
    .leftJoin(quoteItems, eq(quoteItems.quoteId, quotes.id))
    .groupBy(quotes.id, customers.id)
    .orderBy(desc(quotes.createdAt), desc(quotes.id))

  return rows.map((row) => ({
    ...row,
    subtotal: roundMoney(row.subtotal),
    total: calculateQuoteTotal(row.subtotal, row.discount),
  }))
}

export async function getQuote(id: number) {
  const [quote] = await db
    .select({ ...getTableColumns(quotes), customerName: customers.name })
    .from(quotes)
    .innerJoin(customers, eq(customers.id, quotes.customerId))
    .where(eq(quotes.id, id))
    .limit(1)
  if (!quote) return undefined

  const items = await db
    .select({
      type: quoteItems.type,
      materialId: quoteItems.materialId,
      productId: quoteItems.productId,
      description: quoteItems.description,
      measurementUnit: quoteItems.measurementUnit,
      quantity: quoteItems.quantity,
      unitPrice: quoteItems.unitPrice,
    })
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id))
    .orderBy(asc(quoteItems.id))

  const subtotal = calculateItemsTotal(items)

  // Linha do tempo dos status, do mais antigo para o mais recente
  const history = await db
    .select({
      status: quoteStatusHistory.status,
      changedAt: quoteStatusHistory.changedAt,
      changedByName: quoteStatusHistory.changedByName,
    })
    .from(quoteStatusHistory)
    .where(eq(quoteStatusHistory.quoteId, id))
    .orderBy(asc(quoteStatusHistory.changedAt), asc(quoteStatusHistory.id))

  return { ...quote, items, history, subtotal, total: calculateQuoteTotal(subtotal, quote.discount) }
}

// Confere se cliente, materiais e produtos referenciados existem. Devolve o campo com problema (ou null)
async function findInvalidReference(input: QuoteInput): Promise<"customerId" | "items" | null> {
  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, input.customerId))
  if (!customer) return "customerId"

  const materialIds = [...new Set(input.items.flatMap((item) => (item.materialId ? [item.materialId] : [])))]
  const productIds = [...new Set(input.items.flatMap((item) => (item.productId ? [item.productId] : [])))]

  if (materialIds.length) {
    const found = await db.select({ id: materials.id }).from(materials).where(inArray(materials.id, materialIds))
    if (found.length !== materialIds.length) return "items"
  }
  if (productIds.length) {
    const found = await db.select({ id: products.id }).from(products).where(inArray(products.id, productIds))
    if (found.length !== productIds.length) return "items"
  }
  return null
}

function toRow(input: QuoteInput) {
  return {
    customerId: input.customerId,
    title: input.title,
    status: input.status,
    discount: input.discount,
    validUntil: input.validUntil || null,
    notes: input.notes || null,
    paymentTerms: input.paymentTerms || null,
    deliveryTerms: input.deliveryTerms || null,
  }
}

function toItemRows(quoteId: number, input: QuoteInput) {
  return input.items.map((item) => ({
    quoteId,
    type: item.type,
    // Garante que só o id do tipo certo é salvo
    materialId: item.type === "MATERIAL" ? item.materialId : null,
    productId: item.type === "PRODUCT" ? item.productId : null,
    description: item.description,
    measurementUnit: item.measurementUnit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }))
}

function historyRow(quoteId: number, status: QuoteInput["status"], actor: Actor) {
  return { quoteId, status, changedBy: actor.id, changedByName: actor.name }
}

export async function createQuote(input: QuoteInput, actor: Actor) {
  const invalidField = await findInvalidReference(input)
  if (invalidField) return { invalidField }

  // Transação: orçamento e itens são salvos juntos, ou nada é salvo
  const id = await db.transaction(async (tx) => {
    const [{ id }] = await tx.insert(quotes).values(toRow(input)).$returningId()
    await tx.insert(quoteItems).values(toItemRows(id, input))
    // Primeiro registro do histórico: o status com que o orçamento nasceu
    await tx.insert(quoteStatusHistory).values(historyRow(id, input.status, actor))
    return id
  })

  return { quote: (await getQuote(id))! }
}

export async function updateQuote(id: number, input: QuoteInput, actor: Actor) {
  const [existing] = await db.select({ id: quotes.id, status: quotes.status }).from(quotes).where(eq(quotes.id, id))
  if (!existing) return { notFound: true as const }

  const invalidField = await findInvalidReference(input)
  if (invalidField) return { invalidField }

  // Apaga os itens antigos e grava os novos, tudo na mesma transação
  await db.transaction(async (tx) => {
    await tx.update(quotes).set(toRow(input)).where(eq(quotes.id, id))
    await tx.delete(quoteItems).where(eq(quoteItems.quoteId, id))
    await tx.insert(quoteItems).values(toItemRows(id, input))
    // Só registra no histórico quando o status realmente muda (editar itens ou título não conta)
    if (existing.status !== input.status) await tx.insert(quoteStatusHistory).values(historyRow(id, input.status, actor))
  })

  return { quote: (await getQuote(id))! }
}

export async function deleteQuote(id: number): Promise<"deleted" | "not_found"> {
  const [existing] = await db.select({ id: quotes.id }).from(quotes).where(eq(quotes.id, id))
  if (!existing) return "not_found"

  // Os itens (quote_items) são apagados junto pelo ON DELETE CASCADE
  await db.delete(quotes).where(eq(quotes.id, id))
  return "deleted"
}

export type QuoteListItem = Awaited<ReturnType<typeof listQuotes>>[number]
export type QuoteDetail = NonNullable<Awaited<ReturnType<typeof getQuote>>>
