import type { UseFormRegisterReturn } from "react-hook-form"

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

// Preenche cada "#" do padrão com um dígito e para quando os dígitos acabam,
// assim a máscara vai aparecendo enquanto a pessoa digita e apagar funciona normalmente
function applyPattern(digits: string, pattern: string) {
  let result = ""
  let index = 0
  for (const char of pattern) {
    if (index >= digits.length) break
    result += char === "#" ? digits[index++] : char
  }
  return result
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11)
  return applyPattern(digits, digits.length <= 10 ? "(##) ####-####" : "(##) #####-####")
}

export function maskDocument(value: string) {
  const digits = onlyDigits(value).slice(0, 14)
  return applyPattern(digits, digits.length <= 11 ? "###.###.###-##" : "##.###.###/####-##")
}

export function maskZipCode(value: string) {
  return applyPattern(onlyDigits(value).slice(0, 8), "#####-###")
}

// Aplica a máscara antes do react-hook-form ler o valor: {...withMask(register("phone"), maskPhone)}
export function withMask(field: UseFormRegisterReturn, mask: (value: string) => string): UseFormRegisterReturn {
  return {
    ...field,
    onChange: (event) => {
      event.target.value = mask(event.target.value)
      return field.onChange(event)
    },
  }
}
