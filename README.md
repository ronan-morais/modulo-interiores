# Módulo Interiores — site Next.js

Site institucional de uma empresa de drywall, forros e pisos em Belo Horizonte, gerado a partir do arquivo `modulo.pen` (pen.dev).

## Stack

- Next.js 16 (App Router, React Server Components)
- TypeScript
- CSS puro (sem bibliotecas de UI)
- `next/font` com Fraunces, Hanken Grotesk e IBM Plex Mono
- Sem dependências de runtime além de React/Next

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

Os dados de contato, cidades atendidas e os seis serviços ficam em `lib/site.ts`. O formulário de orçamento monta a mensagem no navegador e abre o WhatsApp; o rascunho é salvo em `localStorage`. Não há backend nem envio de arquivos — as fotos são anexadas na conversa do WhatsApp.
