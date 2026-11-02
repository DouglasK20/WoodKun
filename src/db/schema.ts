import {
  boolean,
  date,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core"
import { MEASUREMENT_UNITS, QUOTE_STATUSES } from "./constants"

// Colunas de data reaproveitadas em todas as tabelas
const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}

// Dinheiro sempre em decimal (nunca float). mode "number" faz o Drizzle devolver number em vez de string
const money = (name: string) => decimal(name, { precision: 10, scale: 2, mode: "number" })

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  document: varchar("document", { length: 18 }),
  zipCode: varchar("zip_code", { length: 9 }),
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  notes: text("notes"),
  ...timestamps,
})

// Tabelas do Better Auth (login). Os nomes das propriedades (createdAt, userId…) são os que ele espera;
// os nomes das colunas seguem o padrão do banco. Os ids são strings geradas pelo Better Auth
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Campos do plugin admin: papel (admin, purchasing, sales) e bloqueio
  role: varchar("role", { length: 50 }),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  ...timestamps,
})

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    impersonatedBy: varchar("impersonated_by", { length: 36 }),
    ...timestamps,
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
)

// Uma "conta" por forma de login do usuário. Para e-mail e senha, providerId = "credential" e o hash da senha fica aqui
export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)]
)

// Códigos temporários (ex.: redefinição de senha por e-mail, se for usada no futuro)
export const verifications = mysqlTable(
  "verifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)]
)

// Dados da marcenaria (aparecem no PDF). Tabela de uma linha só, sempre com id = 1
export const companySettings = mysqlTable("company_settings", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 18 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  zipCode: varchar("zip_code", { length: 9 }),
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  // Condições padrão: copiadas para cada orçamento novo (e editáveis nele)
  defaultValidityDays: int("default_validity_days"),
  paymentTerms: text("payment_terms"),
  deliveryTerms: text("delivery_terms"),
  ...timestamps,
})

export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  measurementUnit: mysqlEnum("measurement_unit", MEASUREMENT_UNITS).notNull(),
  unitPrice: money("unit_price").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  active: boolean("active").notNull().default(true),
  ...timestamps,
})

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2, mode: "number" }).notNull().default(0),
  ...timestamps,
})

// A "receita" do produto: quais materiais e quanto de cada
export const productMaterials = mysqlTable("product_materials", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  materialId: int("material_id").notNull().references(() => materials.id),
  quantity: decimal("quantity", { precision: 10, scale: 3, mode: "number" }).notNull(),
})

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull().references(() => customers.id),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", QUOTE_STATUSES).notNull().default("draft"),
  discount: money("discount").notNull().default(0),
  notes: text("notes"),
  // Condições do orçamento (cópia das condições padrão da empresa ao criar; editáveis)
  paymentTerms: text("payment_terms"),
  deliveryTerms: text("delivery_terms"),
  // mode "string": devolve "AAAA-MM-DD" em vez de Date, evitando o dia mudar por causa de fuso horário
  validUntil: date("valid_until", { mode: "string" }),
  ...timestamps,
})

// Histórico de status do orçamento: uma linha por mudança (e uma ao criar). Dá a data real de envio/aprovação/recusa
export const quoteStatusHistory = mysqlTable(
  "quote_status_history",
  {
    id: int("id").autoincrement().primaryKey(),
    quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", QUOTE_STATUSES).notNull(),
    changedAt: timestamp("changed_at").notNull().defaultNow(),
    // Quem mudou. O nome é copiado para o histórico continuar legível se o usuário for excluído
    changedBy: varchar("changed_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    changedByName: varchar("changed_by_name", { length: 255 }),
  },
  (table) => [index("quote_status_history_quote_id_idx").on(table.quoteId)]
)

// Cada item guarda uma CÓPIA da descrição/unidade/valor no momento do orçamento,
// assim mudar o preço de um material depois não altera orçamentos já feitos
export const quoteItems = mysqlTable("quote_items", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["MATERIAL", "PRODUCT"]).notNull(),
  materialId: int("material_id").references(() => materials.id),
  productId: int("product_id").references(() => products.id),
  description: varchar("description", { length: 255 }).notNull(),
  measurementUnit: mysqlEnum("measurement_unit", MEASUREMENT_UNITS).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3, mode: "number" }).notNull(),
  unitPrice: money("unit_price").notNull(),
})

export type User = typeof users.$inferSelect
export type Customer = typeof customers.$inferSelect
export type CompanySettings = typeof companySettings.$inferSelect
export type Quote = typeof quotes.$inferSelect
export type Product = typeof products.$inferSelect
export type Material = typeof materials.$inferSelect
export type NewMaterial = typeof materials.$inferInsert
