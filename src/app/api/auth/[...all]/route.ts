import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/services/auth"

// Todas as rotas do Better Auth (/api/auth/sign-in/email, /api/auth/sign-out, /api/auth/admin/…) passam por aqui
export const { GET, POST } = toNextJsHandler(auth)
