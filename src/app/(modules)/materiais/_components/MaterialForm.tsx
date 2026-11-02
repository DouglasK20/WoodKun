"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Field } from "@/components/form/Field"
import { FormActions, type SaveIntent } from "@/components/form/FormActions"
import { ImageUpload } from "@/components/form/ImageUpload"
import { Select } from "@/components/form/Select"
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
  return <MaterialFormFields key={material?.id ?? "novo"} material={material} />
}

function MaterialFormFields({ material }: { material?: MaterialResponse }) {
  const router = useRouter()
  const [intent, setIntent] = useState<SaveIntent>("stay")
  const saveMaterial = useSaveMaterial()

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<MaterialInput>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name ?? "",
      description: material?.description ?? "",
      measurementUnit: material?.measurementUnit ?? "UN",
      unitPrice: material?.unitPrice,
      imageUrl: material?.imageUrl ?? "",
    },
  })

  // Só é chamado se a validação do zod passar
  // "stay": continua na página; "back": volta para a listagem
  function onSubmit(values: MaterialInput, saveIntent: SaveIntent) {
    setIntent(saveIntent)
    saveMaterial.mutate(
      { id: material?.id, values },
      {
        onSuccess: (saved) => {
          toast.success(material ? "Material atualizado" : "Material cadastrado")
          if (saveIntent === "back") router.push("/materiais")
          // Cadastro novo: a página vira a edição do registro criado (salvar de novo atualiza, não duplica)
          else if (!material) router.replace(`/materiais/cadastro?id=${saved.id}`)
          // Edição: o form passa a considerar o que foi salvo como "sem alterações"
          else reset(values)
        },
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
    <form noValidate onSubmit={handleSubmit((values) => onSubmit(values, "stay"))} className="max-w-2xl space-y-5">
      <Field label="Imagem" htmlFor="imageUrl" error={errors.imageUrl?.message}>
        {/* Controller: liga ao form um componente que não é <input> nativo (não funciona com register) */}
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => <ImageUpload id="imageUrl" value={field.value} onChange={field.onChange} />}
        />
      </Field>

      <Field label="Nome" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="Ex.: Chapa MDF Branco 15mm" {...register("name")} />
      </Field>

      <Field label="Descrição" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={3} {...register("description")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Unidade de medida" htmlFor="measurementUnit" error={errors.measurementUnit?.message}>
          {/* Controller: o Select não é um <input> nativo, então não funciona com register */}
          <Controller
            control={control}
            name="measurementUnit"
            render={({ field }) => (
              <Select
                id="measurementUnit"
                options={MEASUREMENT_UNITS.map((unit) => ({ value: unit, label: MEASUREMENT_UNIT_LABEL[unit] }))}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
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

      <FormActions
        pending={saveMaterial.isPending}
        intent={intent}
        onSaveAndBack={handleSubmit((values) => onSubmit(values, "back"))}
        cancelHref="/materiais"
      />
    </form>
  )
}
