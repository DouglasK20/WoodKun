import { format, parseISO } from "date-fns"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatCurrency(value: number) {
  return currency.format(value)
}

// Aceita "AAAA-MM-DD" ou data/hora ISO vindas da API
export function formatDate(value: string) {
  return format(parseISO(value), "dd/MM/yyyy")
}
