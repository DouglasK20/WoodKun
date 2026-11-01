// Sessão do usuário logado (só no servidor: route handlers e server components)
import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "./auth"

// cache(): dentro da mesma requisição, várias chamadas consultam o banco uma vez só
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }))

export async function getCurrentUser() {
  return (await getSession())?.user ?? null
}
