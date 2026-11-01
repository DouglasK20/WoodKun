import {
  boolean,
  date,
  decimal,
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
  // mode "string": devolve "AAAA-MM-DD" em vez de Date, evitando o dia mudar por causa de fuso horário
  validUntil: date("valid_until", { mode: "string" }),
  ...timestamps,
})

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

export type Customer = typeof customers.$inferSelect
export type CompanySettings = typeof companySettings.$inferSelect
export type Quote = typeof quotes.$inferSelect
export type Product = typeof products.$inferSelect
export type Material = typeof materials.$inferSelect
export type NewMaterial = typeof materials.$inferInsert
