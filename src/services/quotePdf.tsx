// Gera o PDF de um orçamento com @react-pdf/renderer (componentes React que viram PDF, só no servidor)
import path from "node:path"
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import sharp from "sharp"
import { MEASUREMENT_UNIT_SHORT } from "@/db/constants"
import type { CompanySettings, Customer } from "@/db/schema"
import { formatCurrency, formatDate } from "@/utils/format"
import type { QuoteDetail } from "./quoteService"
import { readImageByUrl } from "./uploadService"

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

// Logo padrão (WoodKun), usado enquanto a empresa não envia o dela
const DEFAULT_LOGO_PATH = path.join(process.cwd(), "public/assets/Logotipo-WoodKun-pdf.png")
const DEFAULT_LOGO_RATIO = 240 / 187

// Área máxima do logo no cabeçalho (em pontos)
const LOGO_MAX_WIDTH = 90
const LOGO_MAX_HEIGHT = 56

const quantityFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 })

// Estilos parecidos com CSS, mas o layout é sempre flexbox (como no React Native)
const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 10, color: colors.text },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  brand: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 16 },
  brandText: { flex: 1 },
  quoteInfo: { flexShrink: 0 },
  brandName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: colors.primary },
  brandDetail: { fontSize: 8, color: colors.muted, marginTop: 1 },
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

// Cliente e empresa têm os mesmos campos de endereço e contato
type AddressAndContact = Pick<
  Customer,
  "document" | "phone" | "email" | "zipCode" | "street" | "number" | "complement" | "neighborhood" | "city" | "state"
>

function formatAddress(entity: AddressAndContact) {
  const streetLine = [entity.street, entity.number, entity.complement].filter(Boolean).join(", ")
  const cityLine = [entity.neighborhood, [entity.city, entity.state].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(" - ")
  return [streetLine, cityLine, entity.zipCode && `CEP ${entity.zipCode}`].filter(Boolean).join(" · ")
}

function formatContact(entity: AddressAndContact) {
  return [entity.document, entity.phone, entity.email].filter(Boolean).join(" · ")
}

type Logo = {
  src: string | { data: Buffer; format: "png" }
  // largura ÷ altura da imagem, para calcular o tamanho sem esticar
  ratio: number
}

// Encaixa o logo na área máxima mantendo a proporção (largo: limita a largura; quadrado/alto: limita a altura)
function logoSize(ratio: number) {
  return ratio >= LOGO_MAX_WIDTH / LOGO_MAX_HEIGHT
    ? { width: LOGO_MAX_WIDTH, height: LOGO_MAX_WIDTH / ratio }
    : { width: LOGO_MAX_HEIGHT * ratio, height: LOGO_MAX_HEIGHT }
}

type QuoteDocumentProps = {
  quote: QuoteDetail
  customer: Customer
  company: CompanySettings | null
  logo: Logo
}

function QuoteDocument({ quote, customer, company, logo }: QuoteDocumentProps) {
  const contact = formatContact(customer)
  const address = formatAddress(customer)

  return (
    <Document title={`Orçamento #${quote.id} - ${quote.title}`} author="WoodKun">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf não é <img> e não aceita alt */}
            <Image src={logo.src} style={logoSize(logo.ratio)} />
            {company ? (
              <View style={styles.brandText}>
                <Text style={styles.brandName}>{company.name}</Text>
                {formatContact(company) && <Text style={styles.brandDetail}>{formatContact(company)}</Text>}
                {formatAddress(company) && <Text style={styles.brandDetail}>{formatAddress(company)}</Text>}
              </View>
            ) : (
              <Text style={styles.brandName}>WoodKun</Text>
            )}
          </View>
          <View style={styles.quoteInfo}>
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

// Logo da empresa convertido para PNG e reduzido: o react-pdf não lê WebP, e um logo de 5 MB deixaria o PDF enorme
async function loadLogo(logoUrl: string | null | undefined): Promise<Logo> {
  const defaultLogo = { src: DEFAULT_LOGO_PATH, ratio: DEFAULT_LOGO_RATIO }
  const image = await readImageByUrl(logoUrl)
  if (!image) return defaultLogo

  try {
    // resolveWithObject: além dos bytes, devolve largura/altura finais (usadas para calcular a proporção)
    const { data, info } = await sharp(image.bytes)
      .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer({ resolveWithObject: true })
    return { src: { data, format: "png" }, ratio: info.width / info.height }
  } catch {
    // Arquivo corrompido: melhor gerar o PDF com o logo padrão do que falhar
    return defaultLogo
  }
}

export async function renderQuotePdf(quote: QuoteDetail, customer: Customer, company: CompanySettings | null) {
  const logo = await loadLogo(company?.logoUrl)
  return renderToBuffer(<QuoteDocument quote={quote} customer={customer} company={company} logo={logo} />)
}
