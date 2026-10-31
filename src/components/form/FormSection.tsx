import { cn } from "@/utils/cn"

type FormSectionProps = {
  title: string
  description?: string
  // grid: conteúdo em grid de 6 colunas (cada Field escolhe quantas ocupa com sm:col-span-*)
  grid?: boolean
  className?: string
  children: React.ReactNode
}

// Bloco de formulário com título, usado para separar as partes de formulários grandes
export function FormSection({ title, description, grid = true, className, children }: FormSectionProps) {
  return (
    <section className={cn("space-y-4 rounded-lg border border-border bg-card p-5", className)}>
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {grid ? <div className="grid gap-4 sm:grid-cols-6">{children}</div> : children}
    </section>
  )
}
