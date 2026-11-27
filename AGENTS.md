<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Lista de material — engine única (27/11/2026)

- Toda lista de material sai de `lib/material-quantidades.ts` (regras `auto | area | comprimento | perimetro | fixo` + fator por m²/m).
- Templates ficam no banco (`sistemas_material` + `materiais_template`), editáveis em `/crm/calculadora`.
- `lib/lead-material.ts` só mapeia serviço do site → sistema; não tem coeficiente próprio.
- Preços vêm de `lib/coeficientes.json` (mesma tabela do motor Python em `modulo/orcamento`).
- Mudou template padrão? Subir `SEED_VERSAO` em `lib/material-templates-db.ts` (re-semeia uma vez).
- Prévia sem login: `GET /api/materiais?servico=<id>&area=<m²>` com Bearer do LEADS_API_TOKEN.

