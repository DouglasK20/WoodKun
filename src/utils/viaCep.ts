import { onlyDigits } from "./masks"

// ViaCEP: API pública e gratuita de CEPs (https://viacep.com.br)

type ViaCepResponse = {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean | "true"
}

export type AddressFromZipCode = {
  street: string
  neighborhood: string
  city: string
  state: string
}

export async function fetchAddressByZipCode(zipCode: string): Promise<AddressFromZipCode> {
  // fetch simples, sem headers extras: é uma API de outro domínio e isso evita requisição de preflight (CORS)
  const response = await fetch(`https://viacep.com.br/ws/${onlyDigits(zipCode)}/json/`)
  if (!response.ok) throw new Error("Não foi possível buscar o CEP")

  const data: ViaCepResponse = await response.json()
  // CEP com formato válido mas inexistente volta 200 com { erro: true }
  if (data.erro) throw new Error("CEP não encontrado")

  return {
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
  }
}
