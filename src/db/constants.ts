// Constantes sem dependência do Drizzle, para poderem ser importadas em componentes client

export const MEASUREMENT_UNITS = ["UN", "M", "M2"] as const
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number]

export const MEASUREMENT_UNIT_LABEL: Record<MeasurementUnit, string> = {
  UN: "Unidade",
  M: "Metro",
  M2: "Metro²",
}

// Abreviação usada ao lado de quantidades ("2,5 m²")
export const MEASUREMENT_UNIT_SHORT: Record<MeasurementUnit, string> = {
  UN: "un",
  M: "m",
  M2: "m²",
}

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const
export type BrazilianState = (typeof BRAZILIAN_STATES)[number]

export const BRAZILIAN_STATE_NAME: Record<BrazilianState, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
}

export const QUOTE_STATUSES = ["draft", "sent", "approved", "rejected"] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
}
