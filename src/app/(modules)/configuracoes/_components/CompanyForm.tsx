"use client"

import { useState } from "react"
import { Controller, FormProvider, useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AddressFields } from "@/components/form/AddressFields"
import { Field } from "@/components/form/Field"
import { FormSection } from "@/components/form/FormSection"
import { ImageUpload } from "@/components/form/ImageUpload"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs"
import { Textarea } from "@/components/shadcn/textarea"
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
    defaultValidityDays: company?.defaultValidityDays ?? null,
    paymentTerms: company?.paymentTerms ?? "",
    deliveryTerms: company?.deliveryTerms ?? "",
  }
}

// Abas da tela e os campos de cada uma (para achar a aba de um erro de validação)
const TABS = [
  { value: "empresa", label: "Informações da empresa", fields: ["name", "document", "phone", "email", "logoUrl"] },
  { value: "endereco", label: "Endereço", fields: ["zipCode", "street", "number", "complement", "neighborhood", "city", "state"] },
  { value: "orcamentos", label: "Orçamentos", fields: ["defaultValidityDays", "paymentTerms", "deliveryTerms"] },
] as const satisfies readonly { value: string; label: string; fields: readonly (keyof CompanyInput)[] }[]

type TabValue = (typeof TABS)[number]["value"]

const tabHasError = (tab: (typeof TABS)[number], errors: FieldErrors<CompanyInput>) =>
  tab.fields.some((field) => errors[field])

function CompanyFormFields({ company }: { company: CompanyResponse | null }) {
  const saveCompany = useSaveCompany()
  const [activeTab, setActiveTab] = useState<TabValue>("empresa")

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

  // Um erro numa aba fechada ficaria invisível: abre a primeira aba que tem erro
  function showFirstTabWithError(formErrors: FieldErrors<CompanyInput>) {
    const tab = TABS.find((item) => tabHasError(item, formErrors))
    if (tab) setActiveTab(tab.value)
  }

  function onSubmit(values: CompanyInput) {
    saveCompany.mutate(values, {
      // reset com o que foi salvo: o form volta a ficar "sem alterações" (isDirty = false)
      onSuccess: (saved) => {
        reset(toFormValues(saved))
        toast.success("Configurações salvas")
      },
      onError: (error) => {
        // Se a API recusou algum campo (400), mostra o erro embaixo do campo
        if (error instanceof ApiError && error.fieldErrors) {
          const apiErrors: FieldErrors<CompanyInput> = {}
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            if (!messages?.[0]) continue
            setError(field as keyof CompanyInput, { message: messages[0] })
            apiErrors[field as keyof CompanyInput] = { type: "server", message: messages[0] }
          }
          showFirstTabWithError(apiErrors)
        }
      },
    })
  }

  return (
    // FormProvider: deixa o form disponível para o AddressFields via useFormContext
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit(onSubmit, showFirstTabWithError)} className="max-w-3xl space-y-6">
        {!company && (
          <p className="rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-info">
            Preencha os dados da sua marcenaria. Eles aparecem no cabeçalho dos orçamentos em PDF.
          </p>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <TabsList className="h-auto flex-wrap">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                {/* Ponto vermelho: esta aba tem campo com erro */}
                {tabHasError(tab, errors) && (
                  <>
                    <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />
                    <span className="sr-only">(contém erros)</span>
                  </>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* forceMount: as abas ficam montadas (só escondidas), então campos e validação seguem funcionando */}
          <TabsContent value="empresa" forceMount className="space-y-6 data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200">
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
          </TabsContent>

          <TabsContent value="endereco" forceMount className="data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200">
            <FormSection title="Endereço" description="Digite o CEP para preencher o endereço automaticamente.">
              <AddressFields />
            </FormSection>
          </TabsContent>

          <TabsContent value="orcamentos" forceMount className="data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200">
            <FormSection
              title="Condições padrão do orçamento"
              description="Já vêm preenchidas em todo orçamento novo e saem no PDF. Dá para alterar em cada orçamento."
            >
              <Field label="Validade padrão (dias)" htmlFor="defaultValidityDays" error={errors.defaultValidityDays?.message} className="sm:col-span-2">
                <Input
                  id="defaultValidityDays"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  placeholder="Ex.: 15"
                  // Vazio = sem validade padrão (null); senão o número de dias
                  {...register("defaultValidityDays", { setValueAs: (value) => (value === "" || value === null ? null : Number(value)) })}
                />
              </Field>

              <Field label="Prazo de entrega" htmlFor="deliveryTerms" error={errors.deliveryTerms?.message} className="sm:col-span-4">
                <Input id="deliveryTerms" placeholder="Ex.: 30 dias úteis após a aprovação do projeto" {...register("deliveryTerms")} />
              </Field>

              <Field label="Forma de pagamento" htmlFor="paymentTerms" error={errors.paymentTerms?.message} className="sm:col-span-6">
                <Textarea
                  id="paymentTerms"
                  rows={2}
                  placeholder="Ex.: 50% na aprovação e 50% na entrega. Pix, boleto ou cartão em até 10x."
                  {...register("paymentTerms")}
                />
              </Field>
            </FormSection>
          </TabsContent>
        </Tabs>

        {saveCompany.error && <p className="text-sm text-destructive">{saveCompany.error.message}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saveCompany.isPending || !isDirty} className="cursor-pointer">
            {saveCompany.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
