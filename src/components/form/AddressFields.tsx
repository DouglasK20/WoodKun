"use client"

import { useFormContext } from "react-hook-form"
import { LoaderCircle } from "lucide-react"

import { Field } from "@/components/form/Field"
import { NativeSelect } from "@/components/form/NativeSelect"
import { Input } from "@/components/shadcn/input"
import { BRAZILIAN_STATES } from "@/db/constants"
import { useZipCodeLookup } from "@/hooks/useZipCodeLookup"
import type { AddressInput } from "@/schemas/common"
import { maskZipCode, onlyDigits, withMask } from "@/utils/masks"

// Campos de endereço com busca por CEP. Funciona dentro de qualquer form que tenha os campos de AddressInput
// e esteja envolvido por <FormProvider>: o useFormContext pega o form do pai, sem precisar passar props
export function AddressFields() {
  const {
    register,
    setValue,
    setFocus,
    formState: { errors },
  } = useFormContext<AddressInput>()
  const zipCodeLookup = useZipCodeLookup()

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
        setValue("state", address.state as AddressInput["state"], options)
        // O número a busca não sabe, então o cursor já vai para ele
        setFocus("number")
      },
    })
  }

  return (
    <>
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
    </>
  )
}
