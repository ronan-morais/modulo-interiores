# Módulo Interiores — site Next.js

Site institucional de uma empresa de drywall, forros e pisos em Belo Horizonte, gerado a partir do arquivo `modulo.pen` (pen.dev).

## Stack

- Next.js 16 (App Router, React Server Components)
- TypeScript
- CSS puro (sem bibliotecas de UI)
- `next/font` com Fraunces, Hanken Grotesk e IBM Plex Mono
- Sem dependências de runtime além de React/Next

## Estrutura da home

- Hero com uma oferta e uma ação principal: orçamento em 1 dia útil.
- Faixa de compromissos (equipe própria, prazo, medição sem custo, garantia).
- Grade dos seis serviços, tirada de `lib/site.ts`, com link para a página de detalhes.
- Faixa de manutenção (reparo pontual, troca de placas e revisão de acabamento) com WhatsApp direto.
- Três diferenciais da obra a seco, o processo em três etapas e um único CTA final.
- Detalhes de material, aplicação e manutenção ficam em `/servicos`, para não competir com o CTA da home.

## Movimento e interação

- `components/Reveal.tsx` observa os blocos `[data-reveal]` e revela cada um ao entrar na tela; elementos acima da dobra aparecem já visíveis e o atraso vem de `--reveal-delay`.
- Hero com entrada em cascata, zoom lento na imagem e header que ganha sombra ao rolar (sticky apenas acima de 1180px).
- Hover com zoom de imagem nos cards de serviço, sublinhado animado no menu e seta que desloca nos botões.
- `[data-reveal-pending]` só é aplicado depois da hidratação: sem JavaScript o conteúdo continua visível. Com `prefers-reduced-motion: reduce` tudo aparece de imediato e as transições são desligadas.

## Banco de dados (Turso)

O formulário de `/orcamento` grava cada pedido na tabela `orcamentos` (Turso/libSQL) pela rota `POST /api/orcamentos`; o envio é a própria gravação, sem abrir WhatsApp ou e-mail. A tabela e o índice são criados na primeira gravação por `lib/db.ts`; não há passo de migração.

Variáveis de ambiente (Vercel → Settings → Environment Variables, ou integração Turso):

- `TURSO_DATABASE_URL` — `libsql://…` em produção; `file:./.data/orcamentos.db` em desenvolvimento.
- `TURSO_AUTH_TOKEN` — token do banco (vazio quando a URL é um arquivo local).

Criar o banco e o token:

```bash
turso db create modulo-interiores
turso db show modulo-interiores --url
turso db tokens create modulo-interiores
```

Conferir os pedidos recebidos:

```bash
turso db shell modulo-interiores "select id, criado_em, nome, whatsapp, tipo_imovel, area_m2, ambientes, servicos from orcamentos order by id desc limit 20"
```

Se a gravação falhar, o formulário permanece na tela com a mensagem de erro e o pedido pode ser reenviado.

## CRM (/crm)

Área restrita para administrar os contatos recebidos em `/orcamento`. O login usa `ADMIN_USER` e `ADMIN_PASSWORD`; a sessão é um cookie httpOnly de 7 dias assinado com `CRM_SESSION_SECRET` e restrito ao caminho `/crm`.

- Lista com filtro por status (novo, em contato, orçado, ganho, perdido), busca por nome/telefone/e-mail/cidade e contagem por etapa.
- Detalhe do contato com todos os dados do pedido, alteração de status, anotações e exclusão.
- Páginas com `noindex` e `/crm` bloqueado no `robots.txt`.
- As colunas `status`, `notas` e `atualizado_em` são adicionadas à tabela `orcamentos` na primeira leitura (`lib/crm.ts`), sem migração manual.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

Build de produção:

```bash
npm run build
npm start
```

## Publicação

- Repositório: <https://github.com/ronan-morais/modulo-interiores> (privado)
- Produção: <https://modulo-interiores.vercel.app>

O projeto Vercel `modulo-interiores` está conectado ao repositório: cada push na `main` publica em produção. `NEXT_PUBLIC_SITE_URL` está definida em Production como `https://modulo-interiores.vercel.app`, valor usado em canonical, sitemap, robots e Open Graph.

Ao apontar um domínio próprio (por exemplo `modulointeriores.com.br`), atualize `NEXT_PUBLIC_SITE_URL` nas variáveis de ambiente do projeto e refaça o deploy — caso contrário o canonical continua apontando para o endereço `vercel.app`.

Deploy manual pela CLI:

```bash
npx vercel --prod
```

## SEO implementado

- `metadataBase`, títulos e descrições únicos por página, canonical e Open Graph/Twitter.
- `app/sitemap.ts` e `app/robots.ts` gerados no build.
- JSON-LD de `LocalBusiness`/`HomeAndConstructionBusiness`, catálogo de serviços, `WebSite`, `BreadcrumbList` e `ContactPage`.
- HTML semântico com um único `h1` por página, `lang="pt-BR"` e textos alternativos descritivos.
- Imagens locais em WebP, dimensões estáveis e `next/image` com prioridade apenas no hero.
- Fontes servidas pelo próprio domínio via `next/font` (sem requisições ao Google em runtime).
- Sem JavaScript de terceiros, analytics ou cookies.

## Conteúdo e contato

Os dados de contato (telefone e WhatsApp: (31) 99740-8629), cidades atendidas e os seis serviços ficam em `lib/site.ts`, junto com a lista `advantages` da seção "Por que obra a seco" e o objeto `maintenance` (a sétima oferta, também disponível no formulário de orçamento via `quoteOptions`). O formulário de orçamento envia os dados para `POST /api/orcamentos` e a equipe responde pelo WhatsApp ou e-mail informado; o rascunho é salvo em `localStorage`. As fotos não são enviadas ao servidor — o contato informado serve para combinar o envio.
