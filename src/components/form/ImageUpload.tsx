"use client"

import { useRef } from "react"
import Image from "next/image"
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import { useUploadImage } from "@/hooks/queries/useUploadImage"
import { ApiError } from "@/utils/apiClient"

type ImageUploadProps = {
  id?: string
  // URL da imagem ("" = sem imagem)
  value: string
  onChange: (url: string) => void
}

// A API devolve o motivo específico (formato, tamanho) em fieldErrors.file; a mensagem geral é só "Dados inválidos"
function uploadErrorMessage(error: Error) {
  return (error instanceof ApiError && error.fieldErrors?.file?.[0]) || error.message
}

// Escolher/trocar/remover imagem. O upload acontece na hora; o form só guarda a URL devolvida pela API
export function ImageUpload({ id, value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  function handleFile(file: File | undefined) {
    if (!file) return
    upload.mutate(file, { onSuccess: ({ url }) => onChange(url) })
    // Limpa o input para conseguir escolher o mesmo arquivo de novo, se quiser
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {value ? (
          <Image src={value} alt="Imagem selecionada" fill sizes="96px" className="object-cover" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" />
        )}
        {upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Trocar imagem" : "Escolher imagem"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer text-destructive hover:text-destructive"
              onClick={() => onChange("")}
            >
              <Trash2 />
              Remover
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, até 5 MB.</p>
        {upload.error && <p className="text-xs text-destructive">{uploadErrorMessage(upload.error)}</p>}
      </div>

      {/* Input de arquivo escondido: o botão acima abre o seletor */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  )
}
