"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

import { Field } from "@/components/form/Field"
import { FormSection } from "@/components/form/FormSection"
import { ImageUpload } from "@/components/form/ImageUpload"
import { NativeSelect } from "@/components/form/NativeSelect"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { Textarea } from "@/components/shadcn/textarea"
import { MEASUREMENT_UNIT_SHORT } from "@/db/constants"
import { useMaterials, type MaterialResponse } from "@/hooks/queries/useMaterials"
import { useProduct, useSaveProduct, type ProductResponse } from "@/hooks/queries/useProducts"
import { productSchema, type ProductInput } from "@/schemas/product"
import { ApiError } from "@/utils/apiClient"
import { formatCurrency } from "@/utils/format"
import { calculateItemsTotal, calculatePrice } from "@/utils/pricing"

type ProductFormProps = {
  productId?: number
}

export function ProductForm({ productId }: ProductFormProps) {
  const product = useProduct(productId)
  // A lista de materiais é necessária para o select e para mostrar nome/preço de cada item
  const materials = useMaterials()

  if (product.isLoading || materials.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const error = product.error ?? materials.error
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button variant="outline" asChild>
          <Link href="/produtos">Voltar para produtos</Link>
        </Button>
      </div>
    )
  }

  // Só monta o formulário depois de ter os dados, porque o react-hook-form lê os defaultValues uma vez só
  return <ProductFormFields product={product.data} materials={materials.data ?? []} />
}

type ProductFormFieldsProps = {
  product?: ProductResponse
  materials: MaterialResponse[]
}

function ProductFormFields({ product, materials }: ProductFormFieldsProps) {
  const router = useRouter()
  const saveProduct = useSaveProduct()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      profitMargin: product?.profitMargin ?? 0,
      imageUrl: product?.imageUrl ?? "",
      // No form guardamos só o que é salvo; nome e preço vêm da lista de materiais
      materials: product?.materials.map(({ materialId, quantity }) => ({ materialId, quantity })) ?? [],
    },
  })

  // useFieldArray: gerencia uma lista dentro do form (adicionar, remover, uma chave estável por linha)
  const { fields, append, remove } = useFieldArray({ control, name: "materials" })

  // useWatch: re-renderiza quando esses valores mudam, para o resumo de preço acompanhar a digitação
  const items = useWatch({ control, name: "materials" })
  const profitMargin = useWatch({ control, name: "profitMargin" })

  const materialsById = useMemo(() => new Map(materials.map((material) => [material.id, material])), [materials])

  // Campo vazio vira NaN com valueAsNumber; no resumo tratamos como 0
  const toNumber = (value: number) => (Number.isFinite(value) ? value : 0)
  const cost = calculateItemsTotal(
    (items ?? []).map((item) => ({
      quantity: toNumber(item.quantity),
      unitPrice: materialsById.get(item.materialId)?.unitPrice ?? 0,
    }))
  )
  const price = calculatePrice(cost, toNumber(profitMargin))

  function onSubmit(values: ProductInput) {
    saveProduct.mutate(
      { id: product?.id, values },
      {
        onSuccess: () => router.push("/produtos"),
        onError: (error) => {
          // Se a API recusou algum campo (400), mostra o erro embaixo do campo
          if (error instanceof ApiError && error.fieldErrors) {
            for (const [field, messages] of Object.entries(error.fieldErrors)) {
              if (messages?.[0]) setError(field as keyof ProductInput, { message: messages[0] })
            }
          }
        },
      }
    )
  }

  const materialsError = errors.materials?.message ?? errors.materials?.root?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <FormSection title="Dados do produto">
          <Field label="Nome" htmlFor="name" error={errors.name?.message} className="sm:col-span-4">
            <Input id="name" placeholder="Ex.: Escrivaninha 1,20m" {...register("name")} />
          </Field>

          <Field label="Margem de lucro (%)" htmlFor="profitMargin" error={errors.profitMargin?.message} className="sm:col-span-2">
            <Input
              id="profitMargin"
              type="number"
              step="0.01"
              min="0"
              {...register("profitMargin", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Descrição" htmlFor="description" error={errors.description?.message} className="sm:col-span-6">
            <Textarea id="description" rows={2} placeholder="Medidas, acabamento, detalhes…" {...register("description")} />
          </Field>

          <Field label="Imagem" htmlFor="imageUrl" error={errors.imageUrl?.message} className="sm:col-span-6">
            {/* Controller: liga ao form um componente que não é <input> nativo (não funciona com register) */}
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => <ImageUpload id="imageUrl" value={field.value} onChange={field.onChange} />}
            />
          </Field>
        </FormSection>

        <FormSection title="Materiais" description="Quantidade na unidade de cada material (un, m ou m²)." grid={false}>
          <MaterialPicker
            materials={materials.filter((material) => !items?.some((item) => item.materialId === material.id))}
            onAdd={(materialId, quantity) => append({ materialId, quantity })}
          />

          {fields.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Nenhum material adicionado.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Material</TableHead>
                    <TableHead className="w-40">Quantidade</TableHead>
                    <TableHead className="text-right">Valor unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const material = materialsById.get(field.materialId)
                    const quantity = toNumber(items?.[index]?.quantity ?? 0)
                    const quantityError = errors.materials?.[index]?.quantity?.message

                    return (
                      // field.id é a chave estável gerada pelo useFieldArray (não usar o index como key)
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{material?.name ?? "Material removido"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              aria-label={`Quantidade de ${material?.name}`}
                              className="h-9 w-24"
                              {...register(`materials.${index}.quantity`, { valueAsNumber: true })}
                            />
                            <span className="text-sm text-muted-foreground">
                              {material && MEASUREMENT_UNIT_SHORT[material.measurementUnit]}
                            </span>
                          </div>
                          {quantityError && <p className="mt-1 text-xs text-destructive">{quantityError}</p>}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {material && formatCurrency(material.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(quantity * (material?.unitPrice ?? 0))}
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

          {materialsError && <p className="text-sm text-destructive">{materialsError}</p>}
        </FormSection>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <section className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Resumo</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Custo dos materiais</dt>
              <dd>{formatCurrency(cost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Margem ({toNumber(profitMargin).toLocaleString("pt-BR")}%)</dt>
              <dd>+ {formatCurrency(price - cost)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-medium">Preço final</dt>
              <dd className="text-2xl font-bold text-primary">{formatCurrency(price)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            O preço acompanha o valor atual dos materiais: se um material mudar de preço, o produto se atualiza.
          </p>
        </section>

        {saveProduct.error && <p className="text-sm text-destructive">{saveProduct.error.message}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={saveProduct.isPending} className="flex-1 cursor-pointer">
            {saveProduct.isPending ? "Salvando…" : "Salvar"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/produtos">Cancelar</Link>
          </Button>
        </div>
      </aside>
    </form>
  )
}

type MaterialPickerProps = {
  // Só os materiais que ainda não estão na lista
  materials: MaterialResponse[]
  onAdd: (materialId: number, quantity: number) => void
}

// Select + quantidade + botão. Estado local, fora do react-hook-form: só vira dado do form ao clicar em Adicionar
function MaterialPicker({ materials, onAdd }: MaterialPickerProps) {
  const [materialId, setMaterialId] = useState("")
  const [quantity, setQuantity] = useState("1")

  const parsedQuantity = Number(quantity.replace(",", "."))
  const canAdd = materialId !== "" && parsedQuantity > 0
  const selected = materials.find((material) => material.id === Number(materialId))

  function handleAdd() {
    if (!canAdd) return
    onAdd(Number(materialId), parsedQuantity)
    setMaterialId("")
    setQuantity("1")
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <NativeSelect
        aria-label="Material"
        value={materialId}
        onChange={(event) => setMaterialId(event.target.value)}
        className="sm:flex-1"
      >
        <option value="">{materials.length ? "Selecione um material…" : "Todos os materiais já foram adicionados"}</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.name} — {formatCurrency(material.unitPrice)}/{MEASUREMENT_UNIT_SHORT[material.measurementUnit]}
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
          // Enter aqui adicionaria o material, não enviaria o formulário inteiro
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              handleAdd()
            }
          }}
          className="w-24"
        />
        <span className="w-6 text-sm text-muted-foreground">
          {selected && MEASUREMENT_UNIT_SHORT[selected.measurementUnit]}
        </span>
        <Button type="button" variant="outline" className="cursor-pointer" disabled={!canAdd} onClick={handleAdd}>
          <Plus />
          Adicionar
        </Button>
      </div>
    </div>
  )
}
