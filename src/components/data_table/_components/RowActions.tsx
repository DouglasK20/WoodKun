import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { cn } from "@/utils/cn"

// Ações de uma linha da tabela (editar, excluir…): ícones discretos em cinza, que ganham cor no hover.
// -mr-1.5 compensa o espaço interno do último botão, alinhando o ícone com a borda direita da coluna
export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="-mr-1.5 flex items-center justify-end gap-0.5">{children}</div>
}

const iconButton = "size-8 cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-4"

type RowActionLinkProps = {
  href: string
  title: string
  icon: LucideIcon
  // true: abre em outra aba (ex.: PDF gerado pela API)
  external?: boolean
}

export function RowActionLink({ href, title, icon: Icon, external }: RowActionLinkProps) {
  return (
    <Button variant="ghost" size="icon" asChild title={title} className={iconButton}>
      {external ? (
        <a href={href} target="_blank" rel="noopener" aria-label={title}>
          <Icon />
        </a>
      ) : (
        <Link href={href} aria-label={title}>
          <Icon />
        </Link>
      )}
    </Button>
  )
}

type RowActionButtonProps = {
  title: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  // true: ação destrutiva (excluir) fica vermelha no hover
  destructive?: boolean
}

export function RowActionButton({ title, icon: Icon, onClick, disabled, destructive }: RowActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(iconButton, destructive && "hover:bg-destructive/10 hover:text-destructive")}
    >
      <Icon />
    </Button>
  )
}
