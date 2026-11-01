"use client"

import { Controller, FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheck } from "lucide-react"

import { AddressFields } from "@/components/form/AddressFields"
import { Field } from "@/components/form/Field"
import { FormSection } from "@/components/form/FormSection"
import { ImageUpload } from "@/components/form/ImageUpload"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { useCompany, useSaveCompany, type CompanyResponse } from "@/hooks/queries/useCompany"
import { companySchema, type CompanyInput } from "@/schemas/company"
import { ApiError } from "@/utils/apiClient"
import { maskDocument, maskPhone, withMask } from "@/utils/masks"

export function CompanyForm() {
  const { data: company, isLoading, error } = useCompany()

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-5">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) return <p className="text-sm text-destructive">{error.message}</p>

  // Só monta o formulário depois de ter os dados, porque o react-hook-form lê os defaultValues uma vez só
  return <CompanyFormFields company={company ?? null} />
}

// O banco guarda null, mas os inputs trabalham com string
function toFormValues(company: CompanyResponse | null): CompanyInput {
  return {
    name: company?.name ?? "",
    document: company?.document ?? "",
    phone: company?.phone ?? "",
    email: company?.email ?? "",
    zipCode: company?.zipCode ?? "",
    street: company?.street ?? "",
    number: company?.number ?? "",
    complement: company?.complement ?? "",
    neighborhood: company?.neighborhood ?? "",
    city: company?.city ?? "",
    state: (company?.state as CompanyInput["state"]) ?? "",
    logoUrl: company?.logoUrl ?? "",
  }
}

function CompanyFormFields({ company }: { company: CompanyResponse | null }) {
  const saveCompany = useSaveCompany()

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(company),
  })
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = form

  function onSubmit(values: CompanyInput) {
    saveCompany.mutate(values, {
      // reset com o que foi salvo: o form volta a ficar "sem alterações" (isDirty = false)
      onSuccess: (saved) => reset(toFormValues(saved)),
      onError: (error) => {
        // Se a API recusou algum campo (400), mostra o erro embaixo do campo
        if (error instanceof ApiError && error.fieldErrors) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            if (messages?.[0]) setError(field as keyof CompanyInput, { message: messages[0] })
          }
        }
      },
    })
  }

  return (
    // FormProvider: deixa o form disponível para o AddressFields via useFormContext
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {!company && (
          <p className="rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-info">
            Preencha os dados da sua marcenaria. Eles aparecem no cabeçalho dos orçamentos em PDF.
          </p>
        )}

        <FormSection title="Dados da empresa">
          <Field label="Nome da empresa" htmlFor="name" error={errors.name?.message} className="sm:col-span-4">
            <Input id="name" placeholder="Nome fantasia ou razão social" {...register("name")} />
          </Field>

          <Field label="CNPJ/CPF" htmlFor="document" error={errors.document?.message} className="sm:col-span-2">
            <Input id="document" inputMode="numeric" {...withMask(register("document"), maskDocument)} />
          </Field>

          <Field label="Telefone" htmlFor="phone" error={errors.phone?.message} className="sm:col-span-2">
            <Input id="phone" inputMode="tel" placeholder="(00) 00000-0000" {...withMask(register("phone"), maskPhone)} />
          </Field>

          <Field label="E-mail" htmlFor="email" error={errors.email?.message} className="sm:col-span-4">
            <Input id="email" type="email" placeholder="contato@suamarcenaria.com" {...register("email")} />
          </Field>
        </FormSection>

        <FormSection title="Logo" description="Aparece no cabeçalho dos orçamentos em PDF. Sem logo, é usado o do WoodKun.">
          <Field label="Logo" htmlFor="logoUrl" error={errors.logoUrl?.message} className="sm:col-span-6">
            {/* Controller: liga ao form um componente que não é <input> nativo (não funciona com register) */}
            <Controller
              control={control}
              name="logoUrl"
              render={({ field }) => <ImageUpload id="logoUrl" value={field.value} onChange={field.onChange} />}
            />
          </Field>
        </FormSection>

        <FormSection title="Endereço" description="Digite o CEP para preencher o endereço automaticamente.">
          <AddressFields />
        </FormSection>

        {saveCompany.error && <p className="text-sm text-destructive">{saveCompany.error.message}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saveCompany.isPending || !isDirty} className="cursor-pointer">
            {saveCompany.isPending ? "Salvando…" : "Salvar"}
          </Button>
          {/* Some assim que algo é alterado de novo */}
          {saveCompany.isSuccess && !isDirty && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CircleCheck className="size-4" />
              Configurações salvas
            </span>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
