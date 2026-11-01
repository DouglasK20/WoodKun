// Indicadores do painel do Início, calculados a partir dos orçamentos. Usado pela API; nunca importar em componente client
import { differenceInCalendarDays, format, parseISO, startOfDay, startOfMonth, subDays, subMonths } from "date-fns"
import { roundMoney } from "@/utils/pricing"
import { listQuotes, type QuoteListItem } from "./quoteService"

const MONTHS_IN_CHART = 6
const EXPIRING_WINDOW_DAYS = 7
const APPROVAL_RATE_WINDOW_DAYS = 90

// "2026-11": chave do mês, usada para agrupar e comparar
const monthKey = (date: Date) => format(date, "yyyy-MM")

function summarize(quotes: QuoteListItem[]) {
  return { total: roundMoney(quotes.reduce((sum, quote) => sum + quote.total, 0)), count: quotes.length }
}

// Obs.: o sistema não guarda a data em que o status mudou. "Aprovado no mês" = criado no mês e hoje aprovado
export async function getDashboard(now = new Date()) {
  const quotes = await listQuotes()
  const createdIn = (key: string) => quotes.filter((quote) => monthKey(quote.createdAt) === key)
  const approvedOf = (list: QuoteListItem[]) => list.filter((quote) => quote.status === "approved")

  const currentMonth = monthKey(now)
  const previousMonth = monthKey(subMonths(now, 1))
  const current = createdIn(currentMonth)
  // Mesmo período do mês anterior (ex.: dia 1 a 10 de outubro, se hoje é 10 de novembro):
  // comparar o mês em andamento com o mês anterior inteiro faria todo começo de mês parecer queda
  const sameMomentLastMonth = subMonths(now, 1)
  const previous = createdIn(previousMonth).filter((quote) => quote.createdAt <= sameMomentLastMonth)

  // Últimos 6 meses, do mais antigo para o atual (meses sem orçamento entram com zero)
  const monthly = Array.from({ length: MONTHS_IN_CHART }, (_, index) => {
    const key = monthKey(subMonths(startOfMonth(now), MONTHS_IN_CHART - 1 - index))
    const list = createdIn(key)
    return { month: key, quoted: summarize(list).total, approved: summarize(approvedOf(list)).total, count: list.length }
  })

  // Taxa de aprovação: entre os decididos (aprovados + recusados) dos últimos 90 dias
  const since = subDays(now, APPROVAL_RATE_WINDOW_DAYS)
  const decided = quotes.filter((quote) => quote.createdAt >= since && (quote.status === "approved" || quote.status === "rejected"))
  const approvedDecided = decided.filter((quote) => quote.status === "approved").length

  // Enviados esperando resposta, e os que vencem nos próximos 7 dias (ou já venceram)
  const awaiting = quotes.filter((quote) => quote.status === "sent")
  const today = startOfDay(now)
  const expiring = awaiting
    .filter((quote) => quote.validUntil)
    .map((quote) => ({
      id: quote.id,
      title: quote.title,
      customerName: quote.customerName,
      validUntil: quote.validUntil!,
      total: quote.total,
      // Negativo = já venceu
      daysLeft: differenceInCalendarDays(parseISO(quote.validUntil!), today),
    }))
    .filter((quote) => quote.daysLeft <= EXPIRING_WINDOW_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return {
    currentMonth,
    previousMonth,
    quoted: { ...summarize(current), previousTotal: summarize(previous).total },
    approved: { ...summarize(approvedOf(current)), previousTotal: summarize(approvedOf(previous)).total },
    awaiting: summarize(awaiting),
    approvalRate: {
      approved: approvedDecided,
      decided: decided.length,
      rate: decided.length ? approvedDecided / decided.length : null,
      windowDays: APPROVAL_RATE_WINDOW_DAYS,
    },
    monthly,
    expiring,
    expiringWindowDays: EXPIRING_WINDOW_DAYS,
  }
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>
