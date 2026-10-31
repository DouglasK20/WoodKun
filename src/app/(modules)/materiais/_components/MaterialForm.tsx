"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Field } from "@/components/form/Field"
import { NativeSelect } from "@/components/form/NativeSelect"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Textarea } from "@/components/shadcn/textarea"
import { MEASUREMENT_UNITS, MEASUREMENT_UNIT_LABEL } from "@/db/constants"
import { useMaterial, useSaveMaterial, type MaterialResponse } from "@/hooks/queries/useMaterials"
import { materialSchema, type MaterialInput } from "@/schemas/material"
import { ApiError } from "@/utils/apiClient"

type MaterialFormProps = {
  materialId?: number
}

export function MaterialForm({ materialId }: MaterialFormProps) {
  const { data: material, isLoading, error } = useMaterial(materialId)

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-5">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button variant="outline" asChild>
          <Link href="/materiais">Voltar para materiais</Link>
        </Button>
      </div>
    )
  }

  // Só monta o formulário depois de ter os dados, porque o react-hook-form lê os defaultValues uma vez só
  return <MaterialFormFields material={material} />
}

function MaterialFormFields({ material }: { material?: MaterialResponse }) {
  const router = useRouter()
  const saveMaterial = useSaveMaterial()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MaterialInput>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name ?? "",
      description: material?.description ?? "",
      measurementUnit: material?.measurementUnit ?? "UN",
      unitPrice: material?.unitPrice,
    },
  })

  // Só é chamado se a validação do zod passar
  function onSubmit(values: MaterialInput) {
    saveMaterial.mutate(
      { id: material?.id, values },
      {
        onSuccess: () => router.push("/materiais"),
        onError: (error) => {
          // Se a API recusou algum campo (400), mostra o erro embaixo do campo
          if (error instanceof ApiError && error.fieldErrors) {
            for (const [field, messages] of Object.entries(error.fieldErrors)) {
              if (messages?.[0]) setError(field as keyof MaterialInput, { message: messages[0] })
            }
          }
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <Field label="Nome" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="Ex.: Chapa MDF Branco 15mm" {...register("name")} />
      </Field>

      <Field label="Descrição" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={3} {...register("description")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Unidade de medida" htmlFor="measurementUnit" error={errors.measurementUnit?.message}>
          <NativeSelect id="measurementUnit" {...register("measurementUnit")}>
            {MEASUREMENT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {MEASUREMENT_UNIT_LABEL[unit]}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Valor (R$)" htmlFor="unitPrice" error={errors.unitPrice?.message}>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            // valueAsNumber: o input entrega number em vez de string
            {...register("unitPrice", { valueAsNumber: true })}
          />
        </Field>
      </div>

      {saveMaterial.error && <p className="text-sm text-destructive">{saveMaterial.error.message}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={saveMaterial.isPending}
          className="cursor-pointer"
        >
          {saveMaterial.isPending ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/materiais">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
