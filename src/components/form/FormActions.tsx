import Link from "next/link"
import { Button } from "@/components/shadcn/button"
import { cn } from "@/utils/cn"

// "stay" = salvar e continuar na página; "back" = salvar e voltar para a listagem
export type SaveIntent = "stay" | "back"

type FormActionsProps = {
  // Salvando agora (desabilita os botões)
  pending: boolean
  // Qual botão foi clicado, para mostrar "Salvando…" nele
  intent: SaveIntent
  // "Salvar e voltar": o form chama handleSubmit com intent "back" (o "Salvar" é o submit normal, também acionado pelo Enter)
  onSaveAndBack: () => void
  cancelHref: string
  // "row": botões lado a lado (formulários simples); "stacked": para a coluna lateral de produto e orçamento
  layout?: "row" | "stacked"
}

export function FormActions({ pending, intent, onSaveAndBack, cancelHref, layout = "row" }: FormActionsProps) {
  const stacked = layout === "stacked"

  return (
    <div className={cn("flex gap-2", stacked ? "flex-col" : "flex-wrap items-center")}>
      <Button type="submit" disabled={pending} className={cn("cursor-pointer", stacked && "w-full")}>
        {pending && intent === "stay" ? "Salvando…" : "Salvar"}
      </Button>
      <div className={cn("flex gap-2", stacked && "w-full")}>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onSaveAndBack}
          className={cn("cursor-pointer", stacked && "flex-1")}
        >
          {pending && intent === "back" ? "Salvando…" : "Salvar e voltar"}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
      </div>
    </div>
  )
}
