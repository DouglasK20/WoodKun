// Salva e apaga imagens enviadas pelo usuário. Usado pela API; nunca importar em componente client
import { randomUUID } from "node:crypto"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

// Fora de public/: o Next só serve em produção o que estava em public/ na hora do build
const UPLOAD_DIR = path.join(process.cwd(), "storage/uploads")
export const UPLOAD_URL_PREFIX = "/api/uploads/"
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5 MB

const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const
type ImageExtension = keyof typeof CONTENT_TYPES

// Nome gerado por nós (uuid + extensão): impede nomes como "../../.env" (path traversal)
const FILE_NAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/

// Descobre o tipo pelos primeiros bytes do arquivo (assinatura), não pela extensão ou pelo que o navegador diz
function detectImageType(bytes: Uint8Array): ImageExtension | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg"
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png"
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp"
  return null
}

export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_UPLOAD_SIZE) return { error: "A imagem deve ter no máximo 5 MB" }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const extension = detectImageType(bytes)
  if (!extension) return { error: "Envie uma imagem JPG, PNG ou WebP" }

  const fileName = `${randomUUID()}.${extension}`
  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(path.join(UPLOAD_DIR, fileName), bytes)

  return { url: `${UPLOAD_URL_PREFIX}${fileName}` }
}

export async function readImage(fileName: string) {
  if (!FILE_NAME_PATTERN.test(fileName)) return null

  try {
    const bytes = await readFile(path.join(UPLOAD_DIR, fileName))
    const extension = fileName.split(".").pop() as ImageExtension
    return { bytes, contentType: CONTENT_TYPES[extension] }
  } catch {
    return null
  }
}

// Lê a imagem a partir da URL "/api/uploads/..." salva no banco
export async function readImageByUrl(url: string | null | undefined) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return null
  return readImage(url.slice(UPLOAD_URL_PREFIX.length))
}

// Apaga a imagem de uma URL "/api/uploads/...". Ignora URLs de fora e arquivos que já não existem
export async function deleteImage(url: string | null | undefined) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return

  const fileName = url.slice(UPLOAD_URL_PREFIX.length)
  if (!FILE_NAME_PATTERN.test(fileName)) return

  await unlink(path.join(UPLOAD_DIR, fileName)).catch(() => {})
}
