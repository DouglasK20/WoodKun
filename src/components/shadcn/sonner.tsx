"use client"

import { CircleAlert, CircleCheck, Info, LoaderCircle } from "lucide-react"
import { Toaster as Sonner } from "sonner"

// Toasts (avisos rápidos de "salvo", "excluído", erro…) no visual do sistema.
// Uso: import { toast } from "sonner"; toast.success("Material salvo")
export function Toaster() {
  return (
    <Sonner
      // Centralizado no topo: aparece no meio do cabeçalho, que é vazio, sem cobrir botões
      position="top-center"
      offset={{ top: 14 }}
      mobileOffset={{ top: 12 }}
      closeButton
      // Ícone + texto: o tipo do aviso não depende só da cor
      icons={{
        success: <CircleCheck className="size-4 text-success" />,
        error: <CircleAlert className="size-4 text-destructive" />,
        info: <Info className="size-4 text-info" />,
        loading: <LoaderCircle className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!bg-card !text-foreground !border !border-border !shadow-lg !rounded-lg !font-sans",
          title: "!text-sm !font-medium",
          description: "!text-xs !text-muted-foreground",
          closeButton: "!bg-card !border-border !text-muted-foreground hover:!text-foreground",
          error: "!border-destructive/30",
        },
      }}
    />
  )
}
