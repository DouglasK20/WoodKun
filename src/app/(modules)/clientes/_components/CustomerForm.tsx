"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AddressFields } from "@/components/form/AddressFields"
import { Field } from "@/components/form/Field"
import { FormActions, type SaveIntent } from "@/components/form/FormActions"
import { FormSection } from "@/components/form/FormSection"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Textarea } from "@/components/shadcn/textarea"
import { useCustomer, useSaveCustomer, type CustomerResponse } from "@/hooks/queries/useCustomers"
import { customerSchema, type CustomerInput } from "@/schemas/customer"
import { ApiError } from "@/utils/apiClient"
import { maskDocument, maskPhone, withMask } from "@/utils/masks"

type CustomerFormProps = {
  customerId?: number
}

export function CustomerForm({ customerId }: CustomerFormProps) {
  const { data: customer, isLoading, error } = useCustomer(customerId)

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-5">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button variant="outline" asChild>
          <Link href="/clientes">Voltar para clientes</Link>
        </Button>
      </div>
    )
  }

  // Só monta o formulário depois de ter os dados, porque o react-hook-form lê os defaultValues uma vez só
  return <CustomerFormFields key={customer?.id ?? "novo"} customer={customer} />
}

function CustomerFormFields({ customer }: { customer?: CustomerResponse }) {
  const router = useRouter()
  const [intent, setIntent] = useState<SaveIntent>("stay")
  const saveCustomer = useSaveCustomer()

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    // O banco guarda null, mas os inputs trabalham com string
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      document: customer?.document ?? "",
      zipCode: customer?.zipCode ?? "",
      street: customer?.street ?? "",
      number: customer?.number ?? "",
      complement: customer?.complement ?? "",
      neighborhood: customer?.neighborhood ?? "",
      city: customer?.city ?? "",
      state: (customer?.state as CustomerInput["state"]) ?? "",
      notes: customer?.notes ?? "",
    },
  })
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form

  // Só é chamado se a validação do zod passar
  // "stay": continua na página; "back": volta para a listagem
  function onSubmit(values: CustomerInput, saveIntent: SaveIntent) {
    setIntent(saveIntent)
    saveCustomer.mutate(
      { id: customer?.id, values },
      {
        onSuccess: (saved) => {
          toast.success(customer ? "Cliente atualizado" : "Cliente cadastrado")
          if (saveIntent === "back") router.push("/clientes")
          // Cadastro novo: a página vira a edição do registro criado (salvar de novo atualiza, não duplica)
          else if (!customer) router.replace(`/clientes/cadastro?id=${saved.id}`)
          // Edição: o form passa a considerar o que foi salvo como "sem alterações"
          else reset(values)
        },
        onError: (error) => {
          // Se a API recusou algum campo (400), mostra o erro embaixo do campo
          if (error instanceof ApiError && error.fieldErrors) {
            for (const [field, messages] of Object.entries(error.fieldErrors)) {
              if (messages?.[0]) setError(field as keyof CustomerInput, { message: messages[0] })
            }
          }
        },
      }
    )
  }

  return (
    // FormProvider: deixa o form disponível para componentes filhos (AddressFields) via useFormContext
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit((values) => onSubmit(values, "stay"))} className="max-w-3xl space-y-6">
        <FormSection title="Dados do cliente">
          <Field label="Nome" htmlFor="name" error={errors.name?.message} className="sm:col-span-4">
            <Input id="name" placeholder="Nome completo ou razão social" {...register("name")} />
          </Field>

          <Field label="CPF/CNPJ" htmlFor="document" error={errors.document?.message} className="sm:col-span-2">
            <Input id="document" inputMode="numeric" {...withMask(register("document"), maskDocument)} />
          </Field>

          <Field label="Telefone" htmlFor="phone" error={errors.phone?.message} className="sm:col-span-2">
            <Input
              id="phone"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              {...withMask(register("phone"), maskPhone)}
            />
          </Field>

          <Field label="E-mail" htmlFor="email" error={errors.email?.message} className="sm:col-span-4">
            <Input id="email" type="email" placeholder="cliente@email.com" {...register("email")} />
          </Field>
        </FormSection>

        <FormSection title="Endereço" description="Digite o CEP para preencher o endereço automaticamente.">
          <AddressFields />
        </FormSection>

        <FormSection title="Observações">
          <Field label="Observações" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-6">
            <Textarea id="notes" rows={3} placeholder="Preferências, indicação, melhor horário para contato…" {...register("notes")} />
          </Field>
        </FormSection>

        {saveCustomer.error && <p className="text-sm text-destructive">{saveCustomer.error.message}</p>}

        <FormActions
          pending={saveCustomer.isPending}
          intent={intent}
          onSaveAndBack={handleSubmit((values) => onSubmit(values, "back"))}
          cancelHref="/clientes"
        />
      </form>
    </FormProvider>
  )
}
