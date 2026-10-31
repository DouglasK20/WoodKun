// Gera o PDF de um orçamento com @react-pdf/renderer (componentes React que viram PDF, só no servidor)
import path from "node:path"
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { MEASUREMENT_UNIT_SHORT } from "@/db/constants"
import type { Customer } from "@/db/schema"
import { formatCurrency, formatDate } from "@/utils/format"
import type { QuoteDetail } from "./quoteService"

// O PDF não enxerga as variáveis CSS do app, então as cores da marca vão em hexadecimal
const colors = {
  primary: "#8a5a2b",
  text: "#2b2622",
  muted: "#7a7067",
  border: "#e6dfd6",
  headerBackground: "#f6f1ea",
}

// Desliga a hifenização automática (usa regras do inglês e pode quebrar palavras em português no lugar errado)
Font.registerHyphenationCallback((word) => [word])

const LOGO_PATH = path.join(process.cwd(), "public/assets/Logotipo-WoodKun-pdf.png")

const quantityFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 })

// Estilos parecidos com CSS, mas o layout é sempre flexbox (como no React Native)
const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 10, color: colors.text },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 48, height: 37 },
  brandName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: colors.primary },
  quoteNumber: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  muted: { color: colors.muted },
  right: { textAlign: "right" },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 },
  sectionTitle: { fontSize: 8, color: colors.muted, textTransform: "uppercase", marginBottom: 4 },
  customerName: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 10 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.headerBackground,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colDescription: { flex: 4, paddingRight: 8 },
  colQuantity: { flex: 1.2, textAlign: "right" },
  colUnit: { flex: 0.8, paddingLeft: 6 },
  colPrice: { flex: 1.6, textAlign: "right" },
  colSubtotal: { flex: 1.6, textAlign: "right" },
  itemType: { fontSize: 8, color: colors.muted, marginTop: 1 },
  totals: { marginTop: 12, marginLeft: "auto", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
    paddingTop: 6,
  },
  grandTotalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.primary },
  notes: { marginTop: 24 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.muted,
  },
})

function formatAddress(customer: Customer) {
  const streetLine = [customer.street, customer.number, customer.complement].filter(Boolean).join(", ")
  const cityLine = [customer.neighborhood, [customer.city, customer.state].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(" - ")
  return [streetLine, cityLine, customer.zipCode && `CEP ${customer.zipCode}`].filter(Boolean).join(" · ")
}

function QuoteDocument({ quote, customer }: { quote: QuoteDetail; customer: Customer }) {
  const contact = [customer.document, customer.phone, customer.email].filter(Boolean).join(" · ")
  const address = formatAddress(customer)

  return (
    <Document title={`Orçamento #${quote.id} - ${quote.title}`} author="WoodKun">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf não é <img> e não aceita alt */}
            <Image src={LOGO_PATH} style={styles.logo} />
            <View>
              <Text style={styles.brandName}>WoodKun</Text>
            </View>
          </View>
          <View>
            <Text style={styles.quoteNumber}>Orçamento #{quote.id}</Text>
            <Text style={[styles.muted, styles.right]}>Emitido em {formatDate(quote.createdAt.toISOString())}</Text>
            {quote.validUntil && (
              <Text style={[styles.muted, styles.right]}>Válido até {formatDate(quote.validUntil)}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Cliente</Text>
        <Text style={styles.customerName}>{customer.name}</Text>
        {contact && <Text style={styles.muted}>{contact}</Text>}
        {address && <Text style={styles.muted}>{address}</Text>}

        <Text style={styles.title}>{quote.title}</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>Descrição</Text>
          <Text style={styles.colQuantity}>Qtd.</Text>
          <Text style={styles.colUnit}>Un.</Text>
          <Text style={styles.colPrice}>Valor unit.</Text>
          <Text style={styles.colSubtotal}>Subtotal</Text>
        </View>
        {quote.items.map((item, index) => (
          // wrap={false}: uma linha da tabela nunca é cortada entre duas páginas
          <View key={index} style={styles.tableRow} wrap={false}>
            <View style={styles.colDescription}>
              <Text>{item.description}</Text>
              <Text style={styles.itemType}>{item.type === "PRODUCT" ? "Produto" : "Material"}</Text>
            </View>
            <Text style={styles.colQuantity}>{quantityFormat.format(item.quantity)}</Text>
            <Text style={styles.colUnit}>{MEASUREMENT_UNIT_SHORT[item.measurementUnit]}</Text>
            <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.colSubtotal}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
          </View>
        ))}

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.muted}>Desconto</Text>
              <Text>- {formatCurrency(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {quote.notes && (
          <View style={styles.notes} wrap={false}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}

        {/* fixed: repete em todas as páginas */}
        <View style={styles.footer} fixed>
          <Text>Orçamento gerado pelo WoodKun</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export function renderQuotePdf(quote: QuoteDetail, customer: Customer) {
  return renderToBuffer(<QuoteDocument quote={quote} customer={customer} />)
}
