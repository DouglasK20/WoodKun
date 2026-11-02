# WoodKun

Sistema de orçamentos para marcenaria. Next.js 15 (App Router) + React 19, Tailwind 4 + shadcn, Drizzle ORM + MySQL, react-hook-form + zod, TanStack Query (React Query).

## Comandos

- `cp .env.example .env` — cria o `.env` local (primeira vez)
- Para instalar pacotes use `npm install <pacote> --legacy-peer-deps`: o `better-auth` declara o SvelteKit como dependência opcional (pede TypeScript 6), o que conflita com o ESLint do projeto. O SvelteKit não é usado aqui.
- `docker compose up -d` — sobe o MySQL (porta **3307**, banco `woodkun`)
- `npm run dev` — servidor de desenvolvimento (Turbopack)
- `npm run db:generate` — gera migration a partir de `src/db/schema.ts` (commitar a pasta `drizzle/`)
- `npm run db:migrate` — aplica as migrations
- `npm run db:seed` — insere dados de exemplo (só em tabelas vazias)
- `npm run db:studio` — interface para ver o banco

## Servidor de desenvolvimento

- Antes de subir um servidor de teste, verificar se já existe um `next dev` rodando neste projeto (`ps -eo command | grep "next dev"`). Se existir, **testar nele** (normalmente `localhost:3000`) em vez de subir outro: dois servidores na mesma pasta `.next` corrompem os arquivos um do outro (erros como `Cannot read properties of undefined (reading 'call')` ou `Cannot find module './vendor-chunks/...'`).
- Pelo mesmo motivo, não rodar `npm run build` enquanto um `next dev` estiver rodando.
- **Dados de teste**: o banco e a pasta `storage/uploads` são os mesmos que o usuário usa. Ao testar, crie registros identificáveis (prefixo `TESTE`) e limpe **só eles** (`where name like 'TESTE%'`, ids/arquivos específicos). Nunca `delete from <tabela>` sem filtro, `truncate` ou apagar a pasta de uploads inteira; antes de mexer numa tabela de uma linha só (`company_settings`), confira o conteúdo e restaure o valor original.
- O shell é zsh: variáveis sem aspas **não** são divididas em várias palavras (`J="-b arquivo"; curl $J` passa um argumento só). Em scripts de teste, passe cada argumento separado e entre aspas.

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

O Início (`/`) é só o painel de indicadores; os orçamentos seguem o padrão (`/orcamentos` e `/orcamentos/cadastro?id=`).

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
- Mutations invalidam a chave da entidade (`invalidateQueries({ queryKey: ["materials"] })`) no `onSuccess`, e também a de entidades cujos dados dependem dela (ex.: salvar material invalida `["products"]`, porque o preço do produto vem dos materiais).
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

- Use `Field` (rótulo + campo + erro), `FormSection` (bloco com título), `Select` (react-select com busca, no visual do sistema), `DatePicker` (calendário; valor "AAAA-MM-DD", aceita `presets` de prazo), `PasswordInput` (senha com olho) e `AddressFields` de `src/components/form/`; não recriar esses componentes dentro do módulo.
- `AddressFields` (endereço + busca de CEP) usa `useFormContext`: o form precisa estar dentro de `<FormProvider {...form}>` e ter os campos de `addressFields`.
- Validações de contato e endereço ficam em `src/schemas/common.ts` (`contactFields`, `addressFields`); reaproveitar com spread no schema da entidade.
- Todo `<form>` usa `noValidate`: quem valida é o zod (mensagens em português embaixo do campo). Sem isso, atributos como `min`/`type="email"` fazem o navegador barrar o envio antes do react-hook-form, com balões próprios (e, em abas escondidas, sem mostrar nada).
- Listas dentro do form (ex.: materiais do produto) usam `useFieldArray`; valores calculados ao vivo usam `useWatch`.
- Datas: sempre o `DatePicker` (nunca `<input type="date">`), ligado com `Controller`. As cores do calendário ficam no fim do `globals.css`, com `body .rdp-root` (o CSS da biblioteca carrega depois e usa os mesmos seletores).
- Selects: sempre o `Select` (nunca `<select>` nativo). Em formulários, ligue com `Controller` (não funciona com `register`). A busca liga sozinha com mais de 8 opções; force com `searchable` em listas que crescem (clientes, materiais, produtos). Valores são texto: converta ids numéricos com `String()` / `Number()`.
- Campos opcionais trafegam como `""` no form e na API; o service converte `""` em `null` antes de salvar.
- Máscaras em `src/utils/masks.ts` (`maskPhone`, `maskDocument`, `maskZipCode`), aplicadas com `{...withMask(register("campo"), mask)}`.
- CPF/CNPJ validados com `isValidDocument` (`src/utils/documents.ts`), que confere os dígitos verificadores.
- Busca de endereço por CEP: hook `useZipCodeLookup` (ViaCEP).

## Migrations

- Nunca apagar ou editar uma migration já commitada; toda mudança no schema gera uma migration nova (`npm run db:generate -- --name <descricao>`).
- Para renomear ou trocar colunas sem o `drizzle-kit` parar com uma pergunta interativa, divida em duas migrations: primeiro só adiciona as colunas novas, depois só remove as antigas.

## Dados

- Dinheiro sempre `decimal(10,2)` com `mode: "number"`, nunca `float`.
- Itens de orçamento guardam cópia de descrição, unidade e preço do momento; não depender do preço atual do material. Cada item é `MATERIAL` (com `materialId`) ou `PRODUCT` (com `productId`, unidade `UN` e preço = preço calculado do produto).
- Total do orçamento = subtotal dos itens − desconto em R$ (`calculateQuoteTotal`); o desconto não pode passar do subtotal.
- Colunas `date` usam `{ mode: "string" }` ("AAAA-MM-DD"), para o dia não mudar por fuso horário; formatar com `formatDate` (`src/utils/format.ts`).
- Enums e labels de exibição ficam em `src/db/constants.ts` (sem importar Drizzle, para poder usar em componentes client).
- Formatação de valores: `formatCurrency` em `src/utils/format.ts`.
- Cálculos de preço só pelas funções de `src/utils/pricing.ts` (`roundMoney`, `calculateMaterialsCost`, `calculatePrice`), usadas tanto na API quanto na prévia do formulário. Nunca arredondar com `Math.round(x * 100) / 100` direto (erra centavos por causa do ponto flutuante).
- Preço de produto não é salvo: é calculado a partir do preço atual dos materiais + margem de lucro.

## Configurações da empresa

- Tabela `company_settings` com uma linha só (id = 1), salva com upsert (`onDuplicateKeyUpdate`). API: `GET /api/company` (devolve `null` se não configurada) e `PUT /api/company`. Tela em `/configuracoes`, aberta pelo botão de engrenagem no cabeçalho.
- O PDF usa nome, contato, endereço e logo da empresa; sem empresa, mostra o cabeçalho do WoodKun.
- Condições padrão (validade em dias, forma de pagamento, prazo de entrega) ficam na empresa e são **copiadas** para o orçamento novo (validade = hoje + N dias), como os preços: mudar o padrão não altera orçamentos já feitos. Saem no PDF (bloco "Condições") e no CSV.
- `GET /api/company` é liberado para qualquer usuário logado (o orçamento novo precisa das condições); `PUT` só com `company: ["write"]`.
- O logo enviado é convertido para PNG e reduzido com `sharp` antes de ir para o PDF (o react-pdf não lê WebP). O tamanho no PDF é calculado pela proporção real da imagem (`objectFit`/`objectPosition` do react-pdf não funcionaram de forma confiável).

## Imagens

- Upload por `POST /api/uploads` (multipart, campo `file`), servido por `GET /api/uploads/:fileName`. Arquivos em `storage/uploads/` (fora do git e fora de `public/`, que em produção só serve o que existia no build).
- Só JPG, PNG e WebP até 5 MB, conferidos pelos bytes do arquivo (não pela extensão). Nome gerado com `randomUUID()`; o nome é validado por regex antes de ler do disco (evita path traversal).
- O campo `imageUrl` usa `imageUrlSchema` (`src/schemas/common.ts`): só `""` ou URLs do nosso upload.
- Os services apagam o arquivo antigo (`deleteImage`) ao trocar/remover a imagem e ao excluir o registro.
- No form: `ImageUpload` ligado com `Controller`; nas tabelas: `Thumbnail` (`next/image`, gera miniatura).

## Login e permissões (Better Auth)

- Configuração em `src/services/auth.ts` (email e senha, `disableSignUp`, plugin `admin` com os papéis, `nextCookies()` por último). Tabelas `users`, `sessions`, `accounts`, `verifications` (`usePlural`); ids de usuário são strings.
- Papéis e permissões em `src/utils/permissions.ts` (`admin`, `purchasing`, `sales`). Ver dados = qualquer logado; `write` = criar/editar/excluir. Para mudar o que cada papel faz, edite só esse arquivo.
- **Toda rota da API usa `withAuth`** (`src/utils/api.ts`): `withAuth(handler)` exige login (401); `withAuth(handler, { materials: ["write"] })` exige a permissão (403). Exceções: `/api/auth/[...all]` (Better Auth) e `GET /api/uploads/:fileName` (o `next/image` busca sem cookies; nomes são UUIDs).
- Telas: o layout `(modules)` checa a sessão no servidor (`getCurrentUser`) e redireciona para `/login`; é a única exceção à regra "dados só pela API". Ele passa o usuário ao `UserProvider`; nas telas use `useCan(permission)` ou `<Can permission={...} fallback={<NoPermission />}>` para esconder botões e bloquear cadastros.
- Usuários são gerenciados pelo `authClient.admin.*` (hooks em `src/hooks/queries/useUsers.ts`). Erros do Better Auth vêm em inglês: traduza em `AUTH_ERROR_MESSAGES` (`useAuth.ts`) e use `throwIfAuthError`.
- O plugin admin não aplica `minPasswordLength` ao criar usuário/redefinir senha; o hook `before` em `auth.ts` faz essa validação. O administrador não pode mudar o próprio papel, se bloquear ou se excluir, e o último administrador ativo não pode perder o papel.
- 401 com a tela aberta (sessão venceu): o `QueryProvider` manda para `/login?next=…`.
- Primeiro administrador em produção: `npm run user:create` (aceita `--name --email --password --role`).

## Gráficos e painel

- Gráficos com ECharts pelo componente `EChart` (`src/components/charts/EChart.tsx`), que registra só os módulos usados (`registerEChartsModules`) e desenha em SVG. Novo tipo de gráfico: registre o módulo lá e acrescente o tipo da opção em `EChartOption`.
- Cores dos gráficos em `CHART_COLORS` (hexadecimal; o ECharts não lê variáveis CSS). Antes de criar uma cor nova de série, valide com o script do skill de dataviz (separação ≥ 8 com daltonismo e ≥ 15 em visão normal; contraste ≥ 3:1). Cores de status (verde/vermelho) não são usadas como série.
- Todo gráfico tem legenda (2+ séries), tooltip e uma visão em tabela com os mesmos números.
- Indicadores do Início: `GET /api/dashboard` (`dashboardService`). Comparações do mês em andamento são com o **mesmo período** do mês anterior. Não existe data de mudança de status: "aprovado no mês" = criado no mês e hoje aprovado. Salvar/excluir orçamento invalida `["dashboard"]`.

## Exportação (PDF e CSV)

- Gerada no servidor: `src/services/quotePdf.tsx` (`@react-pdf/renderer`) e `src/services/quoteCsv.ts`, servidos por `/api/quotes/:id/pdf` (`Content-Disposition: inline`) e `/api/quotes/:id/csv` (`attachment`). Na tela, são links `<a href>` comuns (não `fetch`).
- CSV no padrão do Excel pt-BR: separador `;`, decimal com vírgula, BOM UTF-8 no início e campos com `;`, aspas ou quebra de linha entre aspas.
- PDF: cores em hexadecimal (o PDF não lê as variáveis CSS), logo reduzido em `public/assets/Logotipo-WoodKun-pdf.png` (não usar os PNGs originais, que têm ~1,5 MB) e hifenização desligada.

## Estilo

- Cores definidas como tokens no `:root` de `src/styles/globals.css`. Usar os tokens do shadcn (`bg-primary`, `border-border`, `text-muted-foreground`, `bg-card`…), não cores fixas do Tailwind nem as classes antigas `wood-*`.
- Cores de status: `success` (verde), `info` (azul), `destructive` (vermelho) e `muted`, ex.: `bg-success/10 text-success`.
- Layout de aplicativo: o `(modules)/layout.tsx` ocupa a altura da tela (`h-svh overflow-hidden`) e só a área de conteúdo rola; sidebar e cabeçalho ficam fixos. Não colocar outro `<main>` dentro do `SidebarInset` (ele já é o `<main>`).
- Sidebar escura (marrom café), conteúdo em creme suave, tabelas e inputs em branco (`bg-card`), marrom (`primary`) só para destaque.
