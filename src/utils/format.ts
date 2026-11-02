import { format, parseISO } from "date-fns"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatCurrency(value: number) {
  return currency.format(value)
}

// "01/11/2026 às 18:20"
export function formatDateTime(value: string) {
  return format(parseISO(value), "dd/MM/yyyy 'às' HH:mm")
}

// Aceita "AAAA-MM-DD" ou data/hora ISO vindas da API
export function formatDate(value: string) {
  return format(parseISO(value), "dd/MM/yyyy")
}
