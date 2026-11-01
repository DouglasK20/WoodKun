"use client"

import { useEffect, useId, useState } from "react"
import ReactSelect, { createFilter, type SingleValue } from "react-select"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/utils/cn"

export type SelectOption = {
  value: string
  label: string
  // Texto menor mostrado embaixo do rótulo, só na lista aberta
  description?: string
}

type SelectProps = {
  id?: string
  options: SelectOption[]
  // "" = nada selecionado
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  // Mostra a busca dentro do select. Padrão: liga sozinho em listas com mais de 8 opções
  searchable?: boolean
  // Mostra o "x" para limpar a seleção
  clearable?: boolean
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-label"?: string
}

// A busca procura no rótulo e na descrição, sem diferenciar maiúsculas nem acentos ("sao" acha "São Paulo")
const filterOption = createFilter<SelectOption>({
  ignoreAccents: true,
  ignoreCase: true,
  stringify: (option) => `${option.label} ${option.data.description ?? ""}`,
})

// Select com busca (react-select) no visual do sistema. O "unstyled" tira o CSS da biblioteca
// e o classNames aplica as nossas classes do Tailwind (mesmas cores do Input)
export function Select({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Selecione…",
  searchable = options.length > 8,
  clearable = false,
  disabled = false,
  invalid = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  // instanceId fixo: o react-select gera ids internos, e sem isso os do servidor e do navegador não batem (erro de hidratação)
  const instanceId = useId()
  // O menu é renderizado no <body> (portal) para não ser cortado por tabelas ou cards com overflow escondido;
  // document só existe no navegador, por isso esperamos o componente montar
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useEffect(() => setPortalTarget(document.body), [])

  const selected = options.find((option) => option.value === value) ?? null

  return (
    <ReactSelect<SelectOption, false>
      instanceId={instanceId}
      inputId={id}
      aria-label={ariaLabel}
      aria-invalid={invalid}
      options={options}
      value={selected}
      onChange={(option: SingleValue<SelectOption>) => onChange(option?.value ?? "")}
      onBlur={onBlur}
      placeholder={placeholder}
      isSearchable={searchable}
      isClearable={clearable}
      isDisabled={disabled}
      filterOption={filterOption}
      noOptionsMessage={() => "Nenhum resultado"}
      // Mensagens lidas por leitores de tela (o padrão do react-select é em inglês)
      screenReaderStatus={({ count }) => `${count} ${count === 1 ? "resultado" : "resultados"}`}
      ariaLiveMessages={{
        guidance: () => "Use as setas para escolher, Enter para selecionar e Esc para fechar.",
        onChange: ({ action, label }) => (action === "clear" ? "Seleção removida" : `${label} selecionado`),
        onFocus: ({ label }) => label,
        onFilter: ({ resultsMessage }) => resultsMessage,
      }}
      menuPortalTarget={portalTarget}
      menuPosition="fixed"
      menuPlacement="auto"
      className={className}
      unstyled
      components={{
        DropdownIndicator: () => <ChevronDown className="size-4 text-muted-foreground" />,
        ClearIndicator: ({ innerProps }) => (
          <div {...innerProps} className="cursor-pointer rounded p-0.5 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </div>
        ),
        IndicatorSeparator: null,
      }}
      formatOptionLabel={(option, { context }) =>
        context === "menu" ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div>{option.label}</div>
              {option.description && <div className="text-xs text-muted-foreground">{option.description}</div>}
            </div>
            {option.value === value && <Check className="mt-0.5 size-4 shrink-0 text-primary" />}
          </div>
        ) : (
          option.label
        )
      }
      classNames={{
        control: ({ isFocused, isDisabled }) =>
          cn(
            "min-h-10 w-full rounded-md border border-input bg-card px-3 text-base md:text-sm transition-shadow",
            isFocused && "ring-2 ring-ring ring-offset-2 ring-offset-background",
            isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            invalid && "border-destructive"
          ),
        valueContainer: () => "gap-1 py-1.5",
        placeholder: () => "text-muted-foreground",
        singleValue: () => "text-foreground",
        input: () => "text-foreground",
        indicatorsContainer: () => "gap-1.5 pl-2",
        menuPortal: () => "!z-50",
        // min-w: selects estreitos (como a UF) ainda abrem um menu legível
        menu: () => "mt-1 min-w-48 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
        menuList: () => "max-h-64 p-1",
        option: ({ isFocused, isSelected }) =>
          cn(
            "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
            isFocused && "bg-accent",
            isSelected && "font-medium text-primary"
          ),
        noOptionsMessage: () => "px-2 py-3 text-sm text-muted-foreground",
      }}
    />
  )
}
