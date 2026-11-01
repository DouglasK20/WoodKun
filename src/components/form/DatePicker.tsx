"use client"

import "react-day-picker/style.css"
import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { ptBR } from "react-day-picker/locale/pt-BR"
import { addDays, format, parseISO } from "date-fns"
import { CalendarDays, X } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { cn } from "@/utils/cn"

// Atalho no topo do calendário, ex.: { label: "Em 30 dias", days: 30 }
export type DatePreset = { label: string; days: number }

type DatePickerProps = {
  id?: string
  // "AAAA-MM-DD" (mesmo formato do banco e do schema) ou "" sem data
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  presets?: DatePreset[]
  invalid?: boolean
}

const toValue = (date: Date) => format(date, "yyyy-MM-dd")

// Campo de data com calendário próprio (react-day-picker dentro de um Popover), no lugar do <input type="date">
// que muda de visual em cada navegador. As cores do calendário ficam no globals.css (.rdp-root)
export function DatePicker({ id, value, onChange, onBlur, placeholder = "Selecione uma data", presets, invalid }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseISO(value) : undefined

  function choose(date: Date | undefined) {
    onChange(date ? toValue(date) : "")
    setOpen(false)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <div className="relative">
        <Popover.Trigger asChild>
          <button
            id={id}
            type="button"
            className={cn(
              "flex h-10 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 text-left text-base transition-shadow md:text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
              invalid && "border-destructive"
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span className={cn("flex-1", !selected && "text-muted-foreground")}>
              {selected ? format(selected, "dd/MM/yyyy") : placeholder}
            </span>
          </button>
        </Popover.Trigger>
        {/* Fora do botão do calendário: clicar no "x" limpa sem abrir o calendário */}
        {selected && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpar data"
            title="Limpar data"
            className="absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Portal: o calendário é desenhado no <body>, por cima de cards e tabelas */}
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg"
        >
          {presets && presets.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5 border-b border-border pb-3">
              {presets.map((preset) => (
                <Button
                  key={preset.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer text-xs"
                  onClick={() => choose(addDays(new Date(), preset.days))}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          <DayPicker
            mode="single"
            locale={ptBR}
            selected={selected}
            onSelect={choose}
            defaultMonth={selected}
            showOutsideDays
            autoFocus
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
