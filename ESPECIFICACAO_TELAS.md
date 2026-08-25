# ESPECIFICAÇÃO DE TELAS — MagikFunil

> Descrição funcional de **todas as telas** do produto, organizada pelas 3 faces:
> **(1) PÚBLICO** (funil do visitante), **(2) DASHBOARD DO TENANT** (marca/cliente) e
> **(3) ADMIN** (nossa empresa).
>
> Cada tela descreve: **objetivo**, **elementos**, **fluxo**, **dados que alimentam** e
> **regras/condições**. Serve de guia direto para build e revisão.
>
> Status: ⏳ rascunho para validação. Nenhum commit.

---

# FACE 1 — PÚBLICO (o funil que o visitante navega)

> Rota: `/f/:slug` no domínio raiz OU `tenant.dominio.com` (subdomínio).
> Tema = cores/logo/textos do tenant. Conteúdo (perfis/perguntas/produtos) = template.

## 1.1 Landing (Hero do funil)

**Objetivo:** apresentar a marca do tenant e engajar o visitante a iniciar o quiz.

**Elementos:**
- Logo do tenant (topo, central)
- Título (`tenants.headline`) + subtítulo (`tenants.subheadline`)
- Botão CTA principal (`tenants.cta_text`, ex.: "Descobrir meu perfil")
- Link secundário (ex.: "Como funciona", âncora na página)
- Fundo temático do template (ex.: Fireflies do Candle, com a cor do tenant)
- Rodapé opcional (disclaimer de saúde, se template exige)

**Fluxo:**
1. Visitante acessa `tenant.dominio.com`.
2. Se o funil está `published` e o tenant `active` (e não bloqueado por pagamento) → Landing.
3. Clique em CTA → vai para `1.2 Quiz`.
4. Se o funil `draft` ou tenant inativo → tela de "em breve / indisponível" (1.8).

**Dados:** `tenants` (logo, headline, subheadline, cta_text, cores), `template` (layout/fundo).

**Regras:** botão CTA só redireciona se o tenant estiver ativo e com pagamento ok.

---

## 1.2 Quiz (jornada de direcionamento)

**Objetivo:** capturar o estado/sintoma/necessidade do visitante via perguntas de escolha única
e pontuar 1+ perfis por resposta.

**Elementos:**
- Barra de progresso ("Passo X/N")
- Pergunta atual (texto grande, serifado)
- 2 a 4 opções em cards (escolha única), cada uma pontua 1+ perfis
- Botão voltar (opcional)
- Transição animada entre perguntas

**Fluxo:**
1. Mostra pergunta 1 → opções → usuário seleciona → incrementa score dos `profile_ids` da opção.
2. Avança até a última pergunta.
3. Ao final → processa ranking (ver `quiz-engine`) → vai para `1.3 Resultado`.
4. Opções de saída: se o usuário abandonar no meio, não grava lead (callback se registrar).

**Dados:** `quiz_questions` + `quiz_options` do template (com `profile_ids`).

**Regras:** pontuação determinística (desempate por `name`); opção pode pontuar vários perfis.

---

## 1.3 Resultado / Jornada de convencimento

**Objetivo:** mostrar o perfil vencedor (e o runner-up) com a **base científica** que valida e
gera confiança, e listar os **produtos recomendados** com o link de redirecionamento.

**Elementos:**
- Perfil identificado (nome, arquétipo, cor do perfil)
- Base científica (`profiles.scientific_basis`) — o que "convence"
- Efeito esperado (`profiles.expected_effect`)
- Influencia secundária (runner-up, se houver)
- Lista de produtos recomendados (do catálogo ativado pelo tenant para aquele perfil)
  - cada produto: nome, descrição, botão "garantir/ver" → abre o modal (1.4)
- CTA de re-fazer análise

**Fluxo:**
1. Renderiza o winner + runner-up.
2. Busca produtos = interseção de `template_profile_products[winner]` ∩ `tenant_products[enabled]`.
3. Ao final do resultado → **grava lead** (1.5) com winner, runner-up, answers, source_url.
4. Clique num produto → modal `1.4`.

**Dados:** `profiles`, `template_profile_products`, `products`, `tenant_products` (redirect_url).

**Regras:** se o tenant não ativou nenhum produto para o perfil vencedor, mostra mensagem
"fale conosco" e sugere o runner-up.

---

## 1.4 Modal de Produto (com link de redirecionamento)

**Objetivo:** detalhar o produto e direcionar o visitante ao **link de venda real do tenant**.

**Elementos:**
- Imagem do produto (`products.image_url`)
- Nome + categoria
- Descrição/benefício
- Notas/composição (se aplicável)
- Botão CTA principal → `<a href={tenant_products.redirect_url}>` (abre em nova aba, `rel="noopener"`)
- Botão fechar (X)

**Fluxo:**
1. Abre modal para o produto clicado no resultado.
2. Botão CTA abre o `redirect_url` do tenant (loja/WhatsApp/catálogo).
3. Ao clicar → grava evento de clique no lead (rastreamento de conversão).

**Dados:** `products`, `tenant_products.redirect_url`.

**Regras:** `redirect_url` obrigatório (validação no dashboard); pega `target="_blank"`.

---

## 1.5 Captura de Lead (implícita na jornada)

**Objetivo:** registrar quem completou o quiz e o que escolheu, sem formulário forçado.

**Elementos:** nenhum visível ao usuário — é o registro no banco no fim do fluxo.

**Fluxo:**
- No fim do `1.3`, insere em `leads`: `tenant_id`, `winning_profile`, `secondary_profile`,
  `answers` (JSON), `source_url`.
- Cada clique em produto (1.4) atualiza o lead com o clique/`redirect_url`.

**Dados:** `leads`, `billing_events` (não), `tenant_products`.

**Regras:** gravação automática; dados de identificação (nome/phone) podem vir de um passo
adicional opcional futuramente, mas no MVP é anônimo + rastreado por clique.

---

## 1.6 (Futuro) Captura explícita / micro-conteúdo
> Reservado: formulário curto (nome/telefone/whatsapp) como passo opcional extra antes do resultado,
> ou gerador de PDF/roteiro. Não entra no MVP.

---

## 1.7 (Futuro) Multi-funis por template
> Reservado: um tenant pode ter várias landing pages/páginas de destino. Não entra no MVP.

---

## 1.8 Página "em breve / indisponível"

**Objetivo:** avisar quando o funil não está no ar.

**Elementos:**
- Logo do tenant
- Mensagem ("Estamos preparando uma experiência para você")
- Opcional: botão contato (WhatsApp do tenant)

**Dispara quando:** funil `draft` OU tenant `paused`/`blocked` (pagamento vencido).

---

# FACE 2 — DASHBOARD DO TENANT (marca/cliente)

> Rota: `/dashboard`. Requer login com role `tenant_user` vinculado a um tenant.
> Tema do dashboard é neutro (nossa marca), não o do tenant.

## 2.1 Auth / Onboarding

**Objetivo:** login e primeiro acesso do cliente da marca.

**Telas:**
- **Login** — email + senha (Supabase Auth).
- **Criar conta** — email, senha, nome da marca.
- **Onboarding** (guia, primeira vez):
  1. Escolher **template** (ex.: "Farmácia de Manipulação").
  2. Definir identidade básica (nome da marca, slug do subdomínio).
  3. (Aparência é configurável depois, na 2.6)

**Fluxo:**
1. Novo usuário se registra → cria `tenant` + `subscriptions` (plano trial) + `tenant_templates`.
2. Um usuário = um tenant (pro caso mantendo simples no MVP; multi-usuário por tenant fica futuro).
3. Após onboarding → leva para `2.2 Overview`.

**Dados:** `tenants`, `tenant_templates`, `subscriptions`, `plans`.

**Regras:** slug do subdomínio único; trial ativo automaticamente no plano Free/pro padrão.

---

## 2.2 Visão Geral (Overview / métricas)

**Objetivo:** mostrar ao cliente a saúde do funil dele.

**Elementos (cards/KPIs):**
- Total de leads
- Conversão do quiz (visualizações → leads → cliques)
- Perfil mais vendido/mais comum
- Produto mais clicado (top 3)
- Últimos leads (5)
- Status do plano + aviso de trial/pagamento pendente
- Status da publicação (draft/published + link)

**Fluxo:** ao logar, carrega métricas agregadas do `tenant_id` dos últimos 30 dias.

**Dados:** `leads`, `products/tenant_products` (cliques), `subscriptions`.

**Regras:** se trial prestes a expirar → banner de upgrade.

---

## 2.3 Produtos (ativar + link de redirecionamento)

**Objetivo:** o cliente escolhe, do **catálogo pré-criado**, quais produtos exibir no funil e
cola o **link de venda** de cada um.

**Elementos:**
- Busca no catálogo
- Lista do catálogo com toggle "ativar/desativar"
- Para cada ativado: campo `redirect_url` (obrigatório)
- Reordenar produtos ativados
- Indicador de limite do plano (`max_products`)

**Fluxo:**
1. Lista produtos do catálogo do template.
2. Cliente ativa; se não houver `tenant_products` ainda, cria; se desativar, `enabled=false`.
3. Cola link; valida URL; salva.
4. Ordenação define a ordem de exibição no resultado (1.3).

**Dados:** `products` + `template_profile_products` (só leitura), `tenant_products` (leitura/escrita),
`plans.max_products`.

**Regras:** não pode ativar mais que `max_products` do plano; `redirect_url` obrigatório para publicar.

---

## 2.4 Leads (lista / status / export)

**Objetivo:** o cliente acompanha quem chegou ao resultado e clicou em produtos.

**Elementos:**
- Tabela de leads (data, perfil vencedor, produto clicado, status)
- Filtros (por data, perfil, status)
- Mudança de status (new → contact → won → lost)
- Botão exportar CSV
- Ver detalhe de um lead (respostas do quiz em JSON)

**Dados:** `leads` (por `tenant_id`), `profiles`, `tenant_products`.

**Regras:** RLS garante que cada tenant só vê os próprios leads.

---

## 2.5 Aparência / Personalização de Visual

**Objetivo:** o cliente customiza a identidade visual do funil (não o conteúdo).

**Elementos:**
- Logo (upload → Storage)
- Cor primária / secundária / acento (color pickers)
- Headline / subheadline / CTA text (textos)
- Preview ao vivo do funil (skeleton renderizado com os dados atuais)
- Botão salvar

**Fluxo:** altera → preview atualiza em tempo real → salvar → `tenants` atualizado → visível no público.

**Dados:** `tenants` (logo_url, colors, headline, subheadline, cta_text).

**Regras:** só dados de `tenants` (visual); nada de perguntas/perfis/produtos editável aqui.

---

## 2.6 Publicação

**Objetivo:** subir / descer o funil e copiar o link do subdomínio.

**Elementos:**
- Status (draft/published) com toggle
- Link do funil (`tenant.dominio.com`) com botão copiar
- Validação: se produtos ativos sem `redirect_url`, avisa que não pode publicar
- Se plano com `custom_domain`: campo de domínio próprio (futuro)

**Dados:** `tenant_templates.status`, `tenants`.

---

## 2.7 Assinatura / Plano (dashboard do tenant)

**Objetivo:** o cliente vê e gerencia seu plano (trial, upgrade, status de pagamento).

**Elementos:**
- Plano atual + preço
- Uso atual vs limite (leads/mês, produtos)
- Data de término do período
- Status do pagamento (active/past_due/canceled)
- Botão upgrade / gerenciar pagamento

**Dados:** `subscriptions`, `plans`, `billing_events`.

**Regras:** acesso é independente da cobrança — um tenant `past_due` pode ver o dashboard e
regularizar; pode também ter o funil bloqueado (`tenants.status=blocked`) até regularizar.

---

## 2.8 Configuração (tenant)

**Objetivo:** dados da conta da marca.

**Elementos:**
- Nome da marca, slug do subdomínio
- Email de contato / WhatsApp
- Usuário do dashboard (trocar senha, logout)

**Dados:** `tenants`, Supabase Auth (usuário).

---

# FACE 3 — ADMIN (nossa empresa)

> Rota: `/admin`. Requer role `admin`. Tema neutro (nossa marca).

## 3.1 Auth admin

**Objetivo:** entrada segura para a nossa equipe.

**Elementos:** login Supabase Auth com role `admin`.

---

## 3.2 Tenants (gestão de marcas)

**Objetivo:** CRUD e controle de todas as marcas que usam a plataforma.

**Elementos:**
- Tabela de tenants (nome, subdomínio, plano, status entrega, status pagamento)
- Ações: ativar/pausar/suspender, mudar plano manualmente, verno overview do tenant
- Criar tenant manualmente (pré-configurar para um cliente que fechou contrato)
- Filtros/busca

**Dados:** `tenants`, `subscriptions`, `plans`.

**Regras:** pode mudar `tenants.status` (entrega) independente de `subscriptions.status` (cobrança).

---

## 3.3 Templates (o cérebro do produto)

**Objetivo:** criar/editar os funis que vendemos — perguntas, perfis, catálogo, associação.

**Elementos:**
- Lista de templates
- Editor:
  - **Perfis**: nome, arquétipo, base científica, efeito esperado, cor (CRUD)
  - **Perguntas**: texto + ordem (CRUD)
  - **Opções**: texto + `profile_ids` que pontua (CRUD)
  - **Catálogo de produtos**: nome, descrição, categoria, imagem (CRUD)
  - **Associação perfil↔produto**: selecionar produtos e prioridade por perfil

**Dados:** `templates`, `profiles`, `quiz_questions`, `quiz_options`, `products`, `template_profile_products`.

**Regras:** mudanças num template valem para todos os tenants que o usam (herdado). Se um tenant
já ativou um produto que você removeu do catálogo, ele deixa de aparecer.

---

## 3.4 Planos / Assinaturas / Billing (admin)

**Objetivo:** gerenciar monetização: planos e status financeiro dos tenants.

**Elementos:**
- CRUD de planos (preço, limites, trial_days, custom_domain)
- Tabela de assinaturas (tenant, plano, status, período, provider)
- Eventos de billing (billing_events) — histórico de cada assinatura
- Faturamento: em modo `manual` primeiro; acoplar Stripe depois

**Dados:** `plans`, `subscriptions`, `billing_events`.

**Regras:** provedor `manual` → a nossa equipe marca o status; provedor `stripe` futuro automatiza.

---

## 3.5 Catálogo global de produtos

> Visão consolidada dos produtos de **todos** os templates (reuso entre nichos).

**Objetivo:** gerir a biblioteca de produtos que alimenta os templates.

**Elementos:** CRUD de produtos com multiseleção de templates + associação a perfis.

**Dados:** `products`, `template_profile_products`.

---

## 3.6 Leads globais / Analytics

**Objetivo:** métricas agregadas de toda a plataforma.

**Elementos:**
- Leads por tenant (ranking)
- Conversão por template
- Top de produtos clicados (global)
- Receita estimada (assinaturas ativas × preço)

**Dados:** `leads`, `subscriptions`, `plans`, `billing_events`.

---

## 3.7 Configuração do sistema (admin)

**Objetivo:** parâmetros globais da plataforma.

**Elementos:**
- Domínio raiz (base do subdomínio)
- Usuários da nossa equipe (admin) — convite/remoção
- Chaves/Storage/config
- (Futuro) branding, SMTP, webhooks

---

# RESUMO — Inventário de telas

| Nº | Face | Tela |
|---|---|---|
| 1.1 | Público | Landing (Hero) |
| 1.2 | Público | Quiz |
| 1.3 | Público | Resultado / Jornada |
| 1.4 | Público | Modal de produto (link) |
| 1.5 | Público | Captura de lead (implícita) |
| 1.8 | Público | Em breve / indisponível |
| 2.1 | Tenant | Auth / Onboarding |
| 2.2 | Tenant | Visão geral (métricas) |
| 2.3 | Tenant | Produtos (ativar + link) |
| 2.4 | Tenant | Leads (lista/status/export) |
| 2.5 | Tenant | Aparência (visual) |
| 2.6 | Tenant | Publicação |
| 2.7 | Tenant | Assinatura / Plano |
| 2.8 | Tenant | Configuração |
| 3.1 | Admin | Auth |
| 3.2 | Admin | Tenants |
| 3.3 | Admin | Templates (perfis/quiz/catálogo) |
| 3.4 | Admin | Planos / Assinaturas / Billing |
| 3.5 | Admin | Catálogo global |
| 3.6 | Admin | Leads globais / Analytics |
| 3.7 | Admin | Configuração do sistema |

**Legenda do status:** MVP → 1.1–1.5, 1.8, 2.1–2.8, 3.1–3.4.
Futuro → 1.6, 1.7, 3.5 a 3.7 (podem entrar conforme a demanda).