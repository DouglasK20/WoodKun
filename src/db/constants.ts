// Constantes sem dependência do Drizzle, para poderem ser importadas em componentes client

export const MEASUREMENT_UNITS = ["UN", "M", "M2"] as const
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number]

export const MEASUREMENT_UNIT_LABEL: Record<MeasurementUnit, string> = {
  UN: "Unidade",
  M: "Metro",
  M2: "Metro²",
}

export const QUOTE_STATUSES = ["draft", "sent", "approved", "rejected"] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
}
