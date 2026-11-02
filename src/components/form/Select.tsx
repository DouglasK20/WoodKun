"use client"

import { useEffect, useId, useState } from "react"
import ReactSelect, { createFilter, type MultiValue, type Props as ReactSelectProps, type SingleValue } from "react-select"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/utils/cn"

export type SelectOption = {
  value: string
  label: string
  // Texto menor mostrado embaixo do rótulo, só na lista aberta
  description?: string
}

type CommonProps = {
  id?: string
  options: SelectOption[]
  onBlur?: () => void
  placeholder?: string
  // Mostra a busca dentro do select. Padrão: liga sozinho em listas com mais de 8 opções
  searchable?: boolean
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

// Configuração comum do Select e do MultiSelect: visual do sistema (o "unstyled" tira o CSS da biblioteca e o
// classNames aplica as nossas classes do Tailwind), mensagens em português e menu renderizado no <body>
function useSharedProps<IsMulti extends boolean>({
  id,
  options,
  onBlur,
  searchable = options.length > 8,
  disabled = false,
  invalid = false,
  className,
  "aria-label": ariaLabel,
}: CommonProps): Partial<ReactSelectProps<SelectOption, IsMulti>> {
  // instanceId fixo: o react-select gera ids internos, e sem isso os do servidor e do navegador não batem (erro de hidratação)
  const instanceId = useId()
  // Portal no <body> para o menu não ser cortado por tabelas ou cards com overflow escondido;
  // document só existe no navegador, por isso esperamos o componente montar
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useEffect(() => setPortalTarget(document.body), [])

  return {
    instanceId,
    inputId: id,
    "aria-label": ariaLabel,
    "aria-invalid": invalid,
    options,
    onBlur,
    isSearchable: searchable,
    isDisabled: disabled,
    filterOption,
    noOptionsMessage: () => "Nenhum resultado",
    // Mensagens lidas por leitores de tela (o padrão do react-select é em inglês)
    screenReaderStatus: ({ count }) => `${count} ${count === 1 ? "resultado" : "resultados"}`,
    ariaLiveMessages: {
      guidance: () => "Use as setas para escolher, Enter para selecionar e Esc para fechar.",
      onChange: ({ action, label }) =>
        action === "clear"
          ? "Seleção removida"
          : action === "deselect-option" || action === "remove-value" || action === "pop-value"
            ? `${label} removido`
            : `${label} selecionado`,
      onFocus: ({ label }) => label,
      onFilter: ({ resultsMessage }) => resultsMessage,
    },
    menuPortalTarget: portalTarget,
    menuPosition: "fixed",
    menuPlacement: "auto",
    className,
    unstyled: true,
    components: {
      DropdownIndicator: () => <ChevronDown className="size-4 text-muted-foreground" />,
      ClearIndicator: ({ innerProps }) => (
        <div {...innerProps} className="cursor-pointer rounded p-0.5 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </div>
      ),
      IndicatorSeparator: null,
    },
    // Na lista aberta: rótulo, descrição e um ✓ nas opções selecionadas
    formatOptionLabel: (option, { context, selectValue }) =>
      context === "menu" ? (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div>{option.label}</div>
            {option.description && <div className="text-xs text-muted-foreground">{option.description}</div>}
          </div>
          {selectValue.some((selected) => selected.value === option.value) && (
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          )}
        </div>
      ) : (
        option.label
      ),
    classNames: {
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
      // Etiquetas do MultiSelect (modo com etiquetas)
      multiValue: () => "flex items-center gap-1 rounded bg-accent py-0.5 pl-2 pr-1 text-xs",
      multiValueRemove: () => "rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
      input: () => "text-foreground",
      indicatorsContainer: () => "gap-1.5 pl-2",
      menuPortal: () => "!z-50",
      // min-w: selects estreitos (como a UF) ainda abrem um menu legível
      menu: () => "mt-1 min-w-48 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
      menuList: () => "max-h-64 p-1",
      option: ({ isFocused, isSelected }) =>
        cn("cursor-pointer rounded-sm px-2 py-1.5 text-sm", isFocused && "bg-accent", isSelected && "font-medium text-primary"),
      noOptionsMessage: () => "px-2 py-3 text-sm text-muted-foreground",
    },
  }
}

type SelectProps = CommonProps & {
  // "" = nada selecionado
  value: string
  onChange: (value: string) => void
  // Mostra o "x" para limpar a seleção
  clearable?: boolean
}

// Seleção de uma opção, com busca
export function Select({ value, onChange, placeholder = "Selecione…", clearable = false, ...common }: SelectProps) {
  const shared = useSharedProps<false>(common)
  const selected = common.options.find((option) => option.value === value) ?? null

  return (
    <ReactSelect<SelectOption, false>
      {...shared}
      value={selected}
      onChange={(option: SingleValue<SelectOption>) => onChange(option?.value ?? "")}
      placeholder={placeholder}
      isClearable={clearable}
    />
  )
}

type MultiSelectProps = CommonProps & {
  value: string[]
  onChange: (value: string[]) => void
  // true: mostra um resumo em texto ("Enviado, Aprovado" / "3 selecionados") em vez de etiquetas.
  // Bom para barras de filtro, onde o campo não pode crescer
  summary?: boolean
  // Texto do resumo quando há muitas opções marcadas. Padrão: "3 selecionados"
  summaryLabel?: (count: number) => string
}

// Seleção de várias opções. O menu fica aberto enquanto se marca, e cada opção marcada mostra um ✓
export function MultiSelect({
  value,
  onChange,
  placeholder = "Selecione…",
  summary = false,
  summaryLabel = (count) => `${count} selecionados`,
  ...common
}: MultiSelectProps) {
  const shared = useSharedProps<true>(common)
  const selected = common.options.filter((option) => value.includes(option.value))
  const summaryText = selected.length <= 2 ? selected.map((option) => option.label).join(", ") : summaryLabel(selected.length)

  return (
    <ReactSelect<SelectOption, true>
      {...shared}
      isMulti
      value={selected}
      onChange={(options: MultiValue<SelectOption>) => onChange(options.map((option) => option.value))}
      // Não some com as opções marcadas da lista: elas ficam com ✓ e um clique desmarca
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      isClearable
      // Modo resumo: em vez das etiquetas, o texto vai no lugar do placeholder
      controlShouldRenderValue={!summary}
      placeholder={summary && selected.length > 0 ? summaryText : placeholder}
      classNames={{
        ...shared.classNames,
        placeholder: () => cn("truncate", summary && selected.length > 0 ? "text-foreground" : "text-muted-foreground"),
      }}
    />
  )
}
