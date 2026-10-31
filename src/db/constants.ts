// Constantes sem dependência do Drizzle, para poderem ser importadas em componentes client

export const MEASUREMENT_UNITS = ["UN", "M", "M2"] as const
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number]

export const MEASUREMENT_UNIT_LABEL: Record<MeasurementUnit, string> = {
  UN: "Unidade",
  M: "Metro",
  M2: "Metro²",
}

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const
export type BrazilianState = (typeof BRAZILIAN_STATES)[number]

export const QUOTE_STATUSES = ["draft", "sent", "approved", "rejected"] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
}
