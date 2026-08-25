# PLANO TÉCNICO — Motor de Funis Whitelabel (MVP: Farmácia de Manipulação)

> **Produto:** plataforma multi-tenant para criar e hospedar funis de recomendação
> whitelabel. Cada cliente (tenant) é uma marca que escolhe um **template de funil** criado
> pela nossa empresa, customiza o **visual** (cor, logo, textos) e coloca no ar em
> **10 minutos** — sem escrever código.
>
> **MVP:** funil de **farmácia de manipulação**. Os produtos recomendados são um
> **catálogo pré-criado** (pela nossa empresa, associado aos perfis do funil). O cliente
> escolhe da lista quais exibir e cola um **link de redirecionamento por produto**. O
> visitante é levado por uma **jornada de convencimento com base científica** (como o Candle
> faz com os aromas) até clicar no produto, que o redireciona pro link de venda real do
> cliente — e o lead fica capturado.
>
> **Base de origem:** [CristVini/Candle](https://github.com/CristVini/Candle) — usado como
> **referência de design system visual** (paleta stone/âmbar, tipografia serif, Fireflies,
> estrutura de ResultCard) e como **prova do conceito de direcionamento científico**. O
> *motor* de quiz deixa de ser arrays hardcoded e vira **dado**.
>
> **Documentos de referência do projeto:**
> - `PLANO_TECNICO.md` — este documento: arquitetura, schema e roteiro.
> - `ESPECIFICACAO_TELAS.md` — [especificação funcional de todas as telas](ESPECIFICACAO_TELAS.md) (objetivo, fluxo, dados por tela).
>
> ---
> **Status:** ⏳ Em validação com o usuário. Nenhum código foi escrito ainda.

---

## 1. Visão de produto

**A essência do que vendemos:** entregar um **funil "pensado e moldado"**, com base
científica, que **valida e reforça** a decisão do visitante — o deixando mais propenso a
encontrar o que busca e **a fechar a compra**. Igual o Candle faz: não é "aqui está a vela",
é "entendi o seu momento emocional; este aroma foi escolhido por isso" — o fundamento convence.

No whitelabel, esse mesmo formato é **genérico**: o visitante é direcionado por uma jornada
(de sintoma/necessidade → perfil → fundamento científico → recomendação) e o **clique final
no produto redireciona para o link de venda real do cliente**.

### 1.1 O que é entregue ao cliente final (marca/tenant)
1. Cadastro + escolha do **template de funil** (ex.: "Farmácia de Manipulação").
2. **Escolha de produtos a partir de uma lista pré-criada** (catálogo da nossa empresa,
   ligado aos perfis). O cliente marca os que quer e, para cada um, cola o **link de
   redirecionamento** (loja / catálogo / WhatsApp).
3. **Customização visual** — cor primária, logo, textos do funil. Sem código.
4. Publicação em **subdomínio do tenant** (`tenant.dominio.com`).
5. Acesso ao **dashboard do tenant**: leads, métricas de quiz, gestão de produtos/links.

### 1.2 O que é entregue ao visitante (paciente/público)
1. Acessa `tenant.dominio.com` e responde um **quiz de direcionamento** (estado/sintoma/
   necessidade → pontuação de 1+ perfis).
2. Recebe o **perfil vencedor** + a **base científica** por trás (o que gera confiança) +
   os **produtos recomendados** que o cliente ativou naquele perfil.
3. Cada produto tem **seu próprio link de redirecionamento** — clica e vai pro link de
   venda. O lead fica salvo.

### 1.3 O que a nossa empresa (admin) controla
- Criação e gestão de **templates de funil** (perguntas, perfis, regras de recomendação).
- Visão de **todos os tenants**, métricas globais, gestão de planos.

---

## 2. Decisões de arquitetura

| Área | Decisão | Justificativa |
|---|---|---|
| **Forma de serviço** | **SaaS multi-tenant**, 1 domínio + subdomínios por tenant | Você quer "1 único domínio/nome do cliente". Subdomínio `tenant.dominio.com` é simples de resolver no front. |
| **Arquitetura** | **Monolito modular** — 1 repo, app único, bem separado em módulos/bibliotecas internas reutilizáveis | Você prefere modularidade para reuso e manutenção, mas sem o custo de microserviços/multi-repo nesta fase. A "modularidade" vem da organização (pacotes internos), não da separação de processos. |
| **Backend/dados** | **Supabase** (Postgres + Auth + RLS + Storage) | Já dominamos (PopTrack), custo zero p/ começar, `tenant_id` + RLS resolve isolamento. |
| **Frontend** | React 19 + Vite + TS + Tailwind (reescrito limpo, baseado no Candle) | Manutenção da equipe, design system reaproveitável. Um app com rotas `/f/:slug`, `/dashboard`, `/admin`. |
| **Customização por tenant** | **Visual (cor/logo/textos)** feita pelo tenant; **dados do funil** (perguntas/perfis) sob controle do template/admin | Sua visão: "único trabalho dele é customizar o visual". Dados de recomendação são seu produto. |
| **Captura de lead** | Tabela `leads` no banco + **clique rastreado** no link de redirecionamento por produto | Hoje no Candle a conversão depende do usuário digitar mensagem e não há rastreamento. Aqui cada clique no produto fica registrado. |
| **Monetização** | **Mensalidade por cliente**, planos (Free trial / Pro / Enterprise) com limites de uso | Você cobra recorrente; planos distintos dão acessos e limites diferentes. |
| **Acesso ≠ cobrança** | `tenants.status` (entrega) e `plan_status`/pagamento (faturamento) são **independentes** | Defende que entregar o produto não é o mesmo que cobrar — um tenant pode estar ativo mas bloqueado por não-pagamento, ou ativo de graça em trial. |

---

## 3. Arquitetura

```
                      ┌──────────────────────────────────────────────┐
                      │           FRONTEND (React SPA)                │
                      │                                              │
   public visit       │  /f/:slug        → funil render (tema tenant) │
 tenant.dominio.com ─▶│  /dashboard      → app admin (roles)           │
                      │                                              │
                      └──────────────┬───────────────────────────────┘
                                     │ REST / Supabase client (anon + user)
                                     ▼
                      ┌──────────────────────────────────────────────┐
                      │              SUPABASE                        │
                      │  Auth (roles: admin, tenant_user)            │
                      │  Postgres  +  RLS (tenant_id em toda linha)   │
                      │  Storage  (logos, imagens de produtos)        │
                      └──────────────────────────────────────────────┘
```

**Resolução de tenant no front:** o subdomínio informa o tenant (`*.dominio.com`) OU a rota
`/f/:slug`. O client busca `tenants` por slug e carrega o tema + conteúdo daquele tenant.

---

## 4. Modelo de dados (Supabase)

> Notas gerais:
> - **Toda tabela de conteúdo** carrega `tenant_id` (nulo = template global/seed, herdado).
> - RLS: policy de leitura pública controlada pelo tenant ativo; escrita restrita a role
>   `tenant_user` do próprio tenant ou `admin`.
> - `created_at`/`updated_at` com trigger em todas as tabelas.

### 4.1 Núcleo de multi-tenancy
```sql
create table tenants (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,              -- fica no subdomínio
  name         text not null,
  status       text not null default 'active',    -- active | paused | trial
  logo_url     text,
  primary_color    text not null default '#0c0a09',
  secondary_color  text not null default '#fafaf9',
  accent_color     text not null default '#f59e0b', -- âmbar do Candle
  headline     text,                              -- textos customizáveis
  subheadline  text,
  cta_text     text default 'Descobrir meu perfil',
  whatsapp     text,                              -- número do tenant
  plan         text not null default 'trial',
  created_at   timestamptz default now()
);

create table templates (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,               -- 'farmacia-manipulacao', 'aromaterapia'
  name        text not null,
  description text
);

-- vínculo tenant ↔ template + estado da instância do funil
create table tenant_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  template_id uuid references templates(id),
  status      text not null default 'draft',      -- draft | published
  unique (tenant_id, template_id)
);

-- PLANOS (catálogo de monetização, definido por nós)
-- Tese: "não vendemos funil, vendemos DECISÃO". O funil é ILIMITADO em todos os planos;
-- o diferenciador é o NÍVEL do dashboard/análise. Estratégia de âncora: Enterprise ~R$278,90
-- perto do Pro (~R$230) → cliente sobe ao topo.
-- Sem plano free; trial de no máx. 30 dias.
create table plans (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,               -- 'basic' | 'pro' | 'enterprise'  (sem 'free')
  name        text not null,
  price_monthly_cents integer not null,           -- R$ em centavos. Básico: margem >=200%
  dashboard_level text not null default 'basic',  -- basic | advanced | decision  (o real diferenciador)
  max_products int,                              -- proteção de custo opcional (NULL = ilimitado)
  max_clicks_month int,                          -- idem (a entrega de valor; NULL = ilimitado)
  custom_domain boolean not null default false,   -- se suporta domínio próprio
  multi_user boolean not null default false,      -- se permite >1 usuário no dashboard
  brand_free boolean not null default true,       -- se exibe "powered by" no funil (false = remove)
  support_level text not null default 'standard', -- standard | priority | dedicated
  trial_days int not null default 30,            -- trial (regra: <=30). vira assinatura ao fim.
  position int default 0                          -- ordem de exibição/escalada
);

-- Mapa do nível de dashboard por plano (referência p/ UI/RLS)
--   basic     -> visitas, leads, cliques simples; sem histórico/export.
--   advanced  -> + histórico, export CSV, insights (produto/perfil mais clicado). (Pro)
--   decision  -> + infográficos de decisão: funil de conversão, melhor dia/hora, ROI,
--                sugestão de recomendação. (Enterprise = onde a grana se deposita.)

-- ASSINATURA do tenant (cobrança). Independente de tenants.status (entrega).
create table subscriptions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid unique references tenants(id) on delete cascade not null,
  plan_id     uuid references plans(id) not null,
  status      text not null default 'trial',      -- trial | active | past_due | paused | canceled
  current_period_start timestamptz,
  current_period_end   timestamptz,
  canceled_at timestamptz,
  provider     text default 'manual',             -- manual | stripe | ... (preparado p/ acoplar)
  provider_id  text,                              -- id no provedor (ex.: subscription_id do Stripe)
  created_at   timestamptz default now(),          -- updated_at via trigger
  updated_at   timestamptz default now()
);

-- histórico de eventos de faturamento do tenant (auditoria de cobrança)
create table billing_events (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references tenants(id) on delete cascade,
  subscription_id uuid references subscriptions(id),
  event           text not null,                  -- trial_started | subscribed | renewed | payment_failed | canceled
  detail          jsonb,
  created_at      timestamptz default now()
);
```

### 4.2 Conteúdo do funil (dirigido por dados)
```sql
-- Eixos de recomendação (ex.: "Saúde da Pele", "Imunidade", "Sono/Ânimo")
-- Vivem no template (nossa empresa). Tenant não edita.
create table categories (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  name        text not null,
  position    int default 0
);

-- PERFIS: gerados pelo quiz (equivalente ao "OlfactoryProfile")
-- Vivem no template (nossa empresa cria a base científica). Tenant não edita.
create table profiles (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid references templates(id) on delete cascade not null,
  name          text not null,                    -- "Pele Sensível"
  archetype     text,                             -- "Regulação do investimento em skincare"
  description   text,
  scientific_basis text not null default '',      -- texto que convence o visitante (OBRIGATÓRIO)
  expected_effect  text,
  references     jsonb not null default '[]',     -- evidências: [{title,author,year,url?}] p/ validar
  color         text default '#6D28D9',
  position      int default 0
);

-- CATÁLOGO PRÉ-CRIADO (nossa empresa por template/nicho)
-- Aqui vive o catálogo "padrão ouro" de produtos que você monta pra cada nicho.
-- NOTA: não tem tenant_id — é dado global do template. O cliente NÃO cria produtos,
-- ele apenas escolhe, daqui, quais ativar no funil dele.
create table products (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  name        text not null,                      -- ex.: "Vitamina C 10%"
  description text,                               -- argumento de venda / o que faz
  category    text,                               -- ex.: "Antioxidante", "Capilar"
  image_url   text,
  position    int default 0
);

-- Mapeamento perfil ↔ produto do catálogo (dado DE TEMPLATE, você cria)
create table template_profile_products (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id)  on delete cascade,
  priority   int default 1,                        -- ordem de exibição na recomendação
  unique (profile_id, product_id)
);

-- PRODUTOS ATIVADOS PELO CLIENTE (tenant) + LINK DE REDIRECIONAMENTO
-- O cliente marca produtos do catálogo que quer exibir e cola o link de venda.
create table tenant_products (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references tenants(id) on delete cascade not null,
  product_id   uuid references products(id)  on delete cascade not null,
  redirect_url text not null,                     -- link real de venda/loja do cliente
  enabled      boolean not null default true,     -- se fica visível no funil
  position     int default 0,
  unique (tenant_id, product_id)
);

-- PERGUNTAS e opções do quiz (dado de TEMPLATE, nossa empresa cria).
-- O cliente não edita perguntas/perfis — é o "conhecimento da jornada" que você cobre.
-- Se um dia um cliente quiser seus próprios perfis, criamos override depois via tenant_override.
create table quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  text        text not null,
  position    int default 0
);

create table quiz_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid references quiz_questions(id) on delete cascade,
  text        text not null,
  profile_ids text[] not null,   -- perfis que esta opção pontua (ex.: {'sensitive','recovery'})
  position    int default 0
);

-- LEADS capturados (a META: hoje no Candle isso não existe)
create table leads (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid references tenants(id) on delete cascade not null,
  name           text,
  phone          text,
  winning_profile uuid references profiles(id),
  secondary_profile uuid references profiles(id),
  answers        jsonb,          -- respostas brutas (auditoria)
  source_url     text,
  status         text not null default 'new',      -- new | contact | won | lost
  created_at     timestamptz default now()
);

-- EVENTOS granulares (rastreio de cada ação) — alimenta o analytics de DECISÃO do Enterprise.
-- Não é só o lead final: cada abertura/resposta/clique vira uma linha p/ o funil de conversão,
-- o perfil dominante, o produto mais clicado, melhor dia/hora e ROI.
-- Coletado desde o dia 1 em todos os planos; o acesso à análise avançada é gateado por plano.
create table events (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade not null,
  lead_id     uuid references leads(id) on delete set null,  -- vínculo p/ quem fez a ação
  kind        text not null,                     -- funnel_view | quiz_start | quiz_question | quiz_complete | recommendation_view | product_click
  product_id  uuid references products(id) on delete set null, -- qdo aplicável
  profile_id  uuid references profiles(id) on delete set null, -- perfil do contexto
  source_url  text,
  referrer    text,
  payload     jsonb,                             -- extras (ex.: answers parciais, step do quiz)
  created_at  timestamptz default now()
);

-- índice p/ queries analíticas de decisão (funil de conversão por tenant)
create index events_tenant_kind_created_idx on events (tenant_id, kind, created_at);
```

---

## 5. Modelo de recomendação no MVP (como o funil "fecha")

O **motor de conversão** funciona em 3 passos, todo dirigido por dados do template +
escolhas do tenant:

1. **Perfil vencedor do quiz** → `winner` (e `runnerUp`).
2. **Produtos recomendados** = a interseção de:
   - `template_profile_products` — produtos que a *nossa empresa* ligou àquele perfil
     (ex.: perfil "Pele Sensível" → "Vitamina C 10%", "Óleo de Melaleuca").
   - `tenant_products` com `enabled = true` — produtos que *o cliente* ativou
     (a 1ª condição anula a necessidade de o cliente ter todos; lista é filtrada).
3. **Clique final** → `<a href={tenant_products.redirect_url}>` abre o link de venda real
   (loja/WhatsApp/catálogo). **Cada produto tem seu próprio link.**

Isso garante o formato Candle: o visitante é *convencido* pela base científica do perfil e
só então direcionado ao produto — com o link do cliente. O lead é gravado no passo 2.

**Nota de escopo:** a *importação TXT* (ideia anterior) é **retirada do caminho principal do MVP**.
No modelo atual o catálogo é pré-criado pela nossa empresa (dado de template), então o cliente
não precisa parserar nada. Fica registrado como melhoria futura ("modo avançado") caso um
cliente peça para subir os próprios produtos.

---

## 6. Algoritmo do quiz (motor de pontuação)

Genérico e dirigido por dados (substitui o `Quiz.tsx` hardcoded do Candle):

1. Perguntas e opções vindas de `quiz_questions`/`quiz_options` (do tenant, com fallback ao template).
2. Cada resposta soma +1 aos `profile_ids` da opção.
3. Ao fim, **ranking determinístico** (maior primeiro; empate resolve por `name` alfabético):
   - usa exatamente a lógica de desempate que corrigimos no Candle (`getRanking`).
4. Entrega `winner` + `runnerUp`. O `ResultCard` (componente de template) renderiza:
   - identidade do perfil (nome, base científica, efeito esperado)
   - **produtos recomendados** — a interseção entre `template_profile_products` do winner
     (e do runner-up como sugestão secundária) filtrada pelos `tenant_products` habilitados
   - **clique no produto redireciona** para o `tenant_products.redirect_url` (link de venda
     real do cliente, por produto)
   - **grava `leads`** com winner, runnerUp, answers e source_url.

> Reuso de design visual do Candle: ResultCard, IngredientModal → "ProductModal", Fireflies,
> Hero, galeria de produtos (a biblioteca de essências vira galeria de *produtos recomendados*
> com link de redirecionamento).

---

## 7. Telas dos dashboards

### 7.1 Dashboard do TENANT (cliente – farmácia)
| Tela | Funções |
|---|---|
| **Login/registro** | Auth Supabase, role `tenant_user` |
| **Onboarding** | escolher template → escolher produtos do catálogo → colar link por produto → publicar |
| **Dashboard (overview)** | nº de leads, conversão do quiz, perfil mais vendido, produto mais clicado |
| **Produtos** | ativar/desativar produtos do catálogo, **colar/editar link de redirecionamento** de cada um, reordenar |
| **Perfis** | ver a base científica de perfis do template + quais produtos recomenda cada perfil |
| **Leads** | lista, status (new/contact/won/lost), export CSV, ver respostas do quiz |
| **Aparência** | cor primária/secundária/acento, logo, textos (headline, sub, CTA), preview ao vivo |
| **Assinatura/Plano** | ver plano atual, limites de uso, gerenciar status (implora trial / upgrade), link de pagamento |
| **Publicação** | status do subdomínio, link `tenant.dominio.com` |

### 7.2 Dashboard ADMIN (nossa empresa)
| Tela | Funções |
|---|---|
| **Login** | role `admin` |
| **Tenants** | CRUD, ativar/pausar, plano, visão de todos |
| **Templates** | CRUD de templates: perguntas, perfis (com base científica), categorias e **catálogo de produtos pré-criados** + associação perfil↔produto |
| **Analytics global** | leads por tenant, conversão por template, receita |
| **Config** | domínio, chaves, branding global |

---

## 8. Áreas do produto (mapa funcional)

O sistema tem **3 faces**, cada uma com áreas próprias. Este mapa guia pastas, schema e prioridade de implementação. Para a descrição funcional detalhada de **cada tela** (objetivo, fluxo e dados), veja o documento **[ESPECIFICACAO_TELAS.md](ESPECIFICACAO_TELAS.md)**.

```
┌────────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────────┐
│ 1. PÚBLICO (visitante)     │  │ 2. DASH TENANT (marca)     │  │ 3. ADMIN (nossa empresa)   │
├────────────────────────────┤  ├────────────────────────────┤  ├────────────────────────────┤
│ ▪ Landing / Hero           │  │ ▪ Auth / Onboarding        │  │ ▪ Auth admin               │
│ ▪ Quiz (jornada)           │  │ ▪ Visão geral (métricas)   │  │ ▪ Tenants (CRUD/status)    │
│ ▪ Resultado / Jornada      │  │ ▪ Produtos (ativar/link)   │  │ ▪ Templates (perfis/quiz)  │
│ ▪ Modal de produto (link)  │  │ ▪ Leads (lista/status)     │  │ ▪ Catálogo de produtos     │
│ ▪ Captura de lead          │  │ ▪ Aparência (cor/logo/text)|  │ ▪ Planos / Assinaturas     │
│                            │  │ ▪ Publicação (subdomínio)  │  │ ▪ Leads globais (analytics)│
│                            │  │ ▪ Assinatura/plano         │  │ ▪ Config / usuários        │
└────────────────────────────┘  └────────────────────────────┘  └────────────────────────────┘
```

## 8.1 Modularidade de funis e comprovação científica

> **Princípio:** o produto é **um motor + N instâncias**. Cada *tipo de cliente* (nicho) é um
> **template** — uma configuração de dados, não um novo código. Isso permite **infinitos funis**
> a partir do mesmo motor, cada um com sua própria base de validação.

### O funil como composição de blocos modulares

Todo **template** (`templates`) é a união de 5 blocos, que você define por nicho:

```
┌──────────────────────────────────────────────────────────────┐
│  TEMPLATE = produto intelectual por nicho                      │
│                                                              │
│  1. ESTRUTURA DE QUIZ      → perguntas + opções + ordem      │
│  2. PERFIS DE RESULTADO      → cada um com base científica      │
│  3. CATÁLOGO DE PRODUTOS    → vinculados aos perfis            │
│  4. LAYOUT/EXPERIÊNCIA      → tema visual do template          │
│  5. COMPROVAÇÃO             → evidências, referências, disclaimer │
└──────────────────────────────────────────────────────────────┘
```

O **motor** (processamento do quiz, captura de lead, publicação em subdomínio, dashboard,
planos) é **igual para todos**. Para criar um novo nicho: criamos um `template` e
preenchemos os 5 blocos via Admin (**tela 3.3**) — **sem escrever código novo**.

### A comprovação científica como requisito OBRIGATÓRIO

Para que o funil não vire "um quiz de adivinhação", a **validação é estrutural e obrigatória**:

1. **Todo `profile` tem `scientific_basis` (obrigatório)** — o texto que convence ("este resultado
   combina com você porque..."). Sem ele, o perfil não é válido.
2. **Todo `profile` pode ter `references`** (JSON): título, autor, ano, URL opcional — os
   estudos/evidências que embasam o resultado.
3. **O Resultado para o usuário SEMPRE exibe `scientific_basis`**, e tem link para uma
   seção "A Ciência por trás" (como o modal de referências do Candle).
4. **Um template não pode ser publicado se algum perfil estiver sem `scientific_basis`/`references`**
   — o sistema valida antes de permitir que qualquer cliente use aquele template.

Isso garante que **todo funcionário do sistema tenha um "porquê" verificável** — exatamente a base de
confiança que o cliente final percebe (e que faz o link de venda converter).

### Fluxo para adicionar um novo nicho (ex.: sair de farmácia para outra área)

1. Criar novo `template` (novo slug, novo nome).
2. No Admin (3.3): definir os 5 blocos — perguntas, perfis (com ciência), catálogo, layout,
   e a comprovação.
3. O novo template aparece como opção no onboarding de novos clientes.
4. Zero mudança de código: o motor e os apps reaproveitam tudo.

### Padrões de cientificidade por tipo de validação (a definir por template)
- **Saúde** (MVP): referências a estudos/correlações da área (com disclaimer de que não é diagnóstico).
- **Cosmético**: composições e indicações de uso (com revisão de rótulo).
- **Futuro genérico**: cada template define seu próprio "que tipo de evidência ele usa",
  mas o requisito de validar antes de publicar é universal.

## 8.2 Estrutura de pastas — MONOLITO MODULAR

> Um único app React (Vite) na raiz, organizado em **módulos por área**. A modularidade vem
> da separação de pastas/bibliotecas internas (reutilizáveis), não de múltiplos apps/repos.
> Cada módulo é autocontido (componentes + hooks + lógica), o que facilita reuso — o motor de
> quiz e o design system são os ativos reutilizáveis que alimentam qualquer template/funil.

```
MagikFunil/
├─ src/
│  ├─ app/                  # entrada: router, providers (Supabase, Theme, Query), CSS global
│  ├─ modules/              # ★ cada área do produto = um módulo autocontido
│  │  ├─ funnel/            #   1. PÚBLICO — Hero, Quiz, ResultCard, ProductModal, Landing
│  │  ├─ dashboard/
│  │  │  ├─ overview/       #   2.1 métricas
│  │  │  ├─ products/       #   2.2 ativar/link/ordernar produtos
│  │  │  ├─ leads/          #   2.3 lista/status/export
│  │  │  └─ appearance/     #   2.4 cor/logo/texo + preview
│  │  ├─ billing/           #   2.5/3.4 planos, assinatura, limites
│  │  └─ admin/
│  │     ├─ tenants/        #   3.1 gestão de marcas
│  │     ├─ templates/      #   3.2 perfis/perguntas (cérebro do produto)
│  │     └─ products/       #   3.3 catálogo pré-criado
│  ├─ packages/             # ★ bibliotecas internas reutilizáveis
│  │  ├─ ui/                #   design system (do Candle, limpo): Button, Card, Modal, Fireflies
│  │  ├─ quiz-engine/       #   motor genérico de pontuação/ranking (o ativo de reuso)
│  │  ├─ theme/             #   resolução de tema por tenant (CSS vars)
│  │  └─ db/                #   client Supabase + tipos gerados + queries por módulo
│  ├─ lib/                  # utils, API calls, config
│  └─ pages/                # thin wiring pages -> modules
├─ supabase/
│  ├─ migrations/           # schema SQL (item 4) + RLS + triggers
│  └─ seed/                 # seed: planos + template farmácia-manipulação (perfis, quiz, catálogo)
├─ public/
├─ package.json
├─ tailwind.config.ts
├─ vite.config.ts
├─ vercel.json
├─ README.md
├─ PLANO_TECNICO.md         # arquitetura, schema, roteiro
└─ ESPECIFICACAO_TELAS.md   # descrição funcional de todas as telas
```

## 8.3 Matriz de customização — o que o cliente controla vs. o que fica travado

> **Regra de ouro:** customizável = o que faz o funil **"parecer da marca"** (visual, identidade,
> vínculo comercial). Travado = tudo que **carrega o valor científico/conhecimento** do funil.
> Essa fronteira protege o que vendemos (o conhecimento) e dá ao cliente o senso de posse (visual
> + links), sem que ele consiga degradar a base de qualidade.

### 🎨 Customizável pelo cliente (tenant) — identidade da marca
| Área | O que pode fazer |
|---|---|
| **Cores** | primária, secundária, acento (color pickers) |
| **Logo** | upload próprio (`Storage`) |
| **Textos da marca** | headline, subtítulo, CTA text, nome da marca |
| **Links de venda** | `tenant_products.redirect_url` por produto (cola o link da própria loja) |
| **Subdomínio/slug** | `tenant.dominio.com` (escolhe o slug na criação) |
| **WhatsApp/contato** | número que aparece na seção comercial do funil |
| **Ativar/desativar produtos** | escolhe, da lista pré-criada, quais aparecem + ordenação |
| **Leads / dados** | vê e gerencia **apenas os próprios** leads (RLS) |

### 🔒 Travado no template (nosso conhecimento — o produto intelectual)
| Área | Por quê está travado |
|---|---|
| **Perguntas do quiz** | é o "mapeamento" que vendemos; o cliente não edita |
| **Perfis de resultado** | base científica, arquétipo, efeito — nosso conhecimento |
| **Base científica / evidências** | `scientific_basis`, `references` — protegidas |
| **Associação produto ↔ perfil** | quem recomenda o quê; o fundo de dados que faz funcionar |
| **Catálogo de produtos** (o que existe) | nós criamos; o cliente só ativa/desativa |
| **Descrição/benefício do produto** | argumento de venda dos produtos |
| **Layout/estrutura do funil** | "onde vai cada coisa" é definido pelo template |
| **Disclaimers científicos** | conformidade de saúde; não pode o cliente alterar |

### ⚖️ Híbrido / sob condição
| Área | Regra |
|---|---|
| **Imagem do produto** | travada do catálogo no MVP; futuro: cliente pode sobrescrever a imagem **do mesmo produto** que ativar |
| **Textos do produto** | travados no MVP; futuro: permitir uma "frase extra" do cliente |
| **Domínio próprio** | **só em plano Enterprise** (`plans.custom_domain`); Básico/Pro usam subdomínio |
| **Nº de produtos ativos** | customizável, mas com **teto do plano** (`plans.max_products`) |
| **Cor dos perfis** | mantém identidade de template (consistência com a "ciência"); a cor primária do tenant tinge o tema |

## 8.4 Precificação e planos (conforme direção explícita)

> **Princípio:** a tese do produto é: **não vendemos funil, vendemos DECISÃO.**
> - **Básico** = funil (gera dados) + dashboard simples ("o que está rolando").
> - **Pro** = dashboard completo (histórico, export, insights básicos — "o que rolou").
> - **Enterprise** = **dados e infográficos que potencializam a tomada de decisão** ("agora eu sei
>   o que fazer"). **É aqui que a grana se deposita.**
>
> **Preços definidos explicitamente:**
> - **Básico** = R$ 278,90 (após trial máximo de 30 dias)
> - **Pro** = R$ 369,00
> - **Enterprise** = R$ 397,00
>
> Essa estrutura entrega valor crescente em cada plano, com o Enterprise focado em
> analytics de decisão que justificam o investimento adicional.

### Custos (base de cálculo — multitenant)
| Item | Custo/mês |
|---|---|
| Supabase Pro (infra + auth + storage) | ~R$ 135 |
| Vercel Pro (hosting) | ~R$ 108 |
| Domínio raiz | ~R$ 5 |
| **Total fixo mensal** | **~R$ 248** |
| **Custo marginal por cliente** (banda/storage/API + suporte + transação) | **~R$ 8,50** |

> **Ponto de equilíbrio:** com só clientes no plano **Básico (R$278,90)**, **apenas 1 cliente**
> já cobre os R$248 fixos (lucro líquido ≈ R$30,90). Isso deixa ampla margem para cobrir
> CAC e suporte. Em escala, a lucratividade aumenta porque o custo marginal multitenant
> é baixo (a "batata": servir o 50º cliente custa quase o mesmo que o 1º).

### Tabela de planos (valores explícitos)
| Plano | Preço/mês | Funil | Dashboard / Dados | Destaque |
|---|---|---|---|---|
| **Básico** | **R$ 278,90** | ilimitado (volume não limita) | **básico** — visitas, leads, cliques simples | "o que está rolando"; funcional, mas sem histórico/export |
| **Pro** | **R$ 369,00** | ilimitado | **completo** — histórico, export, insights (produto/perfil mais clicado) | "o que rolou"; avançado |
| **Enterprise** | **R$ 397,00** | ilimitado | **TUDO + Infográficos de decisão** (ROI, funil de conversão, melhor dia/hora, recomendação) | **"o que fazer agora"** — o diferencial que paga caro |

### Tese de valor — por que o Enterprise puxa a grana
O Enterprise **não é um dashboard com mais gráficos** — é uma **camada analítica/estratégica** que
transforma dado em **decisão operável**. Isso dá retorno mensurável ao cliente e justifica a assinatura.

| Infográfico / dado | A pergunta que responde | A decisão que destrava |
|---|---|---|
| **Funil de conversão por etapa** | onde os visitantes desistem? | onde otimizar a página/quiz |
| **Perfil dominante + produto mais clicado** | quem é meu cliente? o que ele quer? | onde investir estoque/divulgação |
| **Melhor dia/hora + fonte (URL/referrer)** | quando postar/anunciar? | calibragem de campanhas |
| **Sugestão de recomendação** (a partir do perfil) | dado o perfil X, qual produto oferecer | próxima ação do vendedor |
| **ROI estimado** | vale a pena pagar/persistir? | prova de valor que segura a renovação |

### Regras fixas
1. **Sem plano free** — todo acesso começa num trial (nascido em `subscriptions.status='trial'`).
2. **Trial máximo de 30 dias** — ao fim, vira assinatura (`active`) ou é bloqueado (`past_due`/`canceled`).
3. **Margem do Básico** é saudável (~R$30,90 lucro líquido por cliente acima do custo marginal,
   antes de considerar CAC/suporte), cobrindo parte dos fixos já com o primeiro cliente.
4. **Acesso ≠ cobrança**: plano/assinatura (`subscriptions`) independe do `tenants.status` de entrega.
5. **Dado é coletado em todos os planos** (tabela `events`); **só a análise avançada é gateada**
   por plano (Pro her histórico/export; Enterprise her infográficos de decisão).
6. **Diferencial real de topo** (evitar "golpe do mesmo"): Enterprise remove "powered by", pode
   ter domínio próprio, multi-usuário e suporte dedicado — algo visivelmente a mais.

### ⚠️ Ressalva honesta (sênior)
Os números acima tratam só do **custo técnico**. A margem nominal fica alta (476%–1651%) porque
o custo *marginal* multitenant é quase zero — mas isso **NÃO cobre** dois custos reais que precisam
entrar na conta antes de fechar preço:
- **CAC (custo de aquisição)** — cada cliente novo custa (anúncio, venda, onboarding manual).
- **Suporte não automatizado** — se o onboarding é manual, cada cliente consome horas no 1º mês.

Recomendação: **validar preços com clientes reais** e, se o onboarding for manual, absorver o
custo no Enterprise (que paga implementação dedicada), mantendo Básico/Pro como self-service.

### 🎯 Por que 5.000 aberturas de quiz NÃO disparam o custo (e o teto de plano protege você)
| Componente | Custo extra com 5k aberturas | Motivo |
|---|---|---|
| **Auth/MAU** | **R$ 0** | o quiz é **anônimo** — visitante não loga; não conta no MAU. |
| **Requests API** | ~R$ 0 | 5k × ~8 req = 40k req/mês → dentro do plano. |
| **Egress de imagem** | **~R$ 1,04/mês** | 5k visitas ≈ 2,1 GB/mês, muito abaixo do teto. |
| **Banco (R/W)** | ~R$ 0 | ~35k operações/mês — trivial p/ Postgres. |
| **Storage** | R$ 0 | catálogo fixo; não cresce por visita. |

**Conclusão (1 tenant):** 5 mil aberturas custam **centavos-reais** a mais. O custo variável
marginal é irrelevante diante da franquia do plano.

**Quando o custo passa a importar** (cenário real): **muitos clients de alto volume ao mesmo
tempo** — 100 clients × 5k = 500 mil visitas ≈ **215 GB/mês** de egress, que pode exceder a
franquia menor. É aqui que entra a proteção estrutural dos limites:

> **O `max_clicks_month` do plano é um teto de custo, não só um gatilho de upgrade.** O cliente
> de alto volume paga plano alto (Pro/Enterprise), cuja receita cobre em muito o egress extra
> que ele gera. Quem custa mais banda termina pagando mais caro — a cebola se autorregula.
>
> Estratégias complementares se o volume crescer: **CDN/optimização de imagem** para produtos e
> aceitar o overage de egress (ainda barato), + **cache** das perguntas/catálogo em memória.

---

## 9. Fases de implementação (roteiro)

### Fase 1 — Fundação multi-tenant (base sólida)
- [ ] Repo novo + Vite/React/TS/Tailwind + Supabase setup.
- [ ] Migrations: tabelas do item 4 (tenants, templates, conteúdo, tenant_products, leads, **plans, subscriptions, billing_events**) + RLS + triggers.
- [ ] Auth + roles (`admin`, `tenant_user`) + seed de planos + tenant de demonstração.
- [ ] Resolução de tenant por subdomínio `/f/:slug` + tema dinâmico (CSS vars) + estrutura de módulos.

### Fase 2 — Catálogo pré-criado + editor do funil (MVP: farmácia de manipulação)
- [ ] Template seed `farmacia-manipulacao`: categorias, ~8 perfis (com base científica), ~12 perguntas + opções.
- [ ] **Catálogo pré-criado** de ~15–20 produtos de manipulação, associados aos perfis (`template_profile_products`).
- [ ] Dashboard do tenant: **selecionar produtos + colar link de redirecionamento** por produto (`tenant_products`).
- [ ] Lista de produtos/perfis do tenant (imutáveis do template, apenas ativação + link + ordenação).

### Fase 3 — Funil público (motor + leads)
- [ ] Página do funil renderizada por tema do tenant.
- [ ] Motor de quiz (quizEngine genérico) + ResultCard dirigido por dados + ProductModal.
- [ ] Clique no produto → `redirect_url` (link de venda por produto).
- [ ] Gravação de `leads` + preview ao vivo no dashboard de aparência.

### Fase 4 — Dashboards e métricas
- [ ] Visão geral do tenant (leads, conversão, top perfil/produto mais clicado).
- [ ] Gestão de leads (status, export CSV).
- [ ] Admin: tenants, templates (perfis/perguntas/catálogo), analytics global.

### Fase 5 — Polimento e escala
- [ ] i18n, acessibilidade, performance de listas (paginação).
- [ ] Novo template para provar a máquina (ex.: aromaterapia = migração 1:1 do Candle).
- [ ] Modo avançado: importação TXT/JSON de produtos próprios do cliente (Edge Function futura).
- [ ] Planos/preço, billing (Stripe), testes E2E.

---

## 10. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| **Conteúdo de saúde = claims regulados (ANVISA)** | Tratar como "direcionamento de recomendação" e não diagnóstico; template com textos de disclaimer; revisão jurídica antes de escalar |
| **Cliente ativa produto que não vende / link quebrado** | Campo de redirecionar obrigatório + validação de URL; aviso de link faltando antes de publicar; opção de não ativar |
| **Redirecionar abre outro no admin (abuso de URL)** | Permissão de escrita restrita ao dono do tenant via RLS; link só navega `target="_blank"` com `rel="noopener"` |
| **Sobrecarga de contexto com muitos tenants** | RLS por `tenant_id` (não confiar só em UI); políticas testadas |
| **Perfomance de listas grandes (muitos produtos)** | Paginação, índices em `tenant_id`, produto mais clicado rastreado |
| **Código legado do Candle como base direta** | Repo novo; Candle vira referência de design, não código |

---

## 11. Próximos passos (ação após validação)

1. **Ter validação deste plano** (você) — ajustar pontos que divergirem da sua visão.
2. Eu crio o **repo novo** + aplico as **migrations** (Fase 1) e subo no Supabase.
3. Monto o **template seed de manipulação** + o **catálogo pré-criado** de produtos (Fase 2).
4. Seguimos fase a fase, validando a cada entrega.

> **Só começo a codificar após você validar este plano.** Nenhuma alteração foi feita em
> nenhum repositório; o Candle está intocado.