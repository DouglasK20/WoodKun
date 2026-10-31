import { onlyDigits } from "./masks"

// Validação dos dígitos verificadores de CPF e CNPJ (pega erros de digitação)

function isValidCpf(digits: string) {
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  const checkDigit = (length: number) => {
    let sum = 0
    for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i)
    return ((sum * 10) % 11) % 10
  }

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10])
}

function isValidCnpj(digits: string) {
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false

  const checkDigit = (weights: number[]) => {
    const sum = weights.reduce((total, weight, i) => total + Number(digits[i]) * weight, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  return (
    checkDigit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[12]) &&
    checkDigit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[13])
  )
}

// Aceita com ou sem máscara
export function isValidDocument(value: string) {
  const digits = onlyDigits(value)
  return digits.length === 11 ? isValidCpf(digits) : isValidCnpj(digits)
}
