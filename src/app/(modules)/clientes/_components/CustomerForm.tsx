"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"

import { Field } from "@/components/form/Field"
import { FormSection } from "@/components/form/FormSection"
import { NativeSelect } from "@/components/form/NativeSelect"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Textarea } from "@/components/shadcn/textarea"
import { BRAZILIAN_STATES } from "@/db/constants"
import { useCustomer, useSaveCustomer, type CustomerResponse } from "@/hooks/queries/useCustomers"
import { useZipCodeLookup } from "@/hooks/useZipCodeLookup"
import { customerSchema, type CustomerInput } from "@/schemas/customer"
import { ApiError } from "@/utils/apiClient"
import { maskDocument, maskPhone, maskZipCode, onlyDigits, withMask } from "@/utils/masks"

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
  return <CustomerFormFields customer={customer} />
}

function CustomerFormFields({ customer }: { customer?: CustomerResponse }) {
  const router = useRouter()
  const saveCustomer = useSaveCustomer()
  const zipCodeLookup = useZipCodeLookup()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<CustomerInput>({
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

  const zipCodeField = withMask(register("zipCode"), maskZipCode)

  // Ao completar os 8 dígitos do CEP, busca o endereço e preenche os campos
  function handleZipCodeChange(value: string) {
    if (onlyDigits(value).length !== 8) return

    zipCodeLookup.mutate(value, {
      onSuccess: (address) => {
        const options = { shouldValidate: true, shouldDirty: true }
        if (address.street) setValue("street", address.street, options)
        if (address.neighborhood) setValue("neighborhood", address.neighborhood, options)
        setValue("city", address.city, options)
        setValue("state", address.state as CustomerInput["state"], options)
        // O número a busca não sabe, então o cursor já vai para ele
        setFocus("number")
      },
    })
  }

  // Só é chamado se a validação do zod passar
  function onSubmit(values: CustomerInput) {
    saveCustomer.mutate(
      { id: customer?.id, values },
      {
        onSuccess: () => router.push("/clientes"),
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
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
        <Field
          label="CEP"
          htmlFor="zipCode"
          error={errors.zipCode?.message ?? zipCodeLookup.error?.message}
          className="sm:col-span-2"
        >
          <div className="relative">
            <Input
              id="zipCode"
              inputMode="numeric"
              placeholder="00000-000"
              {...zipCodeField}
              onChange={(event) => {
                zipCodeField.onChange(event)
                handleZipCodeChange(event.target.value)
              }}
            />
            {zipCodeLookup.isPending && (
              <LoaderCircle className="absolute right-3 top-3 size-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </Field>

        <Field label="Rua" htmlFor="street" error={errors.street?.message} className="sm:col-span-4">
          <Input id="street" {...register("street")} />
        </Field>

        <Field label="Número" htmlFor="number" error={errors.number?.message} className="sm:col-span-2">
          <Input id="number" {...register("number")} />
        </Field>

        <Field label="Complemento" htmlFor="complement" error={errors.complement?.message} className="sm:col-span-4">
          <Input id="complement" placeholder="Apto, bloco, referência…" {...register("complement")} />
        </Field>

        <Field label="Bairro" htmlFor="neighborhood" error={errors.neighborhood?.message} className="sm:col-span-2">
          <Input id="neighborhood" {...register("neighborhood")} />
        </Field>

        <Field label="Cidade" htmlFor="city" error={errors.city?.message} className="sm:col-span-3">
          <Input id="city" {...register("city")} />
        </Field>

        <Field label="UF" htmlFor="state" error={errors.state?.message} className="sm:col-span-1">
          <NativeSelect id="state" {...register("state")}>
            <option value="">—</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </FormSection>

      <FormSection title="Observações">
        <Field label="Observações" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-6">
          <Textarea id="notes" rows={3} placeholder="Preferências, indicação, melhor horário para contato…" {...register("notes")} />
        </Field>
      </FormSection>

      {saveCustomer.error && <p className="text-sm text-destructive">{saveCustomer.error.message}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saveCustomer.isPending} className="cursor-pointer">
          {saveCustomer.isPending ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/clientes">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
