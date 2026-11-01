import { readImage } from "@/services/uploadService"
import { notFound } from "@/utils/api"

type RouteContext = {
  params: Promise<{ fileName: string }>
}

// GET /api/uploads/:fileName
export async function GET(_request: Request, { params }: RouteContext) {
  const image = await readImage((await params).fileName)
  if (!image) return notFound("Imagem não encontrada")

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      // O nome é único e o arquivo nunca muda, então o navegador pode guardar em cache para sempre
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
