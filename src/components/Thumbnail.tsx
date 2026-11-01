import Image from "next/image"
import { ImageIcon } from "lucide-react"

// Miniatura quadrada para tabelas; sem imagem mostra um ícone
export function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
      {src ? (
        // next/image gera uma versão pequena da imagem (sizes), em vez de baixar o arquivo original inteiro
        <Image src={src} alt={alt} fill sizes="40px" className="object-cover" />
      ) : (
        <ImageIcon className="size-4 text-muted-foreground" />
      )}
    </div>
  )
}
