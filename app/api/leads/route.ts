import { NextResponse } from "next/server";

import { ensureSchema, getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint de sincronização para o agente (Ana / Hermes).
 *
 * GET /api/leads?desde=<id>&limite=<n>
 *   Authorization: Bearer $LEADS_API_TOKEN
 *
 * Devolve os pedidos de orçamento com id maior que `desde`, em ordem crescente,
 * para que o agente gere lista de material e avise o Ronan.
 */
function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function authorized(request: Request): boolean {
  const token = process.env.LEADS_API_TOKEN ?? process.env.LEADS_API_KEY;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "").trim();
  return provided.length > 0 && provided === token;
}

function parseServices(raw: unknown): { id: string; titulo: string }[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { id: string; titulo: string } =>
        Boolean(item) && typeof item.id === "string" && typeof item.titulo === "string",
      )
      .map((item) => ({ id: item.id, titulo: item.titulo }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Diagnóstico público: só revela se as variáveis existem, nunca o valor.
  if (url.searchParams.get("diag") === "1") {
    return NextResponse.json({
      token: Boolean(process.env.LEADS_API_TOKEN),
      key: Boolean(process.env.LEADS_API_KEY),
    });
  }

  if (!authorized(request)) return unauthorized();

  // Diagnóstico autenticado: últimos clientes criados (para conferir o vínculo).
  const vincular = Number(url.searchParams.get("vincular") ?? "0");
  if (Number.isInteger(vincular) && vincular > 0) {
    try {
      const { garantirClienteDoLead } = await import("@/lib/crm");
      const idCliente = await garantirClienteDoLead(vincular, "diagnostico");
      return NextResponse.json({ ok: true, cliente: idCliente });
    } catch (erro) {
      return NextResponse.json({ ok: false, erro: String(erro) }, { status: 500 });
    }
  }

  if (url.searchParams.get("clientes") === "1") {
    await ensureSchema();
    const rs = await getDb().execute({
      sql: "SELECT id, nome, whatsapp, email, observacoes FROM clientes ORDER BY id DESC LIMIT 10",
    });
    return NextResponse.json({ total: rs.rows.length, clientes: rs.rows });
  }

  const desdeParam = Number(url.searchParams.get("desde") ?? "0");
  const limiteParam = Number(url.searchParams.get("limite") ?? "20");
  const desde = Number.isFinite(desdeParam) && desdeParam > 0 ? Math.floor(desdeParam) : 0;
  const limite = Math.min(
    Math.max(Number.isFinite(limiteParam) ? Math.floor(limiteParam) : 20, 1),
    50,
  );

  try {
    await ensureSchema();
    const result = await getDb().execute({
      sql: `SELECT id, criado_em, nome, whatsapp, email, servicos, tipo_imovel,
                   area_m2, ambientes, cidade, bairro, prazo, detalhes, arquivo, origem
              FROM orcamentos
             WHERE id > ?
             ORDER BY id ASC
             LIMIT ?`,
      args: [desde, limite],
    });

    const leads = result.rows.map((row) => ({
      id: Number(row.id),
      criado_em: String(row.criado_em),
      nome: String(row.nome),
      whatsapp: row.whatsapp ? String(row.whatsapp) : null,
      email: row.email ? String(row.email) : null,
      servicos: parseServices(row.servicos),
      tipo_imovel: String(row.tipo_imovel),
      area_m2: row.area_m2 === null ? null : Number(row.area_m2),
      ambientes: row.ambientes === null ? null : Number(row.ambientes),
      cidade: String(row.cidade),
      bairro: row.bairro ? String(row.bairro) : null,
      prazo: String(row.prazo),
      detalhes: row.detalhes ? String(row.detalhes) : null,
      arquivo: row.arquivo ? String(row.arquivo) : null,
      origem: String(row.origem),
    }));

    return NextResponse.json(
      {
        leads,
        ultimo_id: leads.length > 0 ? leads[leads.length - 1].id : desde,
        tem_mais: leads.length === limite,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Falha ao listar leads", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}

/** DELETE /api/leads?id=NN — remove um pedido (Bearer LEADS_API_TOKEN). */
export async function DELETE(request: Request) {
  if (!authorized(request)) return unauthorized();
  const url = new URL(request.url);

  // limpeza de cliente de teste (mesmo token)
  const clienteId = Number(url.searchParams.get("cliente") ?? "0");
  if (Number.isInteger(clienteId) && clienteId > 0) {
    await ensureSchema();
    await getDb().execute({ sql: "DELETE FROM clientes WHERE id = ?", args: [clienteId] });
    return NextResponse.json({ ok: true, cliente: clienteId });
  }

  const id = Number(url.searchParams.get("id") ?? "0");
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "id invalido" }, { status: 400 });
  }
  try {
    await ensureSchema();
    await getDb().execute({ sql: `DELETE FROM orcamentos WHERE id = ?`, args: [id] });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Falha ao apagar lead", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
