// Gera o CSV de um orçamento no formato que o Excel em português abre direto
import { MEASUREMENT_UNIT_SHORT, QUOTE_STATUS_LABEL } from "@/db/constants"
import { formatDate } from "@/utils/format"
import type { QuoteDetail } from "./quoteService"

// Excel em pt-BR usa ";" como separador, porque a vírgula já é o separador decimal
const SEPARATOR = ";"

const money = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
const quantity = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3, useGrouping: false })

// Campos com separador, aspas ou quebra de linha vão entre aspas (e aspas internas viram "")
function field(value: string) {
  return /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function row(...values: string[]) {
  return values.map(field).join(SEPARATOR)
}

export function buildQuoteCsv(quote: QuoteDetail) {
  const lines = [
    row("Orçamento", `#${quote.id} - ${quote.title}`),
    row("Cliente", quote.customerName),
    row("Status", QUOTE_STATUS_LABEL[quote.status]),
    row("Data", formatDate(quote.createdAt.toISOString())),
    row("Validade", quote.validUntil ? formatDate(quote.validUntil) : ""),
    row("Pagamento", quote.paymentTerms ?? ""),
    row("Prazo de entrega", quote.deliveryTerms ?? ""),
    "",
    row("Descrição", "Tipo", "Quantidade", "Unidade", "Valor unitário", "Subtotal"),
    ...quote.items.map((item) =>
      row(
        item.description,
        item.type === "PRODUCT" ? "Produto" : "Material",
        quantity.format(item.quantity),
        MEASUREMENT_UNIT_SHORT[item.measurementUnit],
        money.format(item.unitPrice),
        money.format(item.quantity * item.unitPrice)
      )
    ),
    "",
    row("", "", "", "", "Subtotal", money.format(quote.subtotal)),
    row("", "", "", "", "Desconto", money.format(quote.discount)),
    row("", "", "", "", "Total", money.format(quote.total)),
  ]

  // ﻿ (BOM) avisa o Excel que o arquivo é UTF-8; sem isso os acentos aparecem quebrados
  return "﻿" + lines.join("\r\n") + "\r\n"
}

// "Home office" → "orcamento-1-home-office"
export function quoteFileName(quote: QuoteDetail) {
  const slug = quote.title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `orcamento-${quote.id}${slug ? `-${slug}` : ""}`
}
