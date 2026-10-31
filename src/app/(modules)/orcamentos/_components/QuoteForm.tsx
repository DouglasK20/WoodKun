"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileSpreadsheet, FileText, Plus, Trash2 } from "lucide-react"

import { Field } from "@/components/form/Field"
import { FormSection } from "@/components/form/FormSection"
import { NativeSelect } from "@/components/form/NativeSelect"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { Textarea } from "@/components/shadcn/textarea"
import { MEASUREMENT_UNIT_SHORT, QUOTE_STATUSES, QUOTE_STATUS_LABEL } from "@/db/constants"
import { useCustomers, type CustomerResponse } from "@/hooks/queries/useCustomers"
import { useMaterials, type MaterialResponse } from "@/hooks/queries/useMaterials"
import { useProducts, type ProductListResponse } from "@/hooks/queries/useProducts"
import { useQuote, useSaveQuote, type QuoteResponse } from "@/hooks/queries/useQuotes"
import { quoteSchema, type QuoteInput, type QuoteItemInput } from "@/schemas/quote"
import { ApiError } from "@/utils/apiClient"
import { formatCurrency } from "@/utils/format"
import { calculateItemsTotal, calculateQuoteTotal } from "@/utils/pricing"

type QuoteFormProps = {
  quoteId?: number
}

export function QuoteForm({ quoteId }: QuoteFormProps) {
  const quote = useQuote(quoteId)
  const customers = useCustomers()
  const materials = useMaterials()
  const products = useProducts()

  const queries = [quote, customers, materials, products]

  if (queries.some((query) => query.isLoading)) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  const error = queries.find((query) => query.error)?.error
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button variant="outline" asChild>
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    )
  }

  // Só monta o formulário depois de ter os dados, porque o react-hook-form lê os defaultValues uma vez só
  return (
    <QuoteFormFields
      quote={quote.data}
      customers={customers.data ?? []}
      materials={materials.data ?? []}
      products={products.data ?? []}
    />
  )
}

type QuoteFormFieldsProps = {
  quote?: QuoteResponse
  customers: CustomerResponse[]
  materials: MaterialResponse[]
  products: ProductListResponse[]
}

function QuoteFormFields({ quote, customers, materials, products }: QuoteFormFieldsProps) {
  const router = useRouter()
  const saveQuote = useSaveQuote()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      // NaN = nenhum cliente selecionado; o zod transforma isso em "Selecione o cliente"
      customerId: quote?.customerId ?? NaN,
      title: quote?.title ?? "",
      status: quote?.status ?? "draft",
      discount: quote?.discount ?? 0,
      validUntil: quote?.validUntil ?? "",
      notes: quote?.notes ?? "",
      items: quote?.items ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  // Re-renderiza quando itens ou desconto mudam, para o resumo acompanhar a digitação
  const items = useWatch({ control, name: "items" })
  const discount = useWatch({ control, name: "discount" })

  // Campo vazio vira NaN com valueAsNumber; no resumo tratamos como 0
  const toNumber = (value: number) => (Number.isFinite(value) ? value : 0)
  const subtotal = calculateItemsTotal(
    (items ?? []).map((item) => ({ quantity: toNumber(item.quantity), unitPrice: toNumber(item.unitPrice) }))
  )
  const total = calculateQuoteTotal(subtotal, toNumber(discount))

  function onSubmit(values: QuoteInput) {
    saveQuote.mutate(
      { id: quote?.id, values },
      {
        onSuccess: () => router.push("/"),
        onError: (error) => {
          // Se a API recusou algum campo (400), mostra o erro embaixo do campo
          if (error instanceof ApiError && error.fieldErrors) {
            for (const [field, messages] of Object.entries(error.fieldErrors)) {
              if (messages?.[0]) setError(field as keyof QuoteInput, { message: messages[0] })
            }
          }
        },
      }
    )
  }

  const itemsError = errors.items?.message ?? errors.items?.root?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <FormSection title="Dados do orçamento">
          <Field label="Título" htmlFor="title" error={errors.title?.message} className="sm:col-span-4">
            <Input id="title" placeholder="Ex.: Cozinha planejada" {...register("title")} />
          </Field>

          <Field label="Status" htmlFor="status" error={errors.status?.message} className="sm:col-span-2">
            <NativeSelect id="status" {...register("status")}>
              {QUOTE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {QUOTE_STATUS_LABEL[status]}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field label="Cliente" htmlFor="customerId" error={errors.customerId?.message} className="sm:col-span-4">
            {customers.length ? (
              <NativeSelect
                id="customerId"
                // O <select> entrega string; convertemos para o número que o schema espera
                {...register("customerId", { setValueAs: (value) => (value === "" ? NaN : Number(value)) })}
              >
                <option value="">Selecione um cliente…</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum cliente cadastrado.{" "}
                <Link href="/clientes/cadastro" className="text-primary underline">
                  Cadastrar cliente
                </Link>
              </p>
            )}
          </Field>

          <Field label="Válido até" htmlFor="validUntil" error={errors.validUntil?.message} className="sm:col-span-2">
            <Input id="validUntil" type="date" {...register("validUntil")} />
          </Field>

          <Field label="Observações" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-6">
            <Textarea id="notes" rows={2} placeholder="Prazo de entrega, forma de pagamento…" {...register("notes")} />
          </Field>
        </FormSection>

        <FormSection
          title="Itens"
          description="Os valores ficam congelados no orçamento: mudar o preço de um material depois não altera este orçamento."
          grid={false}
        >
          <QuoteItemPicker materials={materials} products={products} onAdd={append} />

          {fields.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Nenhum item adicionado.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-56">Descrição</TableHead>
                    <TableHead className="w-36">Quantidade</TableHead>
                    <TableHead className="w-32">Valor unit. (R$)</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = items?.[index]
                    const itemErrors = errors.items?.[index]
                    const unit = MEASUREMENT_UNIT_SHORT[field.measurementUnit]

                    return (
                      // field.id é a chave estável gerada pelo useFieldArray (não usar o index como key)
                      <TableRow key={field.id} className="align-top">
                        <TableCell>
                          <Input
                            aria-label="Descrição"
                            className="h-9"
                            {...register(`items.${index}.description`)}
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {field.type === "PRODUCT" ? "Produto" : "Material"}
                          </p>
                          {itemErrors?.description && (
                            <p className="text-xs text-destructive">{itemErrors.description.message}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              aria-label="Quantidade"
                              className="h-9 w-20"
                              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            />
                            <span className="text-sm text-muted-foreground">{unit}</span>
                          </div>
                          {itemErrors?.quantity && (
                            <p className="mt-1 text-xs text-destructive">{itemErrors.quantity.message}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label="Valor unitário"
                            className="h-9 w-28"
                            {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          />
                          {itemErrors?.unitPrice && (
                            <p className="mt-1 text-xs text-destructive">{itemErrors.unitPrice.message}</p>
                          )}
                        </TableCell>
                        <TableCell className="pt-4 text-right font-medium">
                          {formatCurrency(toNumber(item?.quantity ?? 0) * toNumber(item?.unitPrice ?? 0))}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Remover"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {itemsError && <p className="text-sm text-destructive">{itemsError}</p>}
        </FormSection>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <section className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Resumo</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <dt>
                  <label htmlFor="discount" className="text-muted-foreground">
                    Desconto (R$)
                  </label>
                </dt>
                <dd>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-9 w-32 text-right"
                    {...register("discount", { valueAsNumber: true })}
                  />
                </dd>
              </div>
              {errors.discount && <p className="text-right text-xs text-destructive">{errors.discount.message}</p>}
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="text-2xl font-bold text-primary">{formatCurrency(total)}</dd>
            </div>
          </dl>
        </section>

        {saveQuote.error && <p className="text-sm text-destructive">{saveQuote.error.message}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={saveQuote.isPending} className="flex-1 cursor-pointer">
            {saveQuote.isPending ? "Salvando…" : "Salvar"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Cancelar</Link>
          </Button>
        </div>

        {/* Exportar só existe para orçamento já salvo: os arquivos são gerados pela API a partir do banco */}
        {quote && (
          <section className="space-y-3 rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">Exportar</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                {/* Links comuns: o navegador abre o PDF (inline) e baixa o CSV (attachment) */}
                <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener">
                  <FileText />
                  PDF
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/api/quotes/${quote.id}/csv`}>
                  <FileSpreadsheet />
                  CSV
                </a>
              </Button>
            </div>
            {isDirty && (
              <p className="text-xs text-muted-foreground">
                Há alterações não salvas. A exportação usa a última versão salva.
              </p>
            )}
          </section>
        )}
      </aside>
    </form>
  )
}

type QuoteItemPickerProps = {
  materials: MaterialResponse[]
  products: ProductListResponse[]
  onAdd: (item: QuoteItemInput) => void
}

// Tipo + item + quantidade + botão. Estado local: só vira dado do form ao clicar em Adicionar
function QuoteItemPicker({ materials, products, onAdd }: QuoteItemPickerProps) {
  const [type, setType] = useState<QuoteItemInput["type"]>("PRODUCT")
  const [selectedId, setSelectedId] = useState("")
  const [quantity, setQuantity] = useState("1")

  const options = useMemo(
    () =>
      type === "PRODUCT"
        ? products.map((product) => ({ id: product.id, label: `${product.name} — ${formatCurrency(product.price)}/un` }))
        : materials.map((material) => ({
            id: material.id,
            label: `${material.name} — ${formatCurrency(material.unitPrice)}/${MEASUREMENT_UNIT_SHORT[material.measurementUnit]}`,
          })),
    [type, materials, products]
  )

  const parsedQuantity = Number(quantity.replace(",", "."))
  const canAdd = selectedId !== "" && parsedQuantity > 0

  // Monta o item com a cópia dos dados atuais do material/produto
  function handleAdd() {
    if (!canAdd) return
    const id = Number(selectedId)

    if (type === "PRODUCT") {
      const product = products.find((p) => p.id === id)!
      onAdd({
        type,
        productId: id,
        materialId: null,
        description: product.name,
        measurementUnit: "UN",
        quantity: parsedQuantity,
        unitPrice: product.price,
      })
    } else {
      const material = materials.find((m) => m.id === id)!
      onAdd({
        type,
        materialId: id,
        productId: null,
        description: material.name,
        measurementUnit: material.measurementUnit,
        quantity: parsedQuantity,
        unitPrice: material.unitPrice,
      })
    }

    setSelectedId("")
    setQuantity("1")
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <NativeSelect
        aria-label="Tipo de item"
        value={type}
        onChange={(event) => {
          setType(event.target.value as QuoteItemInput["type"])
          setSelectedId("")
        }}
        className="sm:w-32"
      >
        <option value="PRODUCT">Produto</option>
        <option value="MATERIAL">Material</option>
      </NativeSelect>

      <NativeSelect
        aria-label="Item"
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
        className="sm:flex-1"
      >
        <option value="">
          {options.length ? `Selecione um ${type === "PRODUCT" ? "produto" : "material"}…` : "Nenhum cadastrado"}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </NativeSelect>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="any"
          min="0"
          aria-label="Quantidade"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          // Enter aqui adiciona o item, não envia o formulário inteiro
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              handleAdd()
            }
          }}
          className="w-20"
        />
        <Button type="button" variant="outline" className="cursor-pointer" disabled={!canAdd} onClick={handleAdd}>
          <Plus />
          Adicionar
        </Button>
      </div>
    </div>
  )
}
