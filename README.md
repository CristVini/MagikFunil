# MAGIKFUNIL

**Motor de funis whitelabel** — plataforma multi-tenant para criar e hospedar funis de
recomendação com base científica. Cada cliente (tenant) escolhe um template de funil,
customiza o **visual** (cor, logo, textos) e cola **links de redirecionamento por produto**
para a própria loja — sem escrever código.

O formato segue o Candle ([CristVini/Candle](https://github.com/CristVini/Candle)): o
visitante é levado por uma **jornada de convencimento** (quiz → perfil → fundamento
científico → recomendação) e o clique final no produto **redireciona pro link de venda real**
do cliente, com o lead capturado.

## MVP

Funil para **farmácia de manipulação**: catálogo de produtos pré-criado pela nossa empresa,
associado a perfis de recomendação. O cliente ativa produtos da lista e cola o link de cada
um.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + RLS + Storage)
- Deploy: Vercel

## Estrutura

- `PLANO_TECNICO.md` → plano técnico completo e schema do banco

## Status

Em validação do plano (fase de fundação). Veja `PLANO_TECNICO.md` para o roteiro.