# WoodKun

Sistema de orçamentos para marcenaria. Next.js 15 (App Router) + React 19, Tailwind 4 + shadcn, Drizzle ORM + MySQL, react-hook-form + zod, TanStack Query (React Query).

## Comandos

- `cp .env.example .env` — cria o `.env` local (primeira vez)
- `docker compose up -d` — sobe o MySQL (porta **3307**, banco `woodkun`)
- `npm run dev` — servidor de desenvolvimento
- `npm run db:generate` — gera migration a partir de `src/db/schema.ts` (commitar a pasta `drizzle/`)
- `npm run db:migrate` — aplica as migrations
- `npm run db:seed` — insere dados de exemplo (só em tabelas vazias)
- `npm run db:studio` — interface para ver o banco

## Idioma

- **Código em inglês**: nomes de arquivos, variáveis, funções, componentes, tipos, props e chaves de objetos (`saveMaterial`, `MaterialsTable.tsx`, `unitPrice`).
- **Banco em inglês**: tabelas e colunas em inglês, snake_case (`materials`, `unit_price`).
- **Português** apenas no que o usuário vê ou lê:
  - textos da interface e mensagens de validação/erro;
  - **pastas de rota das telas**, porque viram a URL (`/materiais`, `/clientes`, `/materiais/cadastro`);
  - comentários no código.
- Rotas da **API** ficam em inglês (`/api/materials`), pois não são vistas pelo usuário.

## Rotas e telas

Cada módulo segue o mesmo padrão de URL:

- `/<modulo>` — listagem
- `/<modulo>/cadastro` — cadastro de um novo registro
- `/<modulo>/cadastro?id=1` — edição do registro 1

Não criar rotas dinâmicas `[id]` para edição: a página `cadastro/page.tsx` lê `searchParams.id`, busca o registro (chamando `notFound()` se o id for inválido ou não existir) e passa para o mesmo formulário.

## Arquitetura

Fluxo dos dados (use materiais como referência):

```
tela (client) → hook React Query → apiFetch → API REST → service → Drizzle → MySQL
```

| Camada | Onde | O que faz |
|---|---|---|
| Schema | `src/schemas/<entity>.ts` | schema zod + tipo `<Entity>Input`. Usado no form E na API |
| Service | `src/services/<entity>Service.ts` | único lugar que acessa o banco para a entidade. Só no servidor |
| API | `src/app/api/<entities>/route.ts` e `[id]/route.ts` | valida com o schema e chama o service |
| Hooks | `src/hooks/queries/use<Entities>.ts` | `useQuery`/`useMutation` que chamam a API |
| Tela | `src/app/(modules)/<modulo>/` | componentes que usam os hooks |

- **Não usar server actions** nem acessar `db`/services a partir de páginas e componentes; todo dado passa pela API.
- **Não usar `fetch` direto nos componentes**: sempre via hook em `src/hooks/queries/`, usando `apiFetch` de `src/utils/apiClient.ts` (lança `ApiError` em respostas 4xx/5xx).
- Mutations invalidam a chave da entidade (`invalidateQueries({ queryKey: ["materials"] })`) no `onSuccess`.
- Tipos de resposta usam `Json<T>` (datas viram string no JSON).

### API REST

| Método | Rota | Sucesso | Erros |
|---|---|---|---|
| GET | `/api/<entities>` | 200 lista | |
| POST | `/api/<entities>` | 201 registro criado | 400 |
| GET | `/api/<entities>/:id` | 200 registro | 404 |
| PUT | `/api/<entities>/:id` | 200 registro atualizado | 400, 404 |
| DELETE | `/api/<entities>/:id` | 204 | 404, 409 (em uso) |

- Erros sempre como `{ error: string }`; validação (400) também traz `fieldErrors` (`z.flattenError`), que o form exibe embaixo de cada campo.
- Helpers em `src/utils/api.ts`: `parseId`, `parseBody` (lê JSON + valida), `notFound`.

### Estrutura de um módulo (tela)

```
materiais/
  page.tsx                  listagem (só estrutura; dados vêm do hook)
  cadastro/page.tsx         lê ?id= e passa para o form
  _components/
    <Entity>Form.tsx        busca o registro (se ?id=), mostra loading/erro, form com react-hook-form + zodResolver
    <Entities>Table.tsx     usa o hook de listagem, mostra skeleton/erro e o DataTable
    columns.tsx             colunas do TanStack Table (ações de excluir usam o hook de mutation)
```

- Botões da listagem (ex.: "Novo …") vão na prop `toolbarActions` do `DataTable`, na mesma linha da busca.

### Formulários

- Use `Field` (rótulo + campo + erro) e `NativeSelect` de `src/components/form/`; não recriar esses componentes dentro do módulo.
- Campos opcionais trafegam como `""` no form e na API; o service converte `""` em `null` antes de salvar.
- Máscaras em `src/utils/masks.ts` (`maskPhone`, `maskDocument`, `maskZipCode`), aplicadas com `{...withMask(register("campo"), mask)}`.
- CPF/CNPJ validados com `isValidDocument` (`src/utils/documents.ts`), que confere os dígitos verificadores.
- Busca de endereço por CEP: hook `useZipCodeLookup` (ViaCEP).

## Migrations

- Nunca apagar ou editar uma migration já commitada; toda mudança no schema gera uma migration nova (`npm run db:generate -- --name <descricao>`).
- Para renomear ou trocar colunas sem o `drizzle-kit` parar com uma pergunta interativa, divida em duas migrations: primeiro só adiciona as colunas novas, depois só remove as antigas.

## Dados

- Dinheiro sempre `decimal(10,2)` com `mode: "number"`, nunca `float`.
- Itens de orçamento guardam cópia de descrição, unidade e preço do momento; não depender do preço atual do material.
- Enums e labels de exibição ficam em `src/db/constants.ts` (sem importar Drizzle, para poder usar em componentes client).
- Formatação de valores: `formatCurrency` em `src/utils/format.ts`.

## Estilo

- Cores definidas como tokens no `:root` de `src/styles/globals.css`. Usar os tokens do shadcn (`bg-primary`, `border-border`, `text-muted-foreground`, `bg-card`…), não cores fixas do Tailwind nem as classes antigas `wood-*`.
- Sidebar escura (marrom café), conteúdo em creme suave, tabelas e inputs em branco (`bg-card`), marrom (`primary`) só para destaque.
