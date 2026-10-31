import { cn } from "@/utils/cn"

type FieldProps = {
  label: string
  htmlFor: string
  error?: string
  className?: string
  children: React.ReactNode
}

// Rótulo + campo + mensagem de erro, usado em todos os formulários
export function Field({ label, htmlFor, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className={cn("text-sm font-medium", error && "text-destructive")}>
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
