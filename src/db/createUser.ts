// Cria um usuário pelo terminal (use para criar o primeiro administrador). Rodar com: npm run user:create
// Pergunta os dados, ou recebe por argumento: npm run user:create -- --name "Ana" --email ana@x.com --password ... --role sales
import { stdin as input, stdout as output } from "node:process"
import { createInterface } from "node:readline/promises"
import { parseArgs } from "node:util"
import { auth } from "@/services/auth"
import { ROLES, ROLE_LABEL, type Role } from "@/utils/permissions"

async function main() {
  const { values: args } = parseArgs({
    options: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" }, role: { type: "string" } },
  })

  // Só pergunta o que não veio por argumento
  const rl = createInterface({ input, output })
  const ask = async (value: string | undefined, question: string) => value ?? (await rl.question(question))

  const name = (await ask(args.name, "Nome: ")).trim()
  const email = (await ask(args.email, "E-mail: ")).trim().toLowerCase()
  const password = await ask(args.password, "Senha (mínimo 8 caracteres): ")
  const roleOptions = ROLES.map((role) => `${role} (${ROLE_LABEL[role]})`).join(", ")
  const role = ((await ask(args.role, `Papel [${roleOptions}] (padrão: admin): `)).trim() || "admin") as Role
  rl.close()

  if (!ROLES.includes(role)) throw new Error(`Papel inválido: ${role}`)

  // Chamada direta no servidor: não passa pela API HTTP, então não precisa de um admin logado
  await auth.api.createUser({ body: { name, email, password, role } })
  console.log(`Usuário ${email} criado como ${ROLE_LABEL[role]}.`)
  process.exit(0)
}

main().catch((error) => {
  console.error(`Erro: ${error.body?.message ?? error.message}`)
  process.exit(1)
})
